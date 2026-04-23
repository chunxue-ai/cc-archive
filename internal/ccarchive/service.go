package ccarchive

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
)

const (
	appName              = "cc-archive"
	exportSource         = "claude-code-local"
	exportSchemaVersion  = "1.0"
	exportIDTimeLayout   = "20060102T150405Z"
	iso8601Layout        = time.RFC3339
	directoryPermissions = 0o700
	filePermissions      = 0o600
	maxWarningCount      = 12
	maxScannerLineSize   = 16 * 1024 * 1024
)

type Service struct {
	nowUTC func() time.Time
}

func NewService() *Service {
	return &Service{
		nowUTC: func() time.Time {
			return time.Now().UTC()
		},
	}
}

func (s *Service) GetStorageInfo() (StorageInfo, error) {
	archiveRoot, err := resolveArchiveRoot()
	if err != nil {
		return StorageInfo{}, err
	}

	claudeProjectsDir, err := resolveClaudeProjectsDir()
	if err != nil {
		return StorageInfo{}, err
	}

	return StorageInfo{
		ArchiveRoot:       archiveRoot,
		ExportsRoot:       filepath.Join(archiveRoot, "exports"),
		ClaudeProjectsDir: claudeProjectsDir,
	}, nil
}

func (s *Service) ScanClaudeCodeSessions() (ScanResult, error) {
	info, err := s.GetStorageInfo()
	if err != nil {
		return ScanResult{}, err
	}

	records, warnings, err := scanSessionRecords(info.ClaudeProjectsDir)
	if err != nil {
		return ScanResult{}, err
	}

	sessions := make([]ClaudeCodeSession, 0, len(records))
	var totalBytes int64

	for _, record := range records {
		sessions = append(sessions, record.session)
		totalBytes += record.session.SizeBytes
	}

	return ScanResult{
		Storage:       info,
		Sessions:      sessions,
		TotalSessions: len(sessions),
		TotalBytes:    totalBytes,
		ScannedAt:     s.nowUTC().Format(iso8601Layout),
		Warnings:      warnings,
	}, nil
}

func (s *Service) DryRunClaudeCodeExport(req ExportRequest) (DryRunResult, error) {
	info, err := s.GetStorageInfo()
	if err != nil {
		return DryRunResult{}, err
	}

	selectedSessions, warnings, err := s.selectSessions(req)
	if err != nil {
		return DryRunResult{}, err
	}

	exportID := buildExportID(s.nowUTC())
	exportRoot, err := resolveExportRoot(req.DestinationRoot, info.ExportsRoot)
	if err != nil {
		return DryRunResult{}, err
	}

	var totalBytes int64
	for _, session := range selectedSessions {
		totalBytes += session.SizeBytes
	}

	return DryRunResult{
		Storage:           info,
		PlannedExportID:   exportID,
		PlannedExportPath: filepath.Join(exportRoot, exportID),
		SessionCount:      len(selectedSessions),
		TotalBytes:        totalBytes,
		GeneratedAt:       s.nowUTC().Format(iso8601Layout),
		Warnings:          warnings,
	}, nil
}

