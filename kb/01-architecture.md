# 01 アーキテクチャ — レイヤー構成と責務マップ

> 最終分析コミット: `8bf1667d`
> 対象範囲: `server/**`, `src/**`, `packages/**`, `docs/developer.md`
> 最終更新: 2026-06-17

## 3レイヤー構成

```
┌─ src/ ───────── Vue 3 フロント（チャットUI・各画面・ビルトインプラグインのView）
│                    ↕ REST (src/utils/api.ts) + Socket.io (/ws/pubsub)
├─ server/ ────── Express サーバ。Agentループ・APIルート・ワークスペース・イベント
│                    ↕ Claude CLI を子プロセス起動、stdio MCP ブリッジで自分に戻る
└─ packages/ ──── @mulmobridge/* npm パッケージ（yarn workspaces）
                     protocol / client / chat-service / scheduler / relay / mock-server
                     + bridges/*（27種）+ plugins/*-plugin（ランタイムプラグイン）
```

## server/ 責務マップ

| ディレクトリ | 責務 | 主要ファイル |
|---|---|---|
| `agent/` | エージェントループ中核・stdio MCP サーバ・Claude CLI 連携・system prompt 構築 | `index.ts`, `mcp-server.ts`, `stream.ts`, `prompt.ts` |
| `api/` | HTTP ルートハンドラ（REST のエントリ） | `routes/agent.ts`, `routes/sessions.ts`, `routes/wiki/*`, ほか多数 |
| `workspace/` | ワークスペースのディレクトリ構造定義・ファイルI/O | `paths.ts`, `memory/`, `wiki-pages/`, `skills/` |
| `events/` | pub/sub（Socket.io）・セッション状態ストア・タスクマネージャ | `pub-sub/index.ts`, `session-store/index.ts`, `task-manager/` |
| `system/` | ロギング・Docker・認証情報・環境設定 | `logger/`, `config.ts`, `env.ts`, `docker.ts` |
| `utils/` | 共有ユーティリティ（時間・エラー・ファイルI/O） | `time.ts`, `errors.ts`, `files/` |
| `plugins/` | ランタイムプラグインのロード・登録・ディスパッチ・preset | `runtime-loader.ts`, `runtime-registry.ts`, `preset-list.ts` |
| `prompts/`, `notifier/`, `accounting/`, `services/` | system prompt テンプレ／通知／コスト会計／翻訳 | — |

主要アンカー:
- `runAgent()` … `server/agent/index.ts:40`（`export async function*` = AsyncGenerator）
- `handleToolCall()` … `server/agent/mcp-server.ts:421`（`/api/mcp-tools/<name>` へ HTTP POST）
- `WORKSPACE_PATHS` … `server/workspace/paths.ts:270`（`WORKSPACE_DIRS:246` / `HOST_WORKSPACE_DIRS:94` から自動導出）
- `createPubSub()` … `server/events/pub-sub/index.ts:15`（Socket.io, path `/ws/pubsub`）
- `ServerSession` … `server/events/session-store/index.ts:28`
- 時間定数 … `server/utils/time.ts:8`（`ONE_SECOND_MS` 他）／ `errorMessage()` … `server/utils/errors.ts`
- `log` / `createLogger()` … `server/system/logger/index.ts:53` / `:18`（console/file/telemetry sink）

## src/ 責務マップ

| ディレクトリ/ファイル | 責務 |
|---|---|
| `main.ts` | ブート。プラグインDI（`installHostContext()` … `src/main.ts:80`）→ ランタイムローダ → mount |
| `App.vue` | レイアウト管理（Single/Stack）・セッション同期・6画面の条件レンダリング・plugin統合 |
| `router/index.ts` | vue-router。6画面 + dev画面（後述） |
| `components/` | 70+ コンポーネント（`PluginScopedRoot.vue`, `SessionSidebar.vue`, 各View 等） |
| `composables/` | 40+ Composition フック（`useSessionHistory`, `useMcpTools`, `useRoles` 等） |
| `plugins/` | ビルトインプラグイン（後述・`03` 章）。集約は `metas.ts` / `index.ts` |
| `config/` | 集約定数（`apiRoutes.ts` / `toolNames.ts` / `roles.ts` / `pubsubChannels.ts`） |
| `tools/` | プラグインレジストリ。`getPlugin()`（`index.ts`）/ ランタイム動的import（`runtimeLoader.ts`） |
| `utils/` | `api.ts`（`apiGet`/`apiPost`、bearer 自動付与）、agent/ session/ role/ markdown/ path/ |
| `types/` | `session.ts`, `events.ts`, `sse.ts` 等の型 |

