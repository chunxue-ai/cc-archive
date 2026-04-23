package main

import (
	"context"

	"cc-archive/internal/ccarchive"
)

// App struct
type App struct {
	ctx            context.Context
	archiveService *ccarchive.Service
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		archiveService: ccarchive.NewService(),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) GetArchiveStorageInfo() (ccarchive.StorageInfo, error) {
	return a.archiveService.GetStorageInfo()
}

func (a *App) ScanClaudeCodeSessions() (ccarchive.ScanResult, error) {
	return a.archiveService.ScanClaudeCodeSessions()
}

func (a *App) DryRunClaudeCodeExport(request ccarchive.ExportRequest) (ccarchive.DryRunResult, error) {
	return a.archiveService.DryRunClaudeCodeExport(request)
}

func (a *App) ExportClaudeCodeSessions(request ccarchive.ExportRequest) (ccarchive.ExportResult, error) {
	return a.archiveService.ExportClaudeCodeSessions(request)
}

func (a *App) ListClaudeCodeExportPaths() ([]string, error) {
	return a.archiveService.ListClaudeCodeExportPaths()
}

func (a *App) RestoreClaudeCodeSessions(request ccarchive.RestoreRequest) (ccarchive.RestoreResult, error) {
	return a.archiveService.RestoreClaudeCodeSessions(request)
}