func (s *Service) ExportClaudeCodeSessions(req ExportRequest) (ExportResult, error) {
	info, err := s.GetStorageInfo()
	if err != nil {
		return ExportResult{}, err
	}

	selectedSessions, warnings, err := s.selectSessions(req)
	if err != nil {
		return ExportResult{}, err
	}

	exportRoot, err := resolveExportRoot(req.DestinationRoot, info.ExportsRoot)
	if err != nil {
		return ExportResult{}, err
	}

	if err := os.MkdirAll(exportRoot, directoryPermissions); err != nil {
		return ExportResult{}, fmt.Errorf("create export root: %w", err)
	}

	exportID := buildExportID(s.nowUTC())
	exportPath := filepath.Join(exportRoot, exportID)
	if err := os.MkdirAll(exportPath, directoryPermissions); err != nil {
		return ExportResult{}, fmt.Errorf("create export directory: %w", err)
	}

	success := false
	defer func() {
		if !success {
			_ = os.RemoveAll(exportPath)
		}
	}()

	manifest := ExportManifest{
		SchemaVersion:     exportSchemaVersion,
		CreatedBy:         appName,
		Source:            exportSource,
		ExportID:          exportID,
		CreatedAt:         s.nowUTC().Format(iso8601Layout),
		HostOS:            runtime.GOOS,
		ClaudeProjectsDir: info.ClaudeProjectsDir,
		Notes: []string{
			"This export captures local Claude Code session files.",
			"Importing chat history to another Claude account is not officially supported.",
		},
	}

	checksumLines := make([]string, 0, len(selectedSessions))
	for _, session := range selectedSessions {
		archiveRelativePath := filepath.ToSlash(filepath.Join("claude-code", "projects", session.RelativePath))
		archiveAbsolutePath, err := safeJoin(exportPath, archiveRelativePath)
		if err != nil {
			return ExportResult{}, err
		}

		if err := os.MkdirAll(filepath.Dir(archiveAbsolutePath), directoryPermissions); err != nil {
			return ExportResult{}, fmt.Errorf("create session directory: %w", err)
		}

		sizeBytes, sha256Hex, err := copyFileWithSHA256(session.SourcePath, archiveAbsolutePath)
		if err != nil {
			return ExportResult{}, fmt.Errorf("export session %q: %w", session.Key, err)
		}

		manifest.Items = append(manifest.Items, ExportManifestItem{
			Key:                session.Key,
			SessionID:          session.SessionID,
			ProjectKey:         session.ProjectKey,
			RelativeSourcePath: session.RelativePath,
			ArchivePath:        archiveRelativePath,
			SizeBytes:          sizeBytes,
			MessageCount:       session.MessageCount,
			UpdatedAt:          session.UpdatedAt,
			SHA256:             sha256Hex,
		})
		manifest.TotalBytes += sizeBytes
		checksumLines = append(checksumLines, fmt.Sprintf("%s  %s", sha256Hex, archiveRelativePath))
	}

	manifest.SessionCount = len(manifest.Items)
	sort.Slice(manifest.Items, func(i, j int) bool {
		return manifest.Items[i].Key < manifest.Items[j].Key
	})
	sort.Strings(checksumLines)

	manifestPath := filepath.Join(exportPath, "manifest.json")
	if err := writeJSONAtomic(manifestPath, manifest); err != nil {
		return ExportResult{}, fmt.Errorf("write manifest: %w", err)
	}

	checksumsPath := filepath.Join(exportPath, "checksums.sha256")
	if err := writeTextAtomic(checksumsPath, strings.Join(checksumLines, "\n")+"\n"); err != nil {
		return ExportResult{}, fmt.Errorf("write checksums: %w", err)
	}

	success = true

	return ExportResult{
		Storage:          info,
		ExportID:         exportID,
		ExportPath:       exportPath,
		ManifestPath:     manifestPath,
		ChecksumsPath:    checksumsPath,
		ExportedSessions: manifest.SessionCount,
		ExportedBytes:    manifest.TotalBytes,
		CreatedAt:        manifest.CreatedAt,
		Warnings:         warnings,
	}, nil
}

func (s *Service) ListClaudeCodeExportPaths() ([]string, error) {
	info, err := s.GetStorageInfo()
	if err != nil {
		return nil, err
	}

	entries, err := os.ReadDir(info.ExportsRoot)
	if errors.Is(err, fs.ErrNotExist) {
		return []string{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("read exports root: %w", err)
	}

	exportPaths := make([]string, 0, len(entries))
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		exportPath := filepath.Join(info.ExportsRoot, entry.Name())
		manifestPath := filepath.Join(exportPath, "manifest.json")
		if _, err := os.Stat(manifestPath); err == nil {
			exportPaths = append(exportPaths, exportPath)
			continue
		} else if errors.Is(err, fs.ErrNotExist) {
			continue
		} else {
			return nil, fmt.Errorf("inspect export manifest for %q: %w", exportPath, err)
		}
	}

	sort.Slice(exportPaths, func(i, j int) bool {
		return filepath.Base(exportPaths[i]) > filepath.Base(exportPaths[j])
	})

	return exportPaths, nil
}

