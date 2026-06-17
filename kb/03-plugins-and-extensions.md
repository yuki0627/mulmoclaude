# 03 拡張機構 — plugin / MCP / skill / role / bridge

> 最終分析コミット: `8bf1667d`
> 対象範囲: `docs/extension-mechanisms.md`, `docs/plugin-runtime.md`, `src/plugins/**`, `packages/plugins/**`, `packages/bridges/**`, `server/plugins/**`
> 最終更新: 2026-06-17

## 7つの拡張パス（使い分け表）

| # | 機構 | 配布形態 | system promptに出る | LLM tool call | role gate 可 | 例 |
|---|---|---|---|---|---|---|
| 1 | **Built-in GUI plugin** | アプリにバンドル | ✅ | ✅ | ✅ | `presentHtml`, `wiki`, `accounting`, `canvas` |
| 2 | **Built-in MCP tool** | アプリにバンドル | ✅ | ✅ | ✅ | `notify`, `readXPost`, `searchX` |
| 3 | **Runtime plugin** | npm パッケージ | ✅ | ✅ | ❌（常時ON） | `@mulmoclaude/spotify-plugin` |
| 4 | **External MCP** | stdio / HTTP | △（説明のみ） | ✅ | ❌ | GitHub, Linear, Google Drive, Spotify-MCP |
| 5 | **Skill** | Markdown | ✅（frontmatter） | ❌ | ❌ | `~/.claude/skills/<name>/SKILL.md` |
| 6 | **Role** | TS / Markdown | ✅（persona） | ❌ | — | 6ビルトイン + custom |
| 7 | **Bridge** | npm パッケージ | ❌ | ❌ | ❌ | Telegram, Slack, LINE 等 |

判断の目安:
- **GUI を伴う新機能**を本体に入れたい → 1（built-in GUI plugin）
- **GUI 不要のツール**を本体に入れたい → 2（built-in MCP tool）
- **プロバイダ固有連携**（Spotify/GitHub/天気…）→ 3（runtime plugin）。CLAUDE.md のプラグイン境界ルール上、`server/` に「Spotify ルート」等を足すのは NG。
- **既存の外部 MCP サーバ**を繋ぐだけ → 4（`config/mcp.json` に書く。コード不要）
- **手順・知識の再利用**（コード不要）→ 5（skill）
- **ペルソナ + 使えるツールの束**を切り替えたい → 6（role）
- **外部チャットアプリから使いたい** → 7（bridge）

## Built-in GUI plugin の構成

各ビルトインプラグインは `src/plugins/<name>/` に自分の identity を宣言する（ホストは plugin 固有リテラルを持たない）。

```
src/plugins/<name>/
├── meta.ts         definePluginMeta({ toolName, apiRoutesKey?, apiRoutes?, workspaceDirs?, staticChannels? })
├── definition.ts   MCP ToolDefinition。TOOL_NAME = META.toolName を導出
├── index.ts        PluginRegistration（View/Preview を wrapWithScope でラップ、executor は pluginEndpoints<E>(scope)）
├── View.vue        チャット内 / 画面の表示。useRuntime() で endpoints を取得
└── Preview.vue     結果プレビュー
```

集約:
- `src/plugins/metas.ts` … `BUILT_IN_PLUGIN_METAS`（codegen `_generated/` が `*/meta.ts` を走査して自動生成 + 未移行の external 登録）
- `src/plugins/index.ts` … `BUILT_IN_PLUGINS`（registration 集約）。`src/tools/index.ts` の `getPlugin(toolName)` が参照
- `src/plugins/server.ts` … `BUILT_IN_SERVER_BINDINGS`（`{def, endpoint}`。GUIのみの wiki 等は除外）
- ホスト集約（`API_ROUTES`/`TOOL_NAMES`/`WORKSPACE_DIRS`/`PUBSUB_CHANNELS`）が `defineHostAggregate` で META を first-write-wins マージ（→ [`01-architecture.md`](01-architecture.md)）

ビルトイン追加時に触るのは「プラグインローカル 6ファイル + ホスト barrel 3つ（+必要ならルート）」。詳細は `docs/developer.md` / ルート `CLAUDE.md` の Plugin Development 節。

