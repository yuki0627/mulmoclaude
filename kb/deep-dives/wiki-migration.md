# wiki-migration — 外部 vault（Obsidian 等）→ MulmoClaude wiki 移行

> 最終分析コミット: `8bf1667d`
> 対象範囲: `src/lib/wiki-page/*`, `server/workspace/wiki-pages/*`, `data/wiki/`
> 最終更新: 2026-06-17
> ステータス: **進行中**（ユーザーの vault プロファイル出力待ち）

## 目的（どんな質問に答える章か）

ユーザーは個人ナレッジ（`/Users/yuki/Projects/MyVault`、おそらく Obsidian vault）を
MulmoClaude の wiki に移す/取り込むことを検討中。「移行で何が詰まるか・どう設計するか」に即答するための章。

> 注: vault はユーザーのローカル Mac 上にあり、クラウド側のこのセッションからは見えない。
> プロファイルは下記コマンドをローカル実行して取得する。

## 互換性サマリー

両者とも「プレーン Markdown + `[[リンク]]`」。MulmoClaude 側は:
- ページ実体: `data/wiki/pages/<slug>.md`、カタログ: `data/wiki/index.md`
- リンク記法: `[[target|display]]`（`src/lib/wiki-page/link.ts` の `parseWikiLink` / `WIKI_LINK_PATTERN`）
- `#tag` は Unicode 対応（`src/lib/wiki-page/index-parse.ts:39` `HASHTAG_PATTERN`、日本語タグOK）

**両方ただの MD なので移行は可逆**＝低リスク。失敗してもファイルを戻すだけ。

## 詰まりやすい点（重要度順・コード根拠つき）

| # | 懸念 | 根拠 | 影響 |
|---|---|---|---|
| 1 | **フォルダ階層を持てない（フラット名前空間）** | slug に `/` `\` 不可（`slug.ts:31-37` `isSafeSlug`） | ネストフォルダを平坦化要。同名ノート衝突 |
| 2 | **日本語ファイル名がスラッグ化できない** | `wikiSlugify` が非ASCIIを全除去→空文字（`slug.ts:49-54`） | 各ページに **ASCII slug ファイル名**が必要。日本語タイトルは `index.md` に登録＋リンクは `[[slug\|表示名]]` 運用 |
| 3 | **Obsidian 独自リンクは非対応** | 対応は `[[target\|display]]` のみ（`link.ts`） | 見出し `[[page#節]]`・ブロック `[[page#^id]]`・**埋め込み `![[...]]`** は壊れる（broken link 化） |
| 4 | **`index.md` カタログが中核** | resolver/lint が index 前提（`index-parse.ts`、bullet 記法 `BULLET_WIKI_LINK_PATTERN`） | 取り込み時にカタログ再生成が必須。大量取り込みは lint 警告が大量 |
| 5 | **添付・画像のパス書き換え** | 画像は `artifacts/`・`data/attachments/YYYY/MM/` 体系 | Obsidian の `![[image.png]]` や相対パスは標準 `![](path)` へ変換要 |
| 6 | **プラグイン資産は移行不可** | — | Dataview / Templater / Canvas / Excalidraw 等の動的機能は消える |
| 7 | **編集ワークフローの変化** | ワークスペースは1つ・アプリ/Claude 経由編集 | Obsidian のモバイル編集・同期・エディタ機能を失う（bridge 経由編集は限定的） |
| 8 | **スケール時の副作用負荷** | backlink/lint/graph が保存時に走る（`server/workspace/wiki-backlinks/*`） | 数千ノート一括取り込みは重く・ノイジー |

## 見立て

「全部一気」より、**一部ノートで試験取り込み → slug化・index生成・リンク変換のコストを実測 → 判断**が安全。
最大の論点は #1（階層）と #2（日本語ファイル名）。ここの運用ルール
（ASCII slug + index にタイトル登録 + リンクは `[[slug|表示名]]`）を先に決めれば、あとは機械的変換。

## 次の一歩（ローカルで実行）

vault のプロファイルを取得して、上の懸念が実際どれだけ発生するか定量化する。
Mac のターミナルで（zsh のヒストリ展開回避のためラベルに `!` を入れていない版）:

```bash
( cd "/Users/yuki/Projects/MyVault" || exit
  echo "== vault profile =="
  echo "Obsidian?         : $([ -d .obsidian ] && echo yes || echo no)"
  echo ".md 数            : $(find . -name '*.md' | wc -l | tr -d ' ')"
  echo "全ファイル数      : $(find . -type f | wc -l | tr -d ' ')"
  echo "最大フォルダ深さ  : $(find . -type d | awk -F/ '{print NF}' | sort -rn | head -1)"
  echo "サブフォルダ数    : $(find . -type d | wc -l | tr -d ' ')"
  echo "非ASCIIファイル名 : $(find . -name '*.md' | LC_ALL=C grep -c '[^ -~]')"
  echo "リンク総数[[ ]]   : $(grep -rIoE '\[\[[^]]+\]\]' --include='*.md' . 2>/dev/null | wc -l | tr -d ' ')"
  echo "  内 埋め込み      : $(grep -rIoE '!\[\[[^]]+\]\]' --include='*.md' . 2>/dev/null | wc -l | tr -d ' ')"
  echo "  内 見出し/ブロック: $(grep -rIoE '\[\[[^]]*#[^]]*\]\]' --include='*.md' . 2>/dev/null | wc -l | tr -d ' ')"
  echo "frontmatter有り   : $(grep -rl --include='*.md' -e '^---$' . 2>/dev/null | wc -l | tr -d ' ')"
  echo "添付(画像/PDF等)  : $(find . -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.gif' -o -iname '*.webp' -o -iname '*.pdf' -o -iname '*.excalidraw' \) | wc -l | tr -d ' ')"
)
```

取得後に詰めること:
- 移行スタンス（完全乗り換え / 両立（取り込み）/ 試験的に一部）
- フォルダ平坦化ルール（prefix で擬似階層: `proj-foo.md` など）
- slug 採番 & 日本語タイトル↔slug の対応表自動生成
- リンク変換（`![[ ]]`/`[[#]]` の扱い、画像 `![]( )` 化）
- index.md 生成方針（規模に応じ分割）

## ローカルで作業を継続するには

この調査はブランチ `claude/magical-dijkstra-a6in0y` に保存済み。手元の Mac で:

```bash
cd <あなたのforkクローン>
git fetch origin
git checkout claude/magical-dijkstra-a6in0y   # kb/ と本章が手に入る
git pull origin claude/magical-dijkstra-a6in0y
```

## 関連

- wiki の基本: [`../04-setup-and-config.md`](../04-setup-and-config.md)（データ機能）
- 拡張機構の位置づけ: [`../03-plugins-and-extensions.md`](../03-plugins-and-extensions.md)