func (s *Service) RestoreClaudeCodeSessions(req RestoreRequest) (RestoreResult, error) {
	exportPath := strings.TrimSpace(req.ExportPath)
	if exportPath == "" {
		return RestoreResult{}, errors.New("exportPath is required")
	}

	absoluteExportPath, err := filepath.Abs(exportPath)
	if err != nil {
		return RestoreResult{}, fmt.Errorf("resolve export path: %w", err)
	}

	info, err := s.GetStorageInfo()
	if err != nil {
		return RestoreResult{}, err
	}

	manifestPath := filepath.Join(absoluteExportPath, "manifest.json")
	manifest, err := readManifest(manifestPath)
	if err != nil {
		return RestoreResult{}, err
	}

	if err := os.MkdirAll(info.ClaudeProjectsDir, directoryPermissions); err != nil {
		return RestoreResult{}, fmt.Errorf("create Claude projects directory: %w", err)
	}

	result := RestoreResult{
		Storage:         info,
		ExportID:        manifest.ExportID,
		ExportPath:      absoluteExportPath,
		DryRun:          req.DryRun,
		PlannedSessions: len(manifest.Items),
		RestoredAt:      s.nowUTC().Format(iso8601Layout),
	}

	warnings := newWarningCollector(maxWarningCount)

	for _, item := range manifest.Items {
		archiveAbsolutePath, err := safeJoin(absoluteExportPath, item.ArchivePath)
		if err != nil {
			return RestoreResult{}, fmt.Errorf("invalid archive path for %q: %w", item.Key, err)
		}

		destinationPath, err := safeJoin(info.ClaudeProjectsDir, item.RelativeSourcePath)
		if err != nil {
			return RestoreResult{}, fmt.Errorf("invalid destination path for %q: %w", item.Key, err)
		}

		if _, err := os.Stat(destinationPath); err == nil && !req.Overwrite {
			result.SkippedSessions++
			result.Conflicts = append(result.Conflicts, item.RelativeSourcePath)
			continue
		}

		if req.DryRun {
			result.RestoredSessions++
			continue
		}

		if err := os.MkdirAll(filepath.Dir(destinationPath), directoryPermissions); err != nil {
			return RestoreResult{}, fmt.Errorf("create restore directory: %w", err)
		}

		_, sha256Hex, err := copyFileWithSHA256(archiveAbsolutePath, destinationPath)
		if err != nil {
			return RestoreResult{}, fmt.Errorf("restore %q: %w", item.Key, err)
		}

		if item.SHA256 != "" && sha256Hex != item.SHA256 {
			warnings.Addf("checksum mismatch for %q after restore", item.RelativeSourcePath)
		}
		result.RestoredSessions++
	}

	result.Warnings = warnings.Items()
	return result, nil
}

type sessionRecord struct {
	session   ClaudeCodeSession
	updatedAt time.Time
}

func (s *Service) selectSessions(req ExportRequest) ([]ClaudeCodeSession, []string, error) {
	scanResult, err := s.ScanClaudeCodeSessions()
	if err != nil {
		return nil, nil, err
	}

	records := scanResult.Sessions
	includeAll := req.IncludeAll || len(req.SessionKeys) == 0
	if includeAll {
		return records, scanResult.Warnings, nil
	}

	byKey := make(map[string]ClaudeCodeSession, len(records))
	for _, session := range records {
		byKey[session.Key] = session
	}

	selected := make([]ClaudeCodeSession, 0, len(req.SessionKeys))
	warnings := newWarningCollector(maxWarningCount)
	for _, key := range req.SessionKeys {
		key = strings.TrimSpace(key)
		if key == "" {
			continue
		}

		session, ok := byKey[key]
		if !ok {
			warnings.Addf("session key not found: %s", key)
			continue
		}
		selected = append(selected, session)
	}

	if len(selected) == 0 {
		return nil, nil, errors.New("no Claude Code sessions selected for export")
	}

	return selected, append(scanResult.Warnings, warnings.Items()...), nil
}

