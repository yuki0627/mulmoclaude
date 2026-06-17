# 04 セットアップ・設定・運用機能

> 最終分析コミット: `8bf1667d`
> 対象範囲: `package.json`, `README.md`, `docs/developer.md`, `docs/scheduler-guide.md`, `docs/mcp-sandbox.md`, `docs/claude-code-allowed-tools.md`, `src/config/roles.ts`
> 最終更新: 2026-06-17

## 前提・起動

前提:
- Node.js **>= 20.12**（`package.json` engines）
- Claude Code CLI（`claude` コマンド、OAuth 済み）
- ffmpeg（動画生成時のみ）
- Docker Desktop（推奨・任意。サンドボックス用）

起動:
```bash
git clone ... && cd mulmoclaude && yarn install
cp .env.example .env          # 画像生成を使うなら GEMINI_API_KEY を追記
yarn dev                       # server(:3001) + client(:5173) を同時起動
```
`yarn dev` は `scripts/dev-build-if-needed.mjs` で必要時のみビルドし、`concurrently` で server と vite を起動する。

## 主要 npm スクリプト

| スクリプト | 用途 |
|---|---|
| `yarn dev` | server + client 同時起動（既定の開発モード） |
| `yarn dev:debug` | server をデバッグモードで起動 |
| `yarn cli` | ローカル端末の CLI ブリッジ（`packages/bridges/cli`） |
| `yarn telegram` | Telegram ブリッジ（`TELEGRAM_BOT_TOKEN` 必須） |
| `yarn build` | 本番ビルド（`build:packages` → `build:hooks` → `vite build`） |
| `yarn test` | ユニットテスト（node:test）＋ workspaces test |
| `yarn test:e2e` | Playwright E2E（モックUI、バックエンド不要） |
| `yarn lint` / `format` / `typecheck` | 静的検査一式 |

> 開発として手を入れる場合のみ: ソース変更後は `yarn format && yarn lint && yarn typecheck && yarn build`（ルート CLAUDE.md のルール）。普段の「利用」では不要。

## 環境変数（よく使うもの）

| 変数 | 役割 |
|---|---|
| `GEMINI_API_KEY` | 画像生成を有効化（無料枠あり） |
| `X_BEARER_TOKEN` | X(Twitter) MCP ツールを有効化（有料） |
| `DISABLE_SANDBOX` | Docker サンドボックスを無効化（stdio MCP / user skill を使いたい時） |
| `VITE_LOCALE` | UI 言語（`en` `ja` `zh` `ko` `es` `pt-BR` `fr` `de`） |
| `PORT` | Express ポート（既定 3001） |
| `LOG_LEVEL` | `error` `warn` `info` `debug` |
| `MULMOCLAUDE_AUTH_TOKEN` | bridge 用に bearer token を固定（再起動でも切れないようピン留め、32字以上推奨） |

出典: `docs/developer.md`。

## ワークスペース `~/mulmoclaude/`

「ワークスペースがデータベース」。状態は基本ここのプレーンファイル。

```
config/
  settings.json      Web Settings UI（extraAllowedTools 等）
  mcp.json           外部 MCP サーバ定義（Claude CLI --mcp-config 互換）
  roles/             ユーザー定義ロール
  helps/             サーバ側ヘルプ/スキーマテンプレ（起動時同期）
  marp-themes/, plugins/
conversations/
  chat/              セッション ToolResults（.jsonl）, chat/index/（タイトル/要約キャッシュ）
  memory.md          エージェントが常時読むコンテキスト
  memory/, summaries/（ジャーナル）
data/
  wiki/              知識ベース（index.md, pages/, sources/, log.md）
  calendar/, scheduler/（items.json）, sources/（feeds レジストリ）
  attachments/YYYY/MM/, plugins/, skills/, catalog/, feeds/, contacts/, clients/ ほか
artifacts/
  charts/ documents/ html/ images/ spreadsheets/ stories/ svg/ ほか
.session-token       bearer 認証トークン（mode 0600）
.mulmoclaude/        内部：セッション用 MCP 設定
```

## 設定ファイル例

`config/settings.json`:
```json
{ "extraAllowedTools": ["mcp__claude_ai_Gmail"] }
```

`config/mcp.json`:
```json
{
  "mcpServers": {
    "deepwiki": { "type": "http", "url": "https://...", "enabled": true },
    "memory":   { "type": "stdio", "command": "npx", "args": ["..."] }
  }
}
```
- stdio は `command` を `npx`/`node`/`tsx` に制限。**Docker サンドボックス下では基本動かない**ので、その場合は HTTP 版か `DISABLE_SANDBOX=1`。
- ツール許可表記: `mcp__<server>__<tool>` / `mcp__<server>__*` / `mcp__<server>`（短縮）/ ビルトイン `Bash`,`Read`,`Edit`… / サブエージェント `Agent(<name>)`。

## ロール

ペルソナ + 使えるツール（`availablePlugins`）+ system prompt を切り替えて、文脈をリセットしつつ高速化する仕組み。

- 定義: `src/config/roles.ts`（`ROLES`、`:45`〜）。`availablePlugins` は `TOOL_NAMES` のリテラルで型チェック（`:29` のスキーマ）。
- ビルトイン例: General / Office / Guide & Planner / Artist / Tutor / Storyteller。
- カスタム作成: Web UI の役割作成、または Claude に「○○という role を作って」と指示 → `config/roles/` に保存。
- ゲーティング: role ファイルのパースは寛容で、未知のプラグイン名は実行時 no-op（user-installed runtime plugin も受け入れる）。

## スケジューラ / Automations

定期タスクを Claude に実行させる仕組み（`@receptron/task-scheduler`、`docs/scheduler-guide.md`）。

- システムタスク（設定不要）: **Journal**（最近チャットを日誌要約、毎時）/ **Chat Index**（セッションにタイトル・要約、毎時）。
- ユーザータスク: 「毎朝9時にニュース要約して」等と自然言語で指示、または `/automations` 画面で管理。
- スケジュール構文: `daily 09:00` / `interval 30m` / `cron "0 */4 * * *"`。
- スキルに `schedule: daily 08:00` を frontmatter で書けば自動登録。
- **キャッチアップ**: PC オフライン中の missed run を検知。「スキップ（システム）」「1回だけ」「全部実行」のポリシー。

## データ機能

- **Wiki**: `data/wiki/` のプレーン Markdown。`[[wikilink]]` で相互参照。`index.md`（カタログ）/ `pages/<slug>.md` / `sources/<slug>.md` / `log.md`。Claude が作成・更新・lint。画面は `/wiki`。
- **Todos / Collections**: スキーマ駆動データアプリ。`config/helps/` のテンプレ（`todo-collection.md`, `billing-invoice.md` 等）に沿って Claude が作成。Kanban/Table/Calendar ビューを自動選択。画面は `/collections`。
- **Calendar**: `data/calendar/` のイベント。画面は `/automations`（旧 calendar はリダイレクト）。
- **Data Feeds**: `data/sources/` のレジストリ + 取込結果は `artifacts/news/` 等。RSS/Atom/Podcast/JSON をスケジュール取得。スキーマは `feeds/<slug>/schema.json`。画面は `/feeds`。

## 関連章

- 制約・できないこと → [`00-overview.md`](00-overview.md)
- 拡張（MCP/skill/role/bridge/plugin）の使い分け → [`03-plugins-and-extensions.md`](03-plugins-and-extensions.md)
