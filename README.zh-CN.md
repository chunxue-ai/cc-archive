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

CC Archive 是一个基于 Wails 的桌面应用（Go + React/TypeScript），用于在 Claude Code 与 Codex 工作流之间导出和管理记忆/会话数据。

## GIF 预览

<!-- 替换为简体中文 GIF -->
![简体中文 GIF 占位](docs/assets/preview-zh-CN.gif)

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