func scanSessionRecords(projectsRoot string) ([]sessionRecord, []string, error) {
	info, err := os.Stat(projectsRoot)
	if errors.Is(err, fs.ErrNotExist) {
		return nil, []string{
			fmt.Sprintf("Claude Code projects directory not found: %s", projectsRoot),
		}, nil
	}
	if err != nil {
		return nil, nil, fmt.Errorf("stat Claude projects directory: %w", err)
	}
	if !info.IsDir() {
		return nil, nil, fmt.Errorf("Claude projects path is not a directory: %s", projectsRoot)
	}

	warnings := newWarningCollector(maxWarningCount)
	records := make([]sessionRecord, 0, 64)

	err = filepath.WalkDir(projectsRoot, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			warnings.Addf("unable to inspect %s: %v", path, walkErr)
			return nil
		}
		if entry.IsDir() {
			return nil
		}
		if strings.ToLower(filepath.Ext(entry.Name())) != ".jsonl" {
			return nil
		}

		entryInfo, err := entry.Info()
		if err != nil {
			warnings.Addf("unable to stat %s: %v", path, err)
			return nil
		}

		relativePath, err := filepath.Rel(projectsRoot, path)
		if err != nil {
			warnings.Addf("unable to relativize %s: %v", path, err)
			return nil
		}
		relativePath = filepath.Clean(relativePath)

		messageCount, err := countJSONLLines(path)
		if err != nil {
			messageCount = -1
			warnings.Addf("unable to count messages in %s: %v", relativePath, err)
		}

		projectKey := extractProjectKey(relativePath)
		sessionID := strings.TrimSuffix(filepath.Base(relativePath), filepath.Ext(relativePath))

		records = append(records, sessionRecord{
			session: ClaudeCodeSession{
				Key:          filepath.ToSlash(relativePath),
				SessionID:    sessionID,
				ProjectKey:   projectKey,
				RelativePath: relativePath,
				SourcePath:   path,
				SizeBytes:    entryInfo.Size(),
				MessageCount: messageCount,
				UpdatedAt:    entryInfo.ModTime().UTC().Format(iso8601Layout),
			},
			updatedAt: entryInfo.ModTime(),
		})
		return nil
	})
	if err != nil {
		return nil, nil, fmt.Errorf("walk Claude projects directory: %w", err)
	}

	sort.Slice(records, func(i, j int) bool {
		if records[i].updatedAt.Equal(records[j].updatedAt) {
			return records[i].session.Key < records[j].session.Key
		}
		return records[i].updatedAt.After(records[j].updatedAt)
	})

	return records, warnings.Items(), nil
}

func resolveArchiveRoot() (string, error) {
	if configured := strings.TrimSpace(os.Getenv("CC_ARCHIVE_HOME")); configured != "" {
		return filepath.Abs(configured)
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("resolve home directory: %w", err)
	}
	return filepath.Join(homeDir, ".cc-archive"), nil
}

func resolveClaudeProjectsDir() (string, error) {
	if configured := strings.TrimSpace(os.Getenv("CLAUDE_CONFIG_DIR")); configured != "" {
		return filepath.Abs(filepath.Join(configured, "projects"))
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("resolve home directory: %w", err)
	}
	return filepath.Join(homeDir, ".claude", "projects"), nil
}

func resolveExportRoot(destinationRoot, defaultRoot string) (string, error) {
	if strings.TrimSpace(destinationRoot) == "" {
		return defaultRoot, nil
	}
	return filepath.Abs(destinationRoot)
}

func extractProjectKey(relativePath string) string {
	parts := strings.Split(filepath.ToSlash(relativePath), "/")
	if len(parts) == 0 {
		return ""
	}
	return parts[0]
}

