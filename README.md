# CC Archive

[![GitHub Stars](https://img.shields.io/github/stars/chunxue-ai/cc-archive?style=flat-square)](https://github.com/chunxue-ai/cc-archive/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/chunxue-ai/cc-archive?style=flat-square)](https://github.com/chunxue-ai/cc-archive/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/chunxue-ai/cc-archive?style=flat-square)](https://github.com/chunxue-ai/cc-archive/issues)
[![Last Commit](https://img.shields.io/github/last-commit/chunxue-ai/cc-archive?style=flat-square)](https://github.com/chunxue-ai/cc-archive/commits/main)
[![Go](https://img.shields.io/badge/Go-1.23%2B-00ADD8?style=flat-square&logo=go&logoColor=white)](https://go.dev/)
[![Wails](https://img.shields.io/badge/Wails-v2.12-0CA5E9?style=flat-square)](https://wails.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/chunxue-ai/cc-archive/pulls)

<p align="center">
  <a href="README.md" title="English">🇺🇸</a>
  <a href="README.zh-CN.md" title="简体中文">🇨🇳</a>
  <a href="README.ja.md" title="日本語">🇯🇵</a>
</p>

<p align="center">
  <img src="docs/assets/cc-archive-logo.png" alt="CC Archive Logo" width="180" />
</p>

CC Archive is a Wails desktop app (Go + React/TypeScript) for exporting and managing memory/session data between Claude Code and Codex workflows.

## GIF Preview

<!-- Replace this with your English GIF -->
![English GIF Placeholder](docs/assets/preview-en.gif)

## Current features (v1)

- i18n-ready dashboard UI (`en`, `zh-CN`)
- Claude Code local session scan (`~/.claude/projects/**/*.jsonl`)
- Safe export planning (preview mode)
- Full export package generation with:
  - `manifest.json`
  - `checksums.sha256`
  - copied session files under `claude-code/projects/...`
- Restore flow (best effort) from an export package back to local Claude Code storage

## Storage model

- Default archive root: `~/.cc-archive`
- Default exports directory: `~/.cc-archive/exports`
- Export folder format: `YYYYMMDDTHHMMSSZ_<uuid>`

You can override paths with environment variables:

- `CC_ARCHIVE_HOME`: custom archive root
- `CLAUDE_CONFIG_DIR`: custom Claude config root (sessions expected under `<CLAUDE_CONFIG_DIR>/projects`)

## Official support boundary

CC Archive exports and restores local Claude Code session files.  
Importing chat history into another Claude account is not officially supported by Anthropic at this time.

## Development

Run in development mode:

```bash
wails dev
```

Run backend tests:

```bash
go test ./...
```

Build frontend assets:

```bash
cd frontend && npm run build
```

Build a distributable app:

```bash
wails build
```
