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
  <strong>为 Claude Code 会话提供可迁移的本地备份方案。</strong><br/>
  扫描本地对话，先预览再导出，几步即可生成可恢复的归档包。
</p>

## 演示视频

<div align="center">
  <video src="https://github.com/user-attachments/assets/881f7b04-ac91-4315-ae98-283adfb8e019"
         width="100%"
         controls>
  </video>
</div>

## 为什么选择 CC Archive

- 面向普通用户设计，桌面界面即可完成全流程。
- 不需要手动翻找隐藏目录或拼接文件路径。
- 一键生成结构化导出包，便于迁移到新机器或新工作区。
- 本地优先处理，数据可控。

## 快速开始（无需命令行）

1. 打开 CC Archive。
2. 点击 `Scan` 扫描本地 Claude Code 会话。
3. 确认扫描结果后点击 `Export`。
4. 将导出包传到目标机器或目标账号使用的工作区。
5. 在目标端使用 `Import Workspace` 或 `Restore` 恢复数据。

## 你的数据会发生什么

- 扫描与打包都在本机执行。
- `Preview` 模式会先展示计划，不会直接写入文件。
- 导出包默认保存在 `~/.cc-archive/exports`。
- CC Archive 不要求上传到云端。

## 导出包里包含什么

- `manifest.json`：导出包摘要与元数据。
- `checksums.sha256`：文件完整性校验信息。
- `claude-code/projects/...`：可迁移的会话文件副本。

## 当前能力

- 多语言桌面界面（`en`、`zh-CN`）。
- 扫描 Claude Code 本地会话（`~/.claude/projects/**/*.jsonl`）。
- 先预览再导出的安全流程。
- 基于导出包的恢复流程。

## 已知限制

CC Archive 处理的是 Claude Code 本地会话文件。将聊天记录直接导入到另一个 Claude 账号，目前并非 Anthropic 官方支持能力。

## 可选高级设置

- 默认归档根目录：`~/.cc-archive`
- 默认导出目录：`~/.cc-archive/exports`
- 导出目录格式：`YYYYMMDDTHHMMSSZ_<uuid>`
- `CC_ARCHIVE_HOME`：自定义归档根目录
- `CLAUDE_CONFIG_DIR`：自定义 Claude 配置根目录（`<CLAUDE_CONFIG_DIR>/projects`）

## 开发者说明

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
