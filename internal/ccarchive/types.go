package ccarchive

type StorageInfo struct {
	ArchiveRoot       string `json:"archiveRoot"`
	ExportsRoot       string `json:"exportsRoot"`
	ClaudeProjectsDir string `json:"claudeProjectsDir"`
}

type ClaudeCodeSession struct {
	Key          string `json:"key"`
	SessionID    string `json:"sessionId"`
	ProjectKey   string `json:"projectKey"`
	RelativePath string `json:"relativePath"`
	SourcePath   string `json:"sourcePath"`
	SizeBytes    int64  `json:"sizeBytes"`
	MessageCount int    `json:"messageCount"`
	UpdatedAt    string `json:"updatedAt"`
}

type ScanResult struct {
	Storage       StorageInfo         `json:"storage"`
	Sessions      []ClaudeCodeSession `json:"sessions"`
	TotalSessions int                 `json:"totalSessions"`
	TotalBytes    int64               `json:"totalBytes"`
	ScannedAt     string              `json:"scannedAt"`
	Warnings      []string            `json:"warnings,omitempty"`
}

type ExportRequest struct {
	// SessionKeys are session "key" values returned by ScanClaudeCodeSessions.
	SessionKeys []string `json:"sessionKeys,omitempty"`
	// IncludeAll exports every discovered session. If no SessionKeys are provided,
	// IncludeAll defaults to true.
	IncludeAll bool `json:"includeAll"`
	// DestinationRoot overrides the default export root (~/.cc-archive/exports).
	DestinationRoot string `json:"destinationRoot,omitempty"`
}

type DryRunResult struct {
	Storage           StorageInfo `json:"storage"`
	PlannedExportID   string      `json:"plannedExportId"`
	PlannedExportPath string      `json:"plannedExportPath"`
	SessionCount      int         `json:"sessionCount"`
	TotalBytes        int64       `json:"totalBytes"`
	GeneratedAt       string      `json:"generatedAt"`
	Warnings          []string    `json:"warnings,omitempty"`
}

type ExportResult struct {
	Storage          StorageInfo `json:"storage"`
	ExportID         string      `json:"exportId"`
	ExportPath       string      `json:"exportPath"`
	ManifestPath     string      `json:"manifestPath"`
	ChecksumsPath    string      `json:"checksumsPath"`
	ExportedSessions int         `json:"exportedSessions"`
	ExportedBytes    int64       `json:"exportedBytes"`
	CreatedAt        string      `json:"createdAt"`
	Warnings         []string    `json:"warnings,omitempty"`
}

type RestoreRequest struct {
	ExportPath string `json:"exportPath"`
	Overwrite  bool   `json:"overwrite"`
	DryRun     bool   `json:"dryRun"`
}

type RestoreResult struct {
	Storage          StorageInfo `json:"storage"`
	ExportID         string      `json:"exportId"`
	ExportPath       string      `json:"exportPath"`
	DryRun           bool        `json:"dryRun"`
	PlannedSessions  int         `json:"plannedSessions"`
	RestoredSessions int         `json:"restoredSessions"`
	SkippedSessions  int         `json:"skippedSessions"`
	RestoredAt       string      `json:"restoredAt"`
	Conflicts        []string    `json:"conflicts,omitempty"`
	Warnings         []string    `json:"warnings,omitempty"`
}

type ExportManifest struct {
	SchemaVersion     string               `json:"schemaVersion"`
	CreatedBy         string               `json:"createdBy"`
	Source            string               `json:"source"`
	ExportID          string               `json:"exportId"`
	CreatedAt         string               `json:"createdAt"`
	HostOS            string               `json:"hostOs"`
	ClaudeProjectsDir string               `json:"claudeProjectsDir"`
	SessionCount      int                  `json:"sessionCount"`
	TotalBytes        int64                `json:"totalBytes"`
	Items             []ExportManifestItem `json:"items"`
	Notes             []string             `json:"notes,omitempty"`
}

type ExportManifestItem struct {
	Key                string `json:"key"`
	SessionID          string `json:"sessionId"`
	ProjectKey         string `json:"projectKey"`
	RelativeSourcePath string `json:"relativeSourcePath"`
	ArchivePath        string `json:"archivePath"`
	SizeBytes          int64  `json:"sizeBytes"`
	MessageCount       int    `json:"messageCount"`
	UpdatedAt          string `json:"updatedAt"`
	SHA256             string `json:"sha256"`
}
