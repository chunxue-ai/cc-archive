# CC Archive

[![GitHub Stars](https://img.shields.io/github/stars/MonteCarloM/cc-archive?style=flat-square)](https://github.com/MonteCarloM/cc-archive/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/MonteCarloM/cc-archive?style=flat-square)](https://github.com/MonteCarloM/cc-archive/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/MonteCarloM/cc-archive?style=flat-square)](https://github.com/MonteCarloM/cc-archive/issues)
[![Last Commit](https://img.shields.io/github/last-commit/MonteCarloM/cc-archive?style=flat-square)](https://github.com/MonteCarloM/cc-archive/commits/main)
[![Go](https://img.shields.io/badge/Go-1.23%2B-00ADD8?style=flat-square&logo=go&logoColor=white)](https://go.dev/)
[![Wails](https://img.shields.io/badge/Wails-v2.12-0CA5E9?style=flat-square)](https://wails.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/MonteCarloM/cc-archive/pulls)

[English](README.md) | 简体中文 | [日本語](README.ja.md)

<p align="center">
  <img src="docs/assets/cc-archive-logo.png" alt="CC Archive Logo" width="180" />
</p>

CC Archive 是一个基于 Wails 的桌面应用（Go + React/TypeScript），用于在 Claude Code 与 Codex 工作流之间导出和管理记忆/会话数据。

## 当前功能（v1）

- 支持国际化的仪表盘界面（`en`、`zh-CN`）
- 扫描本地 Claude Code 会话（`~/.claude/projects/**/*.jsonl`）
- 安全导出规划（预览模式）
- 生成完整导出包，包含：
  - `manifest.json`
  - `checksums.sha256`
  - 位于 `claude-code/projects/...` 的会话文件副本
- 从导出包恢复到本地 Claude Code 存储（尽力恢复）

## 存储模型

- 默认归档根目录：`~/.cc-archive`
- 默认导出目录：`~/.cc-archive/exports`
- 导出目录命名格式：`YYYYMMDDTHHMMSSZ_<uuid>`

可通过环境变量覆盖路径：

- `CC_ARCHIVE_HOME`：自定义归档根目录
- `CLAUDE_CONFIG_DIR`：自定义 Claude 配置根目录（会话路径应位于 `<CLAUDE_CONFIG_DIR>/projects`）

## 官方支持边界

CC Archive 支持导出与恢复本地 Claude Code 会话文件。  
目前 Anthropic 官方尚未支持将聊天历史导入到另一个 Claude 账号。

## 开发

开发模式运行：

```bash
wails dev
```

运行后端测试：

```bash
go test ./...
```

构建前端资源：

```bash
cd frontend && npm run build
```

构建可分发应用：

```bash
wails build
```

## 发布（GitHub Actions）

仓库已内置 `.github/workflows/release.yml`，用于按版本号执行多平台自动发布。

1. 在 GitHub Actions 中运行 `Release Desktop Clients`。
2. 输入 `version`，支持 `0.1.0` 或 `v0.1.0`。
3. 工作流会自动：
   - 校验 `frontend/src/version.ts` 的版本与输入版本一致
   - 构建 `macOS (amd64/arm64)`、`Windows (amd64)`、`Linux (amd64)` 客户端
   - 打包产物并发布到 GitHub Release（tag 为 `v<version>`）
