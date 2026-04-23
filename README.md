<h1 align="center">CC Archive</h1>

<p align="center">
  <a href="https://github.com/chunxue-ai/cc-archive/stargazers"><img alt="GitHub Stars" src="https://img.shields.io/github/stars/chunxue-ai/cc-archive?style=flat-square" /></a>
  <a href="https://github.com/chunxue-ai/cc-archive/network/members"><img alt="GitHub Forks" src="https://img.shields.io/github/forks/chunxue-ai/cc-archive?style=flat-square" /></a>
  <a href="https://github.com/chunxue-ai/cc-archive/issues"><img alt="GitHub Issues" src="https://img.shields.io/github/issues/chunxue-ai/cc-archive?style=flat-square" /></a>
  <a href="https://github.com/chunxue-ai/cc-archive/commits/main"><img alt="Last Commit" src="https://img.shields.io/github/last-commit/chunxue-ai/cc-archive?style=flat-square" /></a>
  <a href="https://go.dev/"><img alt="Go" src="https://img.shields.io/badge/Go-1.23%2B-00ADD8?style=flat-square&logo=go&logoColor=white" /></a>
  <a href="https://wails.io/"><img alt="Wails" src="https://img.shields.io/badge/Wails-v2.12-0CA5E9?style=flat-square" /></a>
  <a href="https://github.com/chunxue-ai/cc-archive/pulls"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" /></a>
</p>

<p align="center">
  <a href="README.md" title="English"><img alt="English" src="https://img.shields.io/badge/Docs-English-00ADD8?style=flat-square&logo=googletranslate&logoColor=white" /></a>
  <a href="README.zh-CN.md" title="简体中文"><img alt="简体中文" src="https://img.shields.io/badge/Docs-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-00ADD8?style=flat-square&logo=googletranslate&logoColor=white" /></a>
  <a href="README.ja.md" title="日本語"><img alt="日本語" src="https://img.shields.io/badge/Docs-%E6%97%A5%E6%9C%AC%E8%AA%9E-00ADD8?style=flat-square&logo=googletranslate&logoColor=white" /></a>
</p>

<p align="center">
  <img src="docs/assets/cc-archive-logo.png" alt="CC Archive Logo" width="180" />
</p>

<p align="center">
  <strong>Portable backup and migration for Claude Code sessions.</strong><br/>
  Scan local conversations, review what will be exported, and create restore-ready packages in a few clicks.
</p>

## GIF Preview

<!-- Replace this with your English GIF -->
![English GIF Placeholder](docs/assets/preview-en.gif)

## Why CC Archive

- Built for everyday users who want a simple desktop workflow.
- No manual file hunting across hidden folders.
- Create organized export packages you can move between machines and workspaces.
- Keep control of your own data with local-first processing.

## Quick Start (No CLI Required)

1. Open CC Archive.
2. Click `Scan` to discover local Claude Code sessions.
3. Review the detected sessions and click `Export`.
4. Send the generated package to the target machine or account workspace.
5. Use `Import Workspace` or `Restore` to bring data back.

## What Happens to Your Data

- Session discovery and packaging run locally on your machine.
- `Preview` mode lets you check what will happen before writing files.
- Export packages are saved to `~/.cc-archive/exports` by default.
- CC Archive does not require a cloud upload step.

## What Is Inside an Export Package

- `manifest.json`: package summary and metadata.
- `checksums.sha256`: integrity checks for exported files.
- `claude-code/projects/...`: copied session files in a portable structure.

## Current Capabilities

- Multi-language desktop UI (`en`, `zh-CN`).
- Claude Code local session scan (`~/.claude/projects/**/*.jsonl`).
- Preview-first export workflow.
- Restore workflow from an exported package.

## Known Limit

CC Archive works with local Claude Code session files. Importing chat history directly into another Claude account is not officially supported by Anthropic.

## Optional Advanced Settings

- Default archive root: `~/.cc-archive`
- Default exports directory: `~/.cc-archive/exports`
- Export folder format: `YYYYMMDDTHHMMSSZ_<uuid>`
- `CC_ARCHIVE_HOME`: custom archive root
- `CLAUDE_CONFIG_DIR`: custom Claude config root (`<CLAUDE_CONFIG_DIR>/projects`)

## For Developers

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