## Runtime plugin（npm パッケージ型）

| 観点 | Built-in | Runtime |
|---|---|---|
| 置き場所 | `src/plugins/<name>/` | `packages/plugins/<name>-plugin/` or ワークスペース ledger |
| バンドル | build時に同梱 | boot 時に動的 import（fetch） |
| 登録 | `BUILT_IN_PLUGINS` → `getPlugin()` | runtime registry map |
| 衝突ポリシー | static が勝つ | runtime は先勝ち |
| Vue | SFC を import | `dist/vue.js` を動的 import |
| role gate | 可 | 不可（常時ON） |

- preset（サーバ起動時に自動ロード）は `server/plugins/preset-list.ts` で宣言（例: spotify, debug(devOnly), edgar, email）。
- ローダ: `server/plugins/runtime-loader.ts` / `runtime-registry.ts`。
- プラグインは `gui-chat-protocol` の `definePlugin()` / `PluginRuntime`（`runtime.files` で機密のディスク保存、`runtime.fetch` で allowlist 付き HTTP）。
- 例: spotify-plugin は OAuth（connect / oauthCallback）+ token 永続 + 再生制御（play/pause/next/seek）等の dispatch kind を持つ。
- scaffold: `npx create-mulmoclaude-plugin`（テンプレは `packages/create-mulmoclaude-plugin/src/template.ts` に文字列リテラルで埋め込み。toolchain 版数はここを別途同期する必要あり — ルート CLAUDE.md 参照）。

## External MCP（コード不要で繋ぐ）

`<workspace>/config/mcp.json` に stdio / HTTP の MCP サーバを定義（Claude CLI の `--mcp-config` 互換）。
- stdio: `command` は `npx`/`node`/`tsx` に制限（セキュリティ）。**Docker下では基本動かない**。
- HTTP: `url` は `http:`/`https:`。Docker下でも動く。
- ツール許可は `mcp__<server>__<tool>` / `mcp__<server>__*` / `mcp__<server>`（短縮）。詳細 → [`04-setup-and-config.md`](04-setup-and-config.md)、`docs/mcp-sandbox.md`, `docs/claude-code-allowed-tools.md`。

## Skill / Role

- **Skill**: 手順・知識を Markdown（`SKILL.md`）で再利用。チャットで「save this as a skill called X」や `manageSkills` ツールで作成 → `~/mulmoclaude/.claude/skills/<slug>/SKILL.md`。frontmatter に `schedule: daily 08:00` を書くと自動でスケジュール登録。
- **Role**: ペルソナ + `availablePlugins`（使えるツールの束）+ system prompt。`src/config/roles.ts`（`ROLES`、`:45`〜）。詳細・カスタム作成は [`04-setup-and-config.md`](04-setup-and-config.md)。

## Bridge（外部メッセージングアプリ連携）

- `packages/bridges/*`（27種）。MulmoClaude サーバへ socket.io（path `/ws/chat`）で接続する独立プロセス。
- 共通構造: `@mulmobridge/client` の `createBridgeClient({ transportId })` + `@mulmobridge/protocol` + 各プラットフォーム SDK。
- 起動例: `yarn cli` / `yarn telegram` / `npx @mulmobridge/slack`。
- 認証: `MULMOCLAUDE_AUTH_TOKEN` env か `~/.mulmoclaude/.session-token`。**再起動でトークンが変わる**ため長時間運用は env でピン留め。
- wire: handshake `auth:{transportId, token}` → message `{externalChatId, text, attachments?}` → ack `{ok, reply/error}`。
- 詳細 → `docs/bridge-protocol.md`, `docs/mulmobridge-guide.md`。Relay（Cloudflare Workers）経由の webhook 受けは `@mulmobridge/relay`。

## 関連章

- 集約定数の仕組み → [`01-architecture.md`](01-architecture.md)
- ツール呼び出しが実行される流れ → [`02-flows.md`](02-flows.md)
- role/skill/mcp の設定手順 → [`04-setup-and-config.md`](04-setup-and-config.md)