func countJSONLLines(path string) (int, error) {
	file, err := os.Open(path)
	if err != nil {
		return 0, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	scanner.Buffer(make([]byte, 1024), maxScannerLineSize)

	lineCount := 0
	for scanner.Scan() {
		lineCount++
	}
	if err := scanner.Err(); err != nil {
		return lineCount, err
	}
	return lineCount, nil
}

func copyFileWithSHA256(sourcePath, destinationPath string) (int64, string, error) {
	sourceFile, err := os.Open(sourcePath)
	if err != nil {
		return 0, "", err
	}
	defer sourceFile.Close()

	destinationFile, err := os.OpenFile(destinationPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, filePermissions)
	if err != nil {
		return 0, "", err
	}
	defer destinationFile.Close()

	hash := sha256.New()
	sizeBytes, err := io.Copy(io.MultiWriter(destinationFile, hash), sourceFile)
	if err != nil {
		return 0, "", err
	}
	return sizeBytes, hex.EncodeToString(hash.Sum(nil)), nil
}

func writeJSONAtomic(path string, payload any) error {
	content, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		return err
	}
	content = append(content, '\n')
	return writeAtomic(path, content)
}

func writeTextAtomic(path, content string) error {
	return writeAtomic(path, []byte(content))
}

func writeAtomic(path string, content []byte) error {
	temporaryPath := path + ".tmp"
	if err := os.WriteFile(temporaryPath, content, filePermissions); err != nil {
		return err
	}
	return os.Rename(temporaryPath, path)
}

func readManifest(path string) (ExportManifest, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return ExportManifest{}, fmt.Errorf("read manifest: %w", err)
	}

	var manifest ExportManifest
	if err := json.Unmarshal(content, &manifest); err != nil {
		return ExportManifest{}, fmt.Errorf("parse manifest: %w", err)
	}

	if manifest.SchemaVersion == "" {
		return ExportManifest{}, errors.New("manifest schemaVersion is required")
	}
	if manifest.ExportID == "" {
		return ExportManifest{}, errors.New("manifest exportId is required")
	}
	if len(manifest.Items) == 0 {
		return ExportManifest{}, errors.New("manifest has no items")
	}
	return manifest, nil
}

func safeJoin(basePath, relativePath string) (string, error) {
	if filepath.IsAbs(relativePath) {
		return "", fmt.Errorf("expected relative path but got absolute path: %s", relativePath)
	}

	cleanRelativePath := filepath.Clean(relativePath)
	if cleanRelativePath == "." || strings.HasPrefix(cleanRelativePath, "..") {
		return "", fmt.Errorf("invalid relative path: %s", relativePath)
	}

	joinedPath := filepath.Join(basePath, cleanRelativePath)
	relativeToBase, err := filepath.Rel(basePath, joinedPath)
	if err != nil {
		return "", err
	}
	if strings.HasPrefix(relativeToBase, "..") {
		return "", fmt.Errorf("path escapes base directory: %s", relativePath)
	}

	return joinedPath, nil
}

func buildExportID(now time.Time) string {
	return fmt.Sprintf("%s_%s", now.UTC().Format(exportIDTimeLayout), uuid.NewString())
}

type warningCollector struct {
	seen  map[string]struct{}
	items []string
	limit int
}

func newWarningCollector(limit int) *warningCollector {
	return &warningCollector{
		seen:  make(map[string]struct{}),
		items: make([]string, 0, limit),
		limit: limit,
	}
}

func (wc *warningCollector) Addf(template string, values ...any) {
	if wc == nil {
		return
	}
	if len(wc.items) >= wc.limit {
		return
	}

	warning := fmt.Sprintf(template, values...)
	if _, exists := wc.seen[warning]; exists {
		return
	}

	wc.seen[warning] = struct{}{}
	wc.items = append(wc.items, warning)
}

func (wc *warningCollector) Items() []string {
	if wc == nil || len(wc.items) == 0 {
		return nil
	}

	cloned := make([]string, len(wc.items))
	copy(cloned, wc.items)
	return cloned
}
