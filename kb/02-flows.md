# 02 フロー — 主要な制御・データフロー

> 最終分析コミット: `8bf1667d`
> 対象範囲: `server/agent/**`, `server/api/routes/agent.ts`, `server/events/**`, `src/main.ts`, `src/App.vue`
> 最終更新: 2026-06-17

## チャット実行フロー（`POST /api/agent` → 画面更新）

```
[ブラウザ] POST /api/agent { message, roleId, chatSessionId, attachments? }
   │
   ▼  server/api/routes/agent.ts
startChat(params)                                   ← server/api/routes/agent.ts:136
   1. セッションID取得 / getOrCreateSession() で in-memory 初期化
   2. beginRun(chatSessionId) で実行フラグ（既実行なら 409 reject）
   3. inline 添付を data/attachments/YYYY/MM に永続化、path 抽出
   4. user メッセージを JSONL 追記 + pushSessionEvent() で pub/sub 発行
   5. runAgentInBackground() をバックグラウンド開始（即 { kind:"started" } を返す）
   │
   ▼  runAgentInBackground(params)                   ← server/api/routes/agent.ts:873
runAgent(input)  … AsyncGenerator<AgentEvent>        ← server/agent/index.ts:40
   - Docker有無判定 → credential更新 → memory snapshot 読込
   - system prompt 構築（prompt.ts）→ MCP config をアトミック書込
   - backend.runAgent() を yield* で反復（Claude CLI 起動）
   │  各 AgentEvent ごとに:
   ├─ pushSessionEvent()  → Socket.io へ publish（チャネル = session）
   └─ enqueueJsonlAppend() → セッション JSONL に FIFO 追記
   │
   ▼  endRun() で isRunning=false、afterChat 副作用（journal / wiki-backlinks / tool-trace）を fire-and-forget
   │
[ブラウザ] /ws/pubsub を購読 → AgentEvent を受信 → sessionMap 更新 → UI 再描画
```

`AgentEvent` は union 型（`server/agent/stream.ts:3`）:
`status` / `text` / `toolResult` / `error` / `toolCall` / `toolCallResult` / `claudeSessionId`。

補助ルート: `POST /api/agent/cancel`（実行中の abort）、`POST /api/agent/internal/toolResult`（MCPサーバが結果を投入）。

## MCP ブリッジ（Claude のツール呼び出しが自サーバに戻る仕組み）

MulmoClaude のプラグイン（ツール）は、Claude CLI から見ると MCP ツール。
Claude CLI は起動時に `--mcp-config` で **stdio MCP サーバ**（`server/agent/mcp-server.ts`）を立ち上げる。

```
Claude CLI  ──(JSON-RPC over stdio)──►  server/agent/mcp-server.ts
                                          handleToolCall(name, args)      ← :421
                                            └─(HTTP POST)─► /api/mcp-tools/<name>  ← :432
                                                              └─► 各プラグインの endpoint 実装
                                            ◄─ 結果テキストを JSON-RPC で返す
```

- bearer は `SESSION_TOKEN` env もしくは `.session-token` から読む。
- ランタイムプラグインは起動時に非同期ロードされ、ツール集合（`ALL_TOOLS`）に登録される。
- **Docker サンドボックス下では外部 stdio MCP がほぼ動かない**点に注意（`00-overview.md` の制約表参照）。この自前 MCP ブリッジ自体は別物で常に動く。

## セッション状態の保持（dual store）

`server/events/session-store/index.ts`。状態は **in-memory + JSONL ファイル** の二重持ち（クラッシュ耐性）。

- `ServerSession`（`:28`）: `isRunning`, `statusMessage`, `toolCallHistory`, `resultsFilePath`(JSONL path), `abortRun?`, `pendingGenerations`, `jsonlWriteQueue` 等。
- `getOrCreateSession()`（`:88`）でストア初期化。
- `pushSessionEvent()`（`:222`）が **pub/sub 発行 + JSONL 追記** を同時に行う。
- `enqueueJsonlAppend()`（`:128`）が FIFO（`jsonlWriteQueue`）で書き込みを直列化 → 行の混線を防ぐ。
- `beginRun()`（`:164`）/ `endRun()` / `cancelRun()` で実行ライフサイクル管理。
- **idle eviction**: 1時間（`ONE_HOUR_MS`）アクセスが無いセッションはメモリから退避。ただし `pendingGenerations` があれば残す。

## pub/sub（サーバ → ブラウザのリアルタイム配信）

- 実体は **Socket.io**。`createPubSub()`（`server/events/pub-sub/index.ts:15`）、path `/ws/pubsub`。
- チャネル = Socket.io room。`publish(channel, data)` → `ioServer.to(channel).emit("data", {channel, data})`。
- 1セッションを複数クライアント（複数タブ・bridge）が購読可能。
- チャネル定義は `src/config/pubsubChannels.ts`（`PUBSUB_CHANNELS`、host固定 + plugin の `staticChannels`）。

## フロント側のデータフロー

- `src/main.ts:80` `installHostContext({...})` で **プラグイン向け DI コンテナ**を構築（endpoint レジストリ、ページルート、role id 等を登録）。
- `App.vue` が pub/sub を購読し、リアクティブな `sessionMap` を更新。メモリ内セッションとサーバ要約を merge して表示。
- ビルトイン/ランタイム双方のプラグイン View は `PluginScopedRoot.vue` でラップされ、子孫の `useRuntime()`（`gui-chat-protocol/vue`）が型付き `endpoints` / `files` / `fetch` を解決できる。

## 関連章

- 各レイヤーの責務とファイル位置 → [`01-architecture.md`](01-architecture.md)
- プラグイン/ツールの登録と実行 → [`03-plugins-and-extensions.md`](03-plugins-and-extensions.md)
