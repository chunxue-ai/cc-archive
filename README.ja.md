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

CC Archive は、Claude Code と Codex のワークフロー間でメモリ/セッションデータをエクスポート・管理するための Wails デスクトップアプリ（Go + React/TypeScript）です。

## GIF プレビュー

<!-- 日本語版 GIF に差し替えてください -->
![日本語 GIF プレースホルダー](docs/assets/preview-ja.gif)

## 現在の機能（v1）

- i18n 対応ダッシュボード UI（`en`、`zh-CN`）
- Claude Code のローカルセッションをスキャン（`~/.claude/projects/**/*.jsonl`）
- 安全なエクスポート計画（プレビューモード）
- 次を含む完全なエクスポートパッケージを生成：
  - `manifest.json`
  - `checksums.sha256`
  - `claude-code/projects/...` 配下のセッションファイルのコピー
- エクスポートパッケージからローカル Claude Code ストレージへの復元（ベストエフォート）

## ストレージモデル

- 既定のアーカイブルート：`~/.cc-archive`
- 既定のエクスポートディレクトリ：`~/.cc-archive/exports`
- エクスポートフォルダ形式：`YYYYMMDDTHHMMSSZ_<uuid>`

環境変数でパスを上書きできます：

- `CC_ARCHIVE_HOME`：カスタムアーカイブルート
- `CLAUDE_CONFIG_DIR`：カスタム Claude 設定ルート（セッションは `<CLAUDE_CONFIG_DIR>/projects` 配下を想定）

## 公式サポート範囲

CC Archive はローカル Claude Code セッションファイルのエクスポートと復元を扱います。  
別の Claude アカウントへのチャット履歴インポートは、現時点で Anthropic による公式サポート対象ではありません。

## 開発

開発モードで起動：

```bash
wails dev
```

バックエンドテスト：

```bash
go test ./...
```

フロントエンド資産のビルド：

```bash
cd frontend && npm run build
```

配布向けアプリのビルド：

```bash
wails build
```
