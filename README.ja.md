# CC Archive

[![GitHub Stars](https://img.shields.io/github/stars/MonteCarloM/cc-archive?style=flat-square)](https://github.com/MonteCarloM/cc-archive/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/MonteCarloM/cc-archive?style=flat-square)](https://github.com/MonteCarloM/cc-archive/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/MonteCarloM/cc-archive?style=flat-square)](https://github.com/MonteCarloM/cc-archive/issues)
[![Last Commit](https://img.shields.io/github/last-commit/MonteCarloM/cc-archive?style=flat-square)](https://github.com/MonteCarloM/cc-archive/commits/main)
[![Go](https://img.shields.io/badge/Go-1.23%2B-00ADD8?style=flat-square&logo=go&logoColor=white)](https://go.dev/)
[![Wails](https://img.shields.io/badge/Wails-v2.12-0CA5E9?style=flat-square)](https://wails.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/MonteCarloM/cc-archive/pulls)

[English](README.md) | [简体中文](README.zh-CN.md) | 日本語

<p align="center">
  <img src="docs/assets/cc-archive-logo.png" alt="CC Archive Logo" width="180" />
</p>

CC Archive は、Claude Code と Codex のワークフロー間でメモリ/セッションデータをエクスポート・管理するための Wails デスクトップアプリ（Go + React/TypeScript）です。

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

## リリース（GitHub Actions）

このリポジトリには、バージョン指定でマルチプラットフォーム配布を行う `.github/workflows/release.yml` が含まれています。

1. GitHub Actions で `Release Desktop Clients` を実行します。
2. `version` に `0.1.0` または `v0.1.0` を入力します。
3. ワークフローは次を自動実行します。
   - `frontend/src/version.ts` のバージョンと入力値の一致を検証
   - `macOS (amd64/arm64)`、`Windows (amd64)`、`Linux (amd64)` 向けクライアントをビルド
   - 成果物をパッケージし、`v<version>` タグで GitHub Release を公開