### ルーティング（`src/router/index.ts`）

実体は6画面 + dev。calendar/scheduler は automations に、apps は collections にリダイレクト。

| パス | 画面 | 行 |
|---|---|---|
| `/chat/:sessionId?` | チャット（メッセージ＋プラグイン結果） | `:36` |
| `/files/:pathMatch(.*)*` | ワークスペースのファイルツリー | `:44` |
| `/automations/:taskId?` | スケジューラ・タスク管理（旧 calendar/scheduler） | `:47` |
| `/wiki/:section(pages\|log\|lint-report\|graph)?/:slug?` | Wiki UI | `:58` |
| `/feeds/:slug?` | データソース Feeds | `:68` |
| `/collections/:slug?` | スキーマ駆動 Collections（旧 apps） | `:77` |
| `/debug` | Encore playground（dev限定） | `:72` |

## packages/ 責務マップ

| パッケージ | 役割 |
|---|---|
| `@mulmobridge/protocol` | Socket.io + REST の wire 契約（`EVENT_TYPES`, `CHAT_SOCKET_PATH`, `Attachment` 型等）。無依存 |
| `@mulmobridge/client` | bridge 実装向け Socket.io クライアントlib（`createBridgeClient()`）。全 bridge が依存 |
| `@mulmobridge/chat-service` | サーバ側 Socket.io + REST ラッパー（peer: express/socket.io） |
| `@receptron/task-scheduler` | 永続スケジューラ。再起動後の missed run をキャッチアップ |
| `@mulmobridge/relay` | Cloudflare Workers リレー（webhook → MulmoClaude WebSocket） |
| `@mulmobridge/mock-server` | テスト/開発用スタブサーバ（Claude API キー不要） |
| `bridges/*`（27種） | Slack/Discord/Telegram/LINE… 各プラットフォーム接続プロセス。`client`+`protocol` に依存 |
| `plugins/*-plugin` | ランタイムプラグイン（spotify/edgar/email/bookmarks…）。`gui-chat-protocol` の `definePlugin()` |

## 集約定数の仕組み（plugin-aware aggregation）

ホスト側にプラグイン固有のリテラルを持たないため、4つの定数は
**ホスト固定エントリ + 各プラグインの `meta.ts` 貢献を `defineHostAggregate` でマージ**して生成する。

| 定数 | 真実の源 | マージ元 |
|---|---|---|
| `API_ROUTES` | `src/config/apiRoutes.ts` | 各 plugin `META.apiRoutes` |
| `TOOL_NAMES` | `src/config/toolNames.ts` | 各 plugin `META.toolName` |
| `WORKSPACE_DIRS`/`PATHS` | `server/workspace/paths.ts` | 各 plugin `META.workspaceDirs` |
| `PUBSUB_CHANNELS` | `src/config/pubsubChannels.ts` | 各 plugin `META.staticChannels` |

- マージは **first-write-wins**（ホストキーがプラグインを上書き）。衝突は boot 時診断としてベルに出る。
- 詳細な「プラグインがどう自分の identity を宣言するか」は [`03-plugins-and-extensions.md`](03-plugins-and-extensions.md)。

## サーバ起動シーケンス（`server/index.ts`、概略）

1. backend 選択（fake-echo or Claude CLI）→ `initWorkspace()`（eager dir 作成）→ memory マイグレーション
2. Express セットアップ（`express.json` 50mb、same-origin CSRF ガード、`/api/*` の bearer 認証）
3. ルート登録（agent / sessions / wiki / plugins / `mcp-tools` ディスパッチ / scheduler 等）
4. ランタイムサービス（session-store 初期化・file watch・roles/skills ロード・notifier・runtime plugin ロード）
5. Socket.io pub/sub 起動 → scheduler 起動 → `listen(port, "127.0.0.1")`（既定 3001）

## 関連章

- このアーキ上を流れる具体的なフロー → [`02-flows.md`](02-flows.md)
- 拡張の全体像 → [`03-plugins-and-extensions.md`](03-plugins-and-extensions.md)
