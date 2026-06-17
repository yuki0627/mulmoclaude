# deep-dives/ — 領域別の詳細分析

> 最終分析コミット: `8bf1667d`
> 最終更新: 2026-06-17

全体地図（`kb/00`〜`04`）で足りない、特定領域の**関数レベル詳細**をここに置く。
質問が深くなって全体地図だけでは即答できなくなった領域から、必要に応じて追加する。

## 命名規約

`kb/deep-dives/<topic>.md`（小文字ハイフン）。例:
- `agent-loop.md` … `runAgent()` 内部の各ステップ（Docker判定・credential・MCP config 書込・abort/cleanup）
- `plugin-execution.md` … built-in/runtime プラグインの登録〜ディスパッチ〜View 描画の全経路
- `bridge-protocol.md` … socket.io handshake / message / ack の詳細とプラットフォーム差異
- `memory-and-journal.md` … memory snapshot とジャーナル要約の生成
- `scheduler-internals.md` … task-scheduler の永続化・キャッチアップ判定

## 各 deep-dive のテンプレ

```
# <topic>
> 最終分析コミット: <SHA>
> 対象範囲: <主に見たファイル/glob>
> 最終更新: YYYY-MM-DD

## 目的（どんな質問に答えるための章か）
## 全体像（図）
## 関数レベルの流れ（file:line ポインタ付き）
## 落とし穴・制約
## 関連: kb/01〜04 のどこに紐づくか
```

## 追加したら

- `kb/INDEX.md` の章一覧と「章↔ソースパス対応表」に行を足す。
- 既存の全体地図と矛盾しないよう、該当章からこの deep-dive へリンクする。
