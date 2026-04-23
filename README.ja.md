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
  <strong>Claude Code セッションを安全に持ち運べる、ローカル中心のバックアップツール。</strong><br/>
  ローカル会話をスキャンし、内容を確認してから、復元可能なパッケージを数クリックで作成できます。
</p>

## GIF プレビュー

<!-- 日本語版 GIF に差し替えてください -->
![日本語 GIF プレースホルダー](docs/assets/preview-ja.gif)

## CC Archive を使う理由

- 一般ユーザー向けの分かりやすいデスクトップ UI。
- 隠しフォルダを手動で探す必要がありません。
- 移行しやすいエクスポートパッケージを簡単に作成。
- ローカル優先で処理されるため、データ管理がしやすい。

## クイックスタート（CLI不要）

1. CC Archive を起動します。
2. `Scan` をクリックしてローカルの Claude Code セッションを検出します。
3. 内容を確認して `Export` を実行します。
4. 作成されたパッケージを移行先マシンまたは移行先ワークスペースへ渡します。
5. 移行先で `Import Workspace` または `Restore` を使って復元します。

## データの扱い

- スキャンとパッケージ化はローカル環境で実行されます。
- `Preview` モードで、書き込み前に実行内容を確認できます。
- エクスポートパッケージの既定保存先は `~/.cc-archive/exports` です。
- CC Archive 自体にクラウドアップロード必須の工程はありません。

## エクスポートパッケージの中身

- `manifest.json`: パッケージの要約とメタデータ。
- `checksums.sha256`: ファイル整合性の検証情報。
- `claude-code/projects/...`: 移行用のセッションファイルコピー。

## 現在できること

- 多言語デスクトップ UI（`en`、`zh-CN`）。
- Claude Code ローカルセッションのスキャン（`~/.claude/projects/**/*.jsonl`）。
- プレビュー先行の安全なエクスポートフロー。
- エクスポートパッケージからの復元フロー。

## 既知の制限

CC Archive は Claude Code のローカルセッションファイルを扱います。別の Claude アカウントへチャット履歴を直接インポートする機能は、現時点で Anthropic の公式サポート対象ではありません。

## オプション設定（上級者向け）

- 既定のアーカイブルート: `~/.cc-archive`
- 既定のエクスポートディレクトリ: `~/.cc-archive/exports`
- エクスポートフォルダ形式: `YYYYMMDDTHHMMSSZ_<uuid>`
- `CC_ARCHIVE_HOME`: アーカイブルートを上書き
- `CLAUDE_CONFIG_DIR`: Claude 設定ルートを上書き（`<CLAUDE_CONFIG_DIR>/projects`）

## 開発者向け

開発モードで起動:

```bash
wails dev
```

バックエンドテスト:

```bash
go test ./...
```

フロントエンド資産のビルド:

```bash
cd frontend && npm run build
```

配布向けアプリのビルド:

```bash
wails build
```
