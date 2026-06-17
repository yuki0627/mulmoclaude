# 00 概要 — MulmoClaude は何ができる/できないか

> 最終分析コミット: `8bf1667d`
> 対象範囲: `README.md`, `docs/developer.md`, `docs/extension-mechanisms.md`, `docs/mcp-sandbox.md`
> 最終更新: 2026-06-17

## MulmoClaude とは

**Claude Code Agent SDK を LLM コアにした、リッチな視覚出力を持つタスク駆動エージェントアプリ。**
ローカルマシン上で動き、チャットで指示すると Claude がツール（プラグイン）を呼び出して
チャート・ドキュメント・画像・スプレッドシートなどの成果物を生成する。

**中核思想**: 「ワークスペースがデータベース。ファイルが真実の源。Claude が知的なインターフェース。」
→ 状態は基本すべて `~/mulmoclaude/` 配下のプレーンファイル（Markdown / JSON / JSONL）に保存される。

- フロント: Vue 3 + Tailwind CSS v4
- サーバ: Express.js（SSE ストリーミング）
- エージェント: `@anthropic-ai/claude-agent-sdk`（Claude Code CLI を起動）
- プラグイン層: `gui-chat-protocol`
- 言語: TypeScript 全面

## できること（出力できる成果物）

| 成果物 | 概要 | 保存先 |
|---|---|---|
| チャート | ECharts（折れ線・棒・ローソク足・Sankey・ヒートマップ等） | `artifacts/charts/` |
| ドキュメント | リッチ Markdown | `artifacts/documents/` |
| HTML | Tailwind+CDN ベースの対話的ページ | `artifacts/html/`, `html-scratch/` |
| スプレッドシート | XLSX | `artifacts/spreadsheets/` |
| 画像 | 生成・編集（Gemini API） | `artifacts/images/` |
| Wiki | `[[wikilink]]` 付き Markdown 知識ベース | `data/wiki/pages/` |
| Collections | スキーマ駆動データアプリ（todo・連絡先・請求書等） | `data/` 配下 |
| MulmoScript | アニメ付きプレゼン（stories） | `artifacts/stories/` |
| 3D / アート | Three.js / p5.js | （html等） |

**外部連携**: 外部 MCP サーバ（GitHub, Google Drive, Linear, Spotify 等）を `config/mcp.json` で追加可能。
**メッセージング**: 27種の bridge（Slack/Discord/Telegram/LINE 等）で外部チャットアプリから MulmoClaude を使える。
**自動化**: スケジューラで定期タスク（毎朝ニュース要約など）を実行できる。

## できないこと・制約（重要）

質問対応で頻出する制約。詳細な回避策は各出典を参照。

| 制約 | 内容 | 回避策 | 出典 |
|---|---|---|---|
| **ワークスペースは1つ** | `~/mulmoclaude` 固定。複数同時利用は不可 | symlink を張り替える | `docs/developer.md` |
| **Docker下で stdio MCP 不可** | サンドボックスイメージが小さく runtime/認証/FS境界の制約で stdio MCP がほぼ動かない | `DISABLE_SANDBOX=1 yarn dev`、または HTTP 版 MCP を使う | `docs/mcp-sandbox.md` |
| **Docker下で user skill が壊れることがある** | symlink 破損・イメージ内 CLI 古い | project scope にする or `DISABLE_SANDBOX=1` | `README.md` |
| **ファイル添付は CLI / Telegram のみ** | 他 bridge は添付未対応。`image/*` は vision、他はログして無視 | — | `docs/bridge-protocol.md` |
| **PPTX 変換は Docker のみ** | LibreOffice 変換が sandbox 限定。非 Docker は PDF/画像出力推奨 | — | `README.md` |
| **画像生成に API キー必須** | `GEMINI_API_KEY` が無いと画像生成不可 | `.env` に設定（無料枠あり） | `README.md` |
| **X(Twitter)ツールに API キー必須** | `X_BEARER_TOKEN` 必須・有料 | — | `README.md` |
| **Bearer token はサーバ再起動で変わる** | 長時間動作の bridge が切れる | `MULMOCLAUDE_AUTH_TOKEN` を固定値でピン留め（32字以上推奨） | `docs/developer.md` |

## 関連章

- セットアップ・環境変数・ワークスペースの詳細 → [`04-setup-and-config.md`](04-setup-and-config.md)
- 拡張（plugin/MCP/skill/role/bridge）の使い分け → [`03-plugins-and-extensions.md`](03-plugins-and-extensions.md)
- 内部のデータフロー → [`02-flows.md`](02-flows.md)
