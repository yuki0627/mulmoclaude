# MulmoClaude 知識ベース（kb/）

> グローバル最終分析コミット: `8bf1667d` (Merge PR #1719)
> 最終更新: 2026-06-17
> 言語: 日本語（コード名・識別子・パスは英語のまま）

このディレクトリは **Claude（私）が MulmoClaude について即答するための知識ベース**です。
ユーザーはこのリポジトリを開発するのではなく、**MulmoClaude を自分の作業環境として使う**のが目的。
「何ができる/できないか」「どう設定・カスタマイズするか」といった質問に、毎回ゼロ調査せず
このドキュメント群から即答することを狙います。

---

## 将来の私へ：使い方

1. **質問が来たら、まず該当章を読んで即答する。** 章で足りるなら実コードは開かない。
2. **足りない/古い疑いがある時だけ**、各章末や本INDEXの「章↔ソースパス対応表」のポインタから実コードを開く。
3. ポインタは `file:line` 形式。行番号は分析時点のもので**ずれている可能性がある**ため、シンボル名（関数名・定数名）で再検索するのが確実。
4. コード変更を取り込んだら、必ず下の「増分更新手順」で kb を更新する。

## 章一覧（目次）

| 章 | ファイル | 内容 |
|---|---|---|
| 概要 | [`00-overview.md`](00-overview.md) | MulmoClaude とは／**できること・できないこと**（ユーザー視点） |
| アーキテクチャ | [`01-architecture.md`](01-architecture.md) | 3レイヤー（server/src/packages）の責務マップ、集約定数の仕組み |
| フロー | [`02-flows.md`](02-flows.md) | チャット実行・MCPブリッジ・セッション状態・pub/sub の制御/データフロー |
| 拡張機構 | [`03-plugins-and-extensions.md`](03-plugins-and-extensions.md) | 7つの拡張パス（plugin/MCP/skill/role/bridge…）の使い分け |
| セットアップ・設定 | [`04-setup-and-config.md`](04-setup-and-config.md) | 起動・環境変数・ワークスペース・ロール・スケジューラ・データ機能 |
| 深掘り | [`deep-dives/`](deep-dives/) | 領域別の詳細分析（随時追加） |

### deep-dives 一覧

| ファイル | 内容 | ステータス |
|---|---|---|
| [`deep-dives/wiki-migration.md`](deep-dives/wiki-migration.md) | 外部 vault（Obsidian 等）→ MulmoClaude wiki 移行の懸念と手順 | 進行中 |

---

## 増分更新手順（重要）

本家(upstream `receptron/mulmoclaude`)の更新を取り込んだら、以下で kb を更新する。

```bash
# 1. 前回分析以降のコミットを列挙
git log 8bf1667d..HEAD --oneline

# 2. 各コミットの変更ファイルを確認
git log 8bf1667d..HEAD --stat
```

3. 変更ファイルを下の「章↔ソースパス対応表」と突き合わせ、**影響を受けた章だけ**更新する。
4. 更新した章ヘッダの「最終分析コミット」と「最終更新」を新しい HEAD / 日付に更新。
5. 最後に本 INDEX 冒頭の **グローバル最終分析コミット** を新しい HEAD に更新。
6. 大きな新機能なら `deep-dives/` に章を追加するか、対応表に行を足す。

### 章↔ソースパス対応表

更新時、変更ファイルがどの章に属するかを引くための表。

| ソースパス（glob） | 主に影響する章 |
|---|---|
| `server/agent/**` | 02-flows / 01-architecture |
| `server/api/routes/agent.ts` | 02-flows |
| `server/api/routes/**`（その他） | 01-architecture（+ 該当機能章） |
| `server/events/**` | 02-flows |
| `server/workspace/paths.ts` | 01-architecture / 04-setup-and-config |
| `server/system/**`, `server/utils/**` | 01-architecture |
| `server/plugins/**` | 03-plugins-and-extensions |
| `src/App.vue`, `src/main.ts`, `src/router/**` | 01-architecture / 02-flows |
| `src/plugins/**` | 03-plugins-and-extensions |
| `src/config/{apiRoutes,toolNames,pubsubChannels}.ts` | 01-architecture |
| `src/config/roles.ts` | 04-setup-and-config / 03-plugins-and-extensions |
| `packages/protocol`, `packages/client`, `packages/chat-service` | 01-architecture |
| `packages/bridges/**` | 03-plugins-and-extensions |
| `packages/plugins/**` | 03-plugins-and-extensions |
| `packages/scheduler`, scheduler 関連 | 04-setup-and-config |
| `README*.md`, `docs/**` | 00-overview / 04-setup-and-config |

---

## ブランチ運用メモ

- このリポジトリは `yuki0627/mulmoclaude`（fork）。upstream は `receptron/mulmoclaude`。
- `main` = **本家ミラー専用**。kb のコミットは置かない（常に fast-forward 同期できる状態を保つため）。
- `claude/magical-dijkstra-a6in0y` = **この kb と将来のローカル実験**を置く作業ブランチ。
- 同期手順: `main` を upstream に ff → 作業ブランチに `git merge main` → 上の増分更新手順で kb を更新。
- **発見性**: ルート `CLAUDE.md` 冒頭に kb へのポインタ節がある（作業ブランチのみ）。upstream 同期で `CLAUDE.md` が衝突したら、このポインタ節だけ付け直すこと。
