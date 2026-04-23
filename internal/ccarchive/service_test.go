package ccarchive

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestSafeJoinRejectsTraversal(t *testing.T) {
	t.Parallel()

	base := t.TempDir()
	_, err := safeJoin(base, "../escape.jsonl")
	if err == nil {
		t.Fatal("expected traversal path to be rejected")
	}
}

func TestScanSessionRecordsDiscoversJSONLFiles(t *testing.T) {
	t.Parallel()

	projectsRoot := t.TempDir()
	projectDir := filepath.Join(projectsRoot, "sample-project")
	if err := os.MkdirAll(projectDir, 0o755); err != nil {
		t.Fatalf("create project dir: %v", err)
	}

	sessionPath := filepath.Join(projectDir, "session-1.jsonl")
	if err := os.WriteFile(sessionPath, []byte("{\"role\":\"user\"}\n{\"role\":\"assistant\"}\n"), 0o644); err != nil {
		t.Fatalf("write session file: %v", err)
	}
	if err := os.WriteFile(filepath.Join(projectDir, "README.txt"), []byte("ignore"), 0o644); err != nil {
		t.Fatalf("write non-session file: %v", err)
	}

	records, warnings, err := scanSessionRecords(projectsRoot)
	if err != nil {
		t.Fatalf("scan session records: %v", err)
	}
	if len(warnings) != 0 {
		t.Fatalf("expected no warnings, got: %v", warnings)
	}
	if len(records) != 1 {
		t.Fatalf("expected 1 session, got %d", len(records))
	}

	record := records[0].session
	if record.ProjectKey != "sample-project" {
		t.Fatalf("unexpected project key: %s", record.ProjectKey)
	}
	if record.MessageCount != 2 {
		t.Fatalf("expected message count 2, got %d", record.MessageCount)
	}
}

func TestExportAndRestoreRoundTrip(t *testing.T) {
	configRoot := t.TempDir()
	archiveRoot := t.TempDir()

	t.Setenv("CLAUDE_CONFIG_DIR", configRoot)
	t.Setenv("CC_ARCHIVE_HOME", archiveRoot)

	projectsDir := filepath.Join(configRoot, "projects")
	sourceProject := filepath.Join(projectsDir, "workspace-a")
	if err := os.MkdirAll(sourceProject, 0o755); err != nil {
		t.Fatalf("create source project: %v", err)
	}

	sourceSession := filepath.Join(sourceProject, "session-a.jsonl")
	content := []byte("{\"role\":\"user\",\"content\":\"hi\"}\n")
	if err := os.WriteFile(sourceSession, content, 0o644); err != nil {
		t.Fatalf("write source session: %v", err)
	}

	service := NewService()
	service.nowUTC = func() time.Time {
		return time.Date(2026, 4, 22, 8, 0, 0, 0, time.UTC)
	}

	exportResult, err := service.ExportClaudeCodeSessions(ExportRequest{IncludeAll: true})
	if err != nil {
		t.Fatalf("export sessions: %v", err)
	}
	if exportResult.ExportedSessions != 1 {
		t.Fatalf("expected 1 exported session, got %d", exportResult.ExportedSessions)
	}
	if _, err := os.Stat(exportResult.ManifestPath); err != nil {
		t.Fatalf("manifest not created: %v", err)
	}

	if err := os.Remove(sourceSession); err != nil {
		t.Fatalf("remove source session before restore: %v", err)
	}

	restoreResult, err := service.RestoreClaudeCodeSessions(RestoreRequest{
		ExportPath: exportResult.ExportPath,
		Overwrite:  true,
		DryRun:     false,
	})
	if err != nil {
		t.Fatalf("restore sessions: %v", err)
	}
	if restoreResult.RestoredSessions != 1 {
		t.Fatalf("expected 1 restored session, got %d", restoreResult.RestoredSessions)
	}

	restoredContent, err := os.ReadFile(sourceSession)
	if err != nil {
		t.Fatalf("read restored session: %v", err)
	}
	if string(restoredContent) != string(content) {
		t.Fatalf("restored content mismatch: %q", string(restoredContent))
	}
}

func TestListClaudeCodeExportPaths(t *testing.T) {
	configRoot := t.TempDir()
	archiveRoot := t.TempDir()

	t.Setenv("CLAUDE_CONFIG_DIR", configRoot)
	t.Setenv("CC_ARCHIVE_HOME", archiveRoot)

	exportsRoot := filepath.Join(archiveRoot, "exports")
	validOne := filepath.Join(exportsRoot, "20260422T120000Z_aaaaaaaa")
	validTwo := filepath.Join(exportsRoot, "20260423T080000Z_bbbbbbbb")
	invalidFolder := filepath.Join(exportsRoot, "notes")

	for _, dir := range []string{validOne, validTwo, invalidFolder} {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			t.Fatalf("create test export directory %q: %v", dir, err)
		}
	}

	if err := os.WriteFile(filepath.Join(validOne, "manifest.json"), []byte("{}"), 0o644); err != nil {
		t.Fatalf("write manifest for validOne: %v", err)
	}
	if err := os.WriteFile(filepath.Join(validTwo, "manifest.json"), []byte("{}"), 0o644); err != nil {
		t.Fatalf("write manifest for validTwo: %v", err)
	}

	service := NewService()

	paths, err := service.ListClaudeCodeExportPaths()
	if err != nil {
		t.Fatalf("list export paths: %v", err)
	}
	if len(paths) != 2 {
		t.Fatalf("expected 2 export paths, got %d: %v", len(paths), paths)
	}

	if paths[0] != validTwo || paths[1] != validOne {
		t.Fatalf("unexpected export path order: %v", paths)
	}
}
