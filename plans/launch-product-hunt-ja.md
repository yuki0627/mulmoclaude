# MulmoClaude — Product Hunt ローンチ戦略(日本語版)

*英語原本: [`launch-product-hunt.md`](./launch-product-hunt.md) — タグライン、PH 掲載コピー、ツイート文面、動画キャプションなど実際に公開されるコピーは英語のまま残しています。戦略上の説明文のみ日本語化。*

**オーナー:** CMO(戦略)、Engineering(素材制作)、Community(当日オペレーション)
**ローンチ予定日:** 火曜日(1 週間後) — 米西海岸時間 00:01 キックオフ
**ポジショニング・ワンライナー:** *Claude Code that produces docs, presentations, spreadsheets, videos, and remembers everything.*
**コア・セーシス(製品の背後にあるストーリー):** これは AI ネイティブなオペレーティングシステムの最初の可視化された表層である。Claude Code がカーネル、MulmoClaude はそのシェルであり、コンポジターであり、ユーザーが実際に目にするファイルシステムである。**ユニークなのはどれか一つの機能ではなく、「場所」そのものである。** ネットの記事(ソース巡回経由)、チャットの会話、ローカルのファイル、スケジュール実行、スマホからのメッセージ — そのすべてが `~/mulmoclaude/` という一つのローカルフォルダに、プレーンな Markdown として、AI にメンテナンスされた状態で集まる。**これは AI 時代のホームディレクトリの再発明** である。
**ターゲット・アーリーアダプター(ひとつの層に絞る、四つではなく):** ターミナルの限界に既にぶつかっている Claude Code のパワーユーザー。それ以外の層 — 生産性ユーザー、ナレッジワーカー、AI 愛好家 — はフェーズ 2 で、彼らはパワーユーザー経由で流入する。並列に狙わない。

---

## 1. ポジショニングとタグライン

### プライマリ・タグライン(Product Hunt ヒーローライン)

> **MulmoClaude — Claude Code that produces docs, presentations, spreadsheets, videos, and remembers everything.**

この一文が製品のすべて。具体的な名詞列(docs, presentations, spreadsheets, videos)が仕事をする — 半秒で「何が返ってくるか」が視聴者に伝わる。"Remembers everything" が堀(モート)だ。あらゆる表層 — ヒーロー動画、PH ヘッドライン、ツイート #1、ギャラリー・キャプション — は、この一文に戻って来なければならない。それ以外(並列セッション、ブリッジ、サンドボックス、ロール、スキル、チャート)はすべて *エビデンス* であって、メッセージではない。

**ドラフトの鉄則:** "artifacts" と書きたくなったら、毎回具体的な名詞列に置き換えること。抽象語はアップボートを逃す。

### サポーティング・タグライン(SNS とヒーロー画像の A/B 候補)

1. *Docs. Presentations. Spreadsheets. Videos. Out of Claude Code. And it remembers.*
2. *Claude Code that produces the things you actually ship — and gets smarter every chat.*
3. *Turn any research paper into a document, a deck, and a narrated video — without opening anything else.*
4. *Run five Claude Code agents in one browser tab. Get documents, decks, and videos back — not text.*
5. *`~/mulmoclaude/` — a local knowledge base that grows itself. Web, files, conversations — all here. Reach it from anywhere.* **(Geek 向け; HN、X-dev、ターミナルネイティブ層向け。)**

### カテゴリ選択

プライマリ: **Developer Tools** · セカンダリ: **Artificial Intelligence**
Dev Tools は我々が狙う唯一のオーディエンス(Claude Code のパワーユーザー)が棲息する場所。Productivity は完全にスキップ — PH 当日に二層を追うのは、どちらも取り逃す道。AI は防衛的なサードまで。

---

## 2. ワン・センテンス・ピッチ

**MulmoClaude turns Claude Code into a system that produces real documents, presentations, spreadsheets, and narrated videos, runs multiple agents at once, and builds a personal knowledge base from everything you do.**

3 つの節を、ユーザーの脳が問う順序で並べてある: *何を作るのか? どのくらい速いのか? 賢くなっていくのか?* このプラン内の他のすべては補強証拠にすぎない。

### 深層フレーム(視聴者がより多くを受け止められるときに使う)

> **AI が自分専用のワークスペースを育ててくれる。調べ物も、整理も、ファイル管理も自動で、どこからでもアクセスできる。全部ローカルで、全部自分のもの。**

本当の差別化要因はどれか一つの機能ではなく、**「場所」** である。ネットの記事(ソース巡回経由)、チャットの会話(Wiki への自動抽出経由)、ローカルのファイル(ファイルエクスプローラー経由)、スケジュール実行、スマホからのメッセージ — *そのすべてが一つのフォルダに集まる*。プレーンな Markdown として、Claude にメンテナンスされた状態で。Notion はクラウド。Google Drive はクラウド。Obsidian はローカルだが AI が勝手に育てない。MulmoClaude は **3 つの性質を同時に一つの場所に持っている: ローカル・AI がメンテナンス・マルチソース。**

### アンチ・ラッパー・ライン("ChatGPT クローンなのでは?"に対する常備反論)

> **This doesn't call the Claude API. It runs Claude Code directly — your auth, your tools, your files, your environment.**

この区別こそが、この製品が他にはできないことを可能にしている根源的理由である。メーカーポスト、HN タイトル、ツイート #1 で一字一句そのまま反復すること。

---

## 3. Product Hunt で勝てる理由

PH の投票者が評価するのは 3 つ: **明快な "aha"**、**短いデモ**、**単なるラッパーではないナラティブ**。MulmoClaude は 3 つとも満たしている。

| Hunt 側が無意識に聞いてくる問い     | MulmoClaude の答え                                                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| "ChatGPT クローンでは?"             | 違う — Claude Code の上に乗っている(ローカル認証、ユーザーのファイルシステム、ユーザーのツール)。API ラッパーではない。|
| "新しいアイディアは何?"             | **一つのフォルダにすべてが集まる** — ネット記事、チャット、ファイル、スケジュール実行 — Markdown で、AI が手入れする。ホームディレクトリの再発明。|
| "それって Notion や Obsidian では?" | Notion はクラウド。Obsidian はローカルだが自分では育たない。MulmoClaude は **ローカル + AI メンテ + マルチソース** — 3 つ同時に、1 箇所で。|
| "60 秒で試せる?"                    | `demo.mulmoclaude.com` でホストデモ。サインアップなし、クラウド口座なし、ベンダーロックインなし。                 |
| "明日も気にする理由は?"             | チャット、巡回した記事、スケジュール実行、そのすべてが **同じフォルダに着地して Wiki に編み込まれる**。複利で効いてくる。|

---

## 4. キー・メッセージ(9 個を 5 個に圧縮、並び替え済み)

PH 閲覧者は約 10 秒でスキミングし、覚えるアイディアは 1 つ。ゆえに **5 つ** に絞り、ユーザーの脳が質問してくる順序で並べる。それ以外のもの(ロール、スキル、ブリッジの機能列挙、Markdown ストレージ)は補強証拠 — コメントスレッドや FAQ 用の弾薬として温存し、ヒーローコピーには出さない。

### 5 つ(優先度順)

1. **Docs, presentations, spreadsheets, videos — not text.** Claude Code は、**本物のドキュメント、ナレーション付きスライドデッキ、スプレッドシート、ECharts ダッシュボード、AI 生成動画**(MulmoScript / MulmoCast: Gemini image + Veo 3.1 video + 音声ナレーション)で返事をする。チャットバブルではない。これこそが "multi-modal" の真の意味であり、オープンな GUI Chat Protocol によって可能になっている。
2. **Parallel Claude Code, in one browser tab.** **複数のセッションを同時に走らせられる** — あるセッションは動画を生成し、別のセッションはコードをリファクタリングし、もうひとつはメールの下書きを書く。Claude Code はもうシングルスレッドではない。*これがヒーロー動画のカテゴリ決定ショットだ。*
3. **Everything in one folder, growing itself.** ネット記事(ソース巡回経由)、チャット会話、ローカルファイル、スケジュール実行、スマホからのメッセージ — *そのすべてが一つのローカルフォルダ*(`~/mulmoclaude/`)*に集まる*。プレーンな Markdown、相互リンクされ、Claude 自身がメンテナンスする。Karpathy の *LLM Knowledge Bases* 構想の実装。**これが堀であり、機能ではなく「場所」の話だ:** Notion はクラウド、Obsidian はローカルだが不活性、MulmoClaude は **ローカル + AI メンテ + マルチソース** — 3 つ同時に成立する。他のあらゆる Claude クライアントがゼロから始まるのに対し、MulmoClaude だけは複利で積み上がる。なぜならすべての入力が同じ場所に着地するから。
4. **Your phone is a Claude Code client.** Telegram、Slack、LINE、Discord、WhatsApp、Matrix への橋 — 同じエージェント、同じワークスペース、同じ Wiki。地下鉄の中でタスクを投げ、ノート PC の前に戻るとドキュメント(あるいは動画)が待っている。
5. **Sandboxed, so you can trust it.** Claude Code はファイルシステムアクセスを持つ — それが価値の源泉であり、同時にリスクそのものである。MulmoClaude は Claude を **ワークスペースしか見えない Docker コンテナ** の中で自動的に実行する。SSH 鍵、`.env` ファイル、ホームディレクトリ — すべて不可視。設定不要、パーミッションダイアログ不要。*AGPL + Docker を「複雑さ」ではなく「まともなシェルに相応しい配慮の水準」として再フレームする。*

### 温存するもの(ヒーローコピーに出さない — コメントスレッド用の燃料)

- ロール(General, Office, Guide & Planner, Artist, Tutor, Storyteller, MulmoCaster) — "何ができるの?"と訊かれたときだけ触れる。
- スキルランチャー + SKILL.md スケジューリング — Claude Code インサイダー向けのウインク、HN に取っておく。
- Markdown-as-database / ワークスペース可搬性 — "賢くなっていく" ストーリーの足場。ロックインを突かれたときだけ表面化させる。
- ECharts、ファイル添付、DOCX/XLSX/PPTX — 個別機能であってピッチではない。

---

## 5. Product Hunt 掲載コピー

### ヘッドライン(60 文字以内)
`MulmoClaude — Docs, decks, sheets, videos from Claude Code` *(58 文字)*

### タグライン(60 文字以内)
`Parallel sessions. Personal wiki. Phone bridges. Sandboxed.` *(58 文字)*

### ファーストコメント(メーカーポスト — 固定)

```
Hi Product Hunt 👋

I'm Satoshi Nakajima. I spent eight years at Microsoft working on
operating systems (lead architect on early Windows releases), then
spent the last year obsessing over a single question: **what does an
AI-native OS actually look like?**

I don't think it's ChatGPT. I don't think it's Copilot. I think the
kernel is something like Claude Code — an agent with direct access to
your files, your tools, your environment. Powerful, but living inside
a terminal.

Terminals were the OS shell of 1975. We can do better.

MulmoClaude is my attempt at the **shell for that new kernel**. It
does three things:

**1. Claude replies with real documents, decks, spreadsheets, and videos — not text.**
Documents, spreadsheets, ECharts dashboards, forms, 3D scenes — and
full narrated slide decks and AI-generated videos via the built-in
MulmoScript / MulmoCast engine (Gemini image + Veo 3.1 video +
audio). Drop in a research paper, get back a summary doc, a deck, and
a narrated video. No other tools opened.

**2. It runs many Claude Code agents in parallel, in one browser tab.**
Kick off a video render in one session, refactor code in another,
draft an email in a third. While one is working, you keep working.
Claude Code is no longer single-threaded.

**3. It gets smarter every conversation.**
Every ingested article, every decision, every fact becomes a
cross-linked page in a personal wiki Claude builds and maintains
itself (inspired by @karpathy's *LLM Knowledge Bases* post). It's
all plain Markdown in `~/mulmoclaude/` — git-friendly, portable,
yours. This is the part I'm proudest of: **every other Claude client
starts from zero; this one compounds.**

Two details that matter:

- **Not a wrapper.** This doesn't call the Claude API. It runs the
  actual Claude Code CLI — your auth, your filesystem, your skills,
  your MCP servers. That's why it can do what it does.
- **Sandboxed by default.** Claude runs inside a Docker container
  that only sees your workspace. SSH keys, `.env` files, home
  directory — invisible. Auto-detected on launch, no configuration.

You can also reach the same workspace from Telegram, Slack, LINE,
Discord, WhatsApp, Matrix — same agent, same wiki memory. Fire a
task from the subway, see the result on your laptop.

Open source, AGPL.

If you're already a Claude Code power user who's hit the walls of
the terminal, this is built for you. Would love your honest feedback
— this is the first visible surface of a much bigger thesis about
what computing looks like when AI is the kernel.

— Satoshi
```

### ギャラリー・キャプション(スクリーンショット 1 枚ごとに 1 キャプション)

9 枚から 6 枚に削減。それぞれがキー・メッセージ(5 個)のいずれか、もしくはショックデモに対応している。孤児キャプションなし。

1. **ショックデモ** — "Drop in a research paper. Out comes a summary document, a slide deck, and a narrated video. No other tools opened." *(ギャラリーの先頭に置く。"え、そんなことできるの?"の瞬間だから。)*
2. **並列セッション(ヒーロー)** — "Three Claude Code sessions running at once, one browser tab. One renders a video, one builds a spreadsheet, one drafts email."
3. **Docs, decks, spreadsheets, videos — not text** — "Claude Code's answer isn't a chat bubble. It's a document, a deck, a spreadsheet, a chart, or a narrated video you can edit and keep."
4. **すべてが一つのフォルダに** — "Web articles, chats, local files, scheduled runs — all converge into `~/mulmoclaude/` as Markdown, maintained by Claude. The home directory, reinvented."
5. **スマホがクライアント** — "Message Claude from Telegram, LINE, Slack, WhatsApp. Send a photo from the subway, get a document back on your laptop."
6. **デフォルトでサンドボックス** — "Docker auto-detected. Claude only sees your workspace. SSH keys, .env files, home directory — invisible."

---

## 6. デモ動画プラン

動画は 3 本 — それぞれ別のチャネル向け。**必ず無音で収録した後、一度だけナレーションを乗せ、キャプションを付けて出す。**

### Video A — 60 秒ヒーロー(Product Hunt ギャラリー + Twitter/X)

- **ゴール:** 視聴者 1 人につき 1 アップボート。機能列挙をしない。
- **絶対に決めなければならない 1 ショット:** 3 つの Claude Code セッションが同時に走っているスプリットスクリーン、そのうち 1 つが投入された研究論文からナレーション付きの MulmoCast 動画を生成している画。このショット 1 枚が、ピッチ全体をフレームに収めている。
- **ショックデモ(冒頭):** 本物の研究論文 PDF を 1 つのセッションにドラッグ → 出てくるのは **要約ドキュメント + スライドデッキ + ナレーション付き動画**。水循環の解説動画ではない。ターゲット層が実際に欲しがるリアルな成果物。
- **構成:**
  - 0:00–0:05 — コールドオープン: 手が PDF("Attention Is All You Need" あるいは類似の、視認できるラベル付き)をブラウザにドラッグ。ロゴなし、タイトルカードなし。
  - 0:05–0:20 — 3 つのセッションのスプリットスクリーンにスナップ。セッション 1(最大): 論文 → 要約ドキュメント → デッキ → Veo 3.1 クリップ入り MulmoCast ナレーション動画。セッション 2: ペーストされた CSV からスプレッドシートが構築される。セッション 3: ECharts のローソク足チャートが出現。**すべて同時進行、カットなし、スピナー待ちなし。**
  - 0:20–0:30 — キャプションオーバーレイ: *"Every conversation makes the next one smarter."* Wiki サイドバーにズーム: 新しいページが出現し、既存の 2 ページに相互リンクされる。
  - 0:30–0:40 — スマホがフレームに入る: 同じワークスペースへの Telegram メッセージ → ノート PC のキャンバスがライブで更新される。キャプション: *"Your phone is a Claude Code client."*
  - 0:40–0:50 — Docker サンドボックス・バナーが画面に。キャプション: *"Sandboxed. Claude only sees your workspace."*
  - 0:50–0:55 — アンチ・ラッパー・ビート。白地に黒の 1 フレーム: *"This is not an API wrapper. This is Claude Code — with a shell."*
  - 0:55–1:00 — ロゴ + GitHub URL + ワンライン・インストール。**ホストされたデモを出す場合(§10.5 参照)、インストールコマンドは画面に出さない**; 代わりに "try it in your browser: demo.mulmoclaude.com" と表示する。
- **制作メモ:** 1080p スクリーンキャプチャ、24fps、ズームトランジションなし、等幅フォントのキャプション。BGM: ロイヤリティフリーの lo-fi トラックを 40% で 1 曲 — 0:55 でカット。**絶対条件:** スピナー待ち時間ゼロ。プリレンダー、スプライス、絶対に待たない。

### Video B — 3 分ディープダイブ(YouTube + ランディングページ)

- **ゴール:** 開発者の視聴者を `git clone`(またはホストデモクリック)に変換する。
- **ナラティブの弧:** *何を作る? どのくらい速い? 賢くなる? 信頼できる?* — ユーザーの脳が問う順序そのまま。
- **アウトライン:**
  - 0:00–0:20 — 問題提起、中島自身のナレーションで: "I worked on Windows for eight years. Claude Code is the kernel of an AI-native OS. But kernels need shells. Here's the shell I wanted."
  - 0:20–0:50 — **ショックデモ。** 研究論文 PDF をドロップ。要約ドキュメント、スライドデッキ、ナレーション付き MulmoCast 動画が出てくる。強調: *the answer isn't text, it's an artifact. Powered by GUI Chat Protocol.*
  - 0:50–1:30 — さらに 2 つのセッションを並列で開く。片方で別の MulmoCast 動画を走らせ、もう片方で実際のコードベースをリファクタリング。3 つの成果物が同時に生成される。強調: *"one browser tab, many Claude Code workers."*
  - 1:30–2:10 — **複利の瞬間。** 関連する 2 本の記事を取り込む。Wiki のバックリンクが出現する様子を見せる。"翌朝" を想定した新しいセッションを開いて質問する — Claude が自分で築いた Wiki を根拠に答える。強調: *"every other Claude client starts from zero. This one compounds."*
  - 2:10–2:30 — ブリッジ。**Telegram** と **LINE** からメッセージ; デスクトップのキャンバスがライブで更新される様子を見せる。同じメモリ、同じワークスペース。
  - 2:30–2:50 — 信頼レイヤー。Docker サンドボックス・バナー。Claude がワークスペース外のファイルを *読めない* 様子を見せる。`~/` で直接 Claude を動かすツールと対比。アンチ・ラッパー・ラインを画面に。
  - 2:50–3:00 — オープンソース、AGPL。ホストデモリンク + GitHub リンク。
- **制作メモ:** 最初の 20 秒だけ右下にトーキングヘッドのインセット、以後は純粋なスクリーンキャスト。

### Video C — 15 秒ループ(Instagram, LinkedIn, PH ギャラリーモーション)

- 単一プロンプト → 単一のリッチなビジュアル結果 → ロゴへフェード。無音前提。
- 3 バリアント撮影: **(a)** 並列で動く 3 セッション、**(b)** MulmoCast ナレーション動画のフル生成、**(c)** Telegram → キャンバスの往復。最強のものを PH に。他 2 本は当日別投稿。

### 撮影チェックリスト(全動画共通)

- クリーンなワークスペース(新鮮な `~/mulmoclaude/`)を使い、ファイルツリーを散らかさない。
- 最低 1920×1080 で収録、H.264 / 8Mbps でエクスポート。
- プロンプトはすべて事前にテキストファイルで用意する — ライブタイピングでテンポを落とさない。ペースト & 送信。
- Claude が実際にヒットするネットワークでドライラン。エージェントレイテンシがデモ最大の殺し手。
- プラグインのレンダリングが 8 秒以上かかるなら **待ちをカット** — PH 視聴者は空白を許さない。

---

## 7. ローンチウィーク・タイムライン(T = ローンチ当日)

### T-14 〜 T-8 — 素材制作

- [ ] ヒーロー動画、3 分動画、15 秒ループ × 3、スクリーンショット 7 枚を完成
- [ ] Product Hunt アカウント登録、X 連携、他のローンチ 2 件にコメントしてウォームアップ
- [ ] ローンチ当日の関与を約束する **ハンター 4 名** を確保。5 分の Loom で製品をブリーフ。
- [ ] すべてのツイート、LinkedIn 投稿、Reddit 投稿、HN 投稿をドラフト
- [ ] クリーンな macOS、クリーンな Windows WSL、クリーンな Ubuntu でインストール QA — 摩擦をすべて潰す
- [ ] 決定: `npx create-mulmoclaude` を出荷するか、それとも `git clone` を CTA として維持するか? **推奨: npx ラッパーを出荷する。インストールファネルが半分になる。**

### T-7 — 事前告知

- [ ] "Coming Tuesday on PH" ツイートを 15 秒ループ付きで(リンクなし)
- [ ] r/ClaudeAI、r/LocalLLaMA にティーザー投稿 — 製品デモであってローンチ CTA ではない(Reddit はローンチ投稿を嫌う)
- [ ] 知り合いの Claude Code パワーユーザー 10 名に DM — 火曜朝に試してもらい、率直なフィードバックを依頼

### T-3 — ウォームアップ

- [ ] **ブログポスト** を公開: Karpathy-KB 接続について *"What I learned building a personal wiki for Claude."* これが知的な錨(いかり)。
- [ ] ブログポストを HN に提出。PH にはまだ触れない。
- [ ] Maker Studio で PH 掲載をドラフト(**公開はしない** — ステージングのみ)

### T-0 — ローンチ当日

- **00:01 PT** — PH に公開。ファーストコメントを 90 秒以内に投稿。
- **00:05 PT** — ツイートスレッド(7 ツイート、キーメッセージ 1 個に 1 ツイート)。スレッド先頭を固定。
- **00:10 PT** — LinkedIn、Mastodon、Bluesky にクロスポスト(コピペせず、各チャネルに合わせて改作)
- **01:00 PT** — HN "Show HN: MulmoClaude — visual GUI + personal wiki for Claude Code"
- **06:00 PT** — Reddit r/ClaudeAI 投稿(ローンチ色ではなく価値先行 — "これを作った、Wiki メモリのアイディアはこう、コードはここ")
- **09:00 PT / 12:00 PT / 15:00 PT / 18:00 PT** — すべての PH コメントに 30 分以内に返信。**例外なし。**
- **17:00 PT** — 中間チェック: トップ 10 に入っていなければ、Telegram ブリッジのデモ動画を新規投稿として出し、@ProductHunt をタグ付け。
- **21:00 PT** — 順位にかかわらず感謝ポスト。トップコメンターの名前を挙げる。

### T+1 〜 T+7 — 複利化

- ニュースレター配信(dev.to、Hacker Newsletter 寄稿、TLDR Dev 売り込み)
- "ローンチ翌日 — 学んだこと" ポストを収録。これはローンチ自体より 30% の確率で跳ねる。
- インタビュー行脚開始: Changelog、Latent Space、Anthropic コミュニティコールに売り込み。

---

## 8. チャネル別プレイブック

### X / Twitter

**ローンチスレッド(7 ツイート) — ドラフト。順序は 5 つのキーメッセージ + ショックデモ + CTA に対応。**

1. *MulmoClaude is live on Product Hunt today. It's Claude Code that produces docs, presentations, spreadsheets, videos — and remembers everything. Not an API wrapper. It runs Claude Code directly — your auth, your tools, your files. 🧵*
2. **[Shock demo]** *Drop a research paper in. Out comes a summary document, a slide deck, and a narrated video. No other tools opened. [60s video]*
3. **[Parallel sessions]** *Three Claude Code sessions, one browser tab. One renders a video, one refactors code, one drafts email. Claude Code is no longer single-threaded. [multi-session gif]*
4. **[Everything in one folder]** *Web articles, chats, local files, scheduled runs — all converge into one folder (`~/mulmoclaude/`) as Markdown, maintained by Claude itself. Notion is cloud. Obsidian is inert. MulmoClaude is local + AI-maintained + multi-source. The home directory, reinvented. [wiki/folder gif]*
5. **[Phone as client]** *Message the same agent from Telegram, LINE, Slack, WhatsApp, Discord, Matrix. Fire a task from the subway, see the document (or the narrated video) waiting on your laptop. [bridges gif]*
6. **[Trust]** *Claude runs in a Docker sandbox — auto-detected, no configuration. It only sees your workspace. SSH keys, .env, home dir: invisible. This is the level of care a real shell needs. [sandbox screenshot]*
7. *Try it in your browser right now: [hosted demo link]. Or `git clone` it — open source, AGPL. One upvote on PH costs you nothing and means everything today: [link]*

### Hacker News

タイトル: **Show HN: MulmoClaude – Claude Code that produces docs, decks, spreadsheets, videos, and remembers everything**

本文(ファーストコメント): **AI ネイティブ OS 仮説** と Karpathy *LLM Knowledge Bases* への参照から始める。HN は機能よりアイディアを評価する — アイディアを売れ、機能列挙を売るな。明示的に述べる: *this runs the Claude Code CLI directly, not the API — that's why it can do what it does.*

### Reddit (r/ClaudeAI, r/LocalLLaMA, r/selfhosted)

- ローンチ投稿ではない。ビルドログ: *"I spent 8 months giving Claude Code a shell. Here's the wiki-memory idea and what I learned."*
- PH リンクは最下部に一行だけ。

### LinkedIn

**ローンチ当日はスキップ。** LinkedIn は生産性オーディエンス向けのフェーズ 2 チャネル。当日追うと焦点がぼやけ、カテゴリをスキミングしている PH 投票者に "エンタープライズツール" のシグナルを送ってしまう。T+3 に dev 波が落ち着いてから LinkedIn 投稿をキューする。

### 日本コミュニティ(Note, X-JP)

中島は強い JP オーディエンスを持つ。メーカーポストとヒーロー動画のキャプションの日本語版を出す。ローンチ当日 JP ツイートは 09:00 JST = PT の前日 17:00 — アジア太平洋の投票ウィンドウを捕まえる。

---

## 9. ハンターとコミュニティ・シードリスト

- **ハンターのターゲット:** PH フォロワー 5k+ の人、できれば Claude/LLM 界隈。見つからなければセルフハント — 中島の直接ネットワークで十分強い。
- **シード投票者リスト:** リポジトリをスターした、もしくは MulmoChat と接点のある 50 名。月曜夜にカレンダーリマインダーを DM で送る。
- **コメンター下準備:** 1、3、6、9 時間目に実のある(チアリーディングではない)コメントを残す 4 〜 6 名。PH のアルゴリズムはコメントの速度と多様性も重視する、アップボートだけではない。

---

## 10. リスクと緩和策

| リスク                                                 | 確率     | 緩和策                                                                                                                                 |
| ------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **アクティベーションギャップ — PH 当日にセットアップが重すぎる** | **高**   | **ホストデモを出荷する(§10.5 参照)。** `npx create-mulmoclaude` だけでは不十分 — 5 分のインストール = 50% 離脱。                        |
| 初回起動時に Claude Code CLI 認証が失敗する            | 中       | アプリ内にプリフライトチェック; 親切なエラーページから Claude Code ドキュメントへリンク                                              |
| "ただのラッパーでしょ"という反論                       | 中       | アンチ・ラッパー・ラインを一字一句そのまま使う: *"It runs Claude Code directly — not the API."* Wiki + マルチセッションで補強。         |
| 認知過負荷(1 メッセージに機能が多すぎる)               | 中       | §4 で既に対処済 — 9 → 5 に圧縮、残りは温存。ラインを死守; スクリーンショットでリストが戻らないよう監視。                             |
| ライブ Claude 呼び出しによるデモ動画のレイテンシ       | 中       | プリレコード、スプライス、スピナー 3 秒以上絶対に見せない                                                                             |
| AGPL + Docker が "ハッカーツール、危険" と読まれる     | 中       | **再フレーム:** サンドボックス = *"the level of care a real shell needs."* AGPL = *"open-source, local-first, no vendor lock-in."* 同じ事実、別フレーミング。 |
| Anthropic が同じ週に自社 GUI を出す                    | 低       | 補完的と位置付ける — ローカルファースト、オープンソース、プラグイン拡張可能                                                           |
| PH アルゴリズム — JP タイミングによる米国夕方の追い上げ | 低       | JP ローンチツイートを日本夕方 = PH 当日朝 PT に合わせる                                                                               |

### 10.5 アクティベーション問題 — ここを解くか、当日を失うか

これが v1 プラン最大のギャップ。現実チェック: `npx create-mulmoclaude` があっても、インストール経路は **Node + Claude Code CLI 認証 + Gemini API キー + Docker** — 5 〜 10 分、開発者限定、モバイルはゼロ。PH 勝者は即時充足感。午前中にアップボートが伸び、午後には誰も実際に試していないから勢いが死ぬ。

**インパクト順 3 オプション:**

**オプション A(強く推奨) — `demo.mulmoclaude.com` のホスト・リードオンリー・デモ**
- 10 個の準備済みセッションをプリロードしたワークスペース: 研究論文 → 動画のフロー、京都旅行ドキュメント、バックリンク入り Wiki、MulmoCast ナレーションプレゼン、マルチセッションのスナップショット。
- 訪問者は既存の成果物をクリックスルーし、キャンバスを再生できる — タイピング不要、認証不要、API キー不要、Docker 不要。
- 予算: エンジニア約 3 人日。T-3 までに出荷。**これがプラン全体で最もレバレッジの大きい単一の変更。**
- ヒーロー動画と全ツイートの CTA が *"try it in your browser: demo.mulmoclaude.com"* になる(`git clone` ではなく)。

**オプション B(最小実用) — "Watch Claude work" モード**
- Gemini キー不要、Claude 認証不要のローカルモード。リポジトリに焼き込んだプリレコードセッションのリプレイを使う。`npx create-mulmoclaude --demo` で 30 秒でインタラクティブウォークスルーに落とす。
- 実インストール比で離脱半減; オプション A には及ばないがアクティベーションコストを抑えられる。

**オプション C(最終手段) — ランディングページ上のスクリプト化スクリーンショット・ウォークスルー**
- ショックデモ、並列セッション、Wiki バックリンク、Telegram 往復をクリックスルー。
- 実インタラクティビティはないが、PH スキマーに "体験した" 感覚だけは残せる。

**決定:** **T-7 までにオプション A にコミット**。スコープが滑ったら C に触る前に B に落ちる。

---

## 11. 成功メトリクス

**当日:**
- Product Hunt: **当日 Top 5**; Top 10 は下限。
- GitHub スター: 24h で **+500**。
- **ホストデモセッション: ユニーク 3,000**(アクティベーションの本指標 — §10.5)。
- インストール数(Gemini キー入力をプロキシに): **500** — ホストデモがカジュアル流入を吸収するため二次指標。
- PH コメント: **50 件以上の実のあるもの**(チーム内を除く)。

**当週:**
- スター: **累積 +1,500**。
- HN: フロントページ 2 時間以上。
- Twitter: ローンチスレッドに 2M+ インプレッション。
- インバウンドポッドキャスト/インタビュー依頼 3 件以上。

**当月:**
- WAU 2,000(セッションログを根拠に)。
- コミュニティ投稿の custom role もしくはプラグインが 5 件。
- @karpathy、@alexalbert、または Anthropic のエンジニアから 1 件の言及(願望だが計測可能)。

---

## 12. 2 つの賭け

外せない勝負所が 2 つある。どちらかを外せば、ローンチは 10 点中 6 点で終わる。

**Bet 1 — ザ・ショット(アップボートを稼ぐ)**
ヒーロー動画の最初の 20 秒: **研究論文を投入し、3 つの Claude Code セッションが、並列で要約ドキュメント・スライドデッキ・ナレーション付き MulmoCast 動画を生成している画。** この 1 フレームがピッチそのもの — 具体的な出力 + 並列セッション + MulmoCast、以上。他にこれを見せているプロダクトは世に存在しない。

**Bet 2 — ホストデモ(試してもらう)**
`demo.mulmoclaude.com` によって、PH スキマーは何もインストールせずにショックデモをクリックスルーできる。これがないと、Bet 1 で得たアップボートは GitHub スターにも、Twitter フォローにも、ビルドにも変換されない。Bet 1 が注意を引き、Bet 2 が記憶に残す。

プラン内の他のすべて — ブリッジ、サンドボックス、ロール、Wiki ツアー、スキルランチャー — は、すでに信じた視聴者のための確認バイアスにすぎない。2 つの賭けのどちらにも資さないものはカットする。

---

## 13. 底流にある物語(そもそもなぜこれをやるのか)

これは、もっと大きな仮説の最初の可視表層である: **コンピューティングは AI エージェントの上に再プラットフォーム化されつつあり、そのプラットフォームに必要なシェルはまだ存在しない。** Claude Code がカーネル。MulmoClaude がそのシェルの最初のドラフトである — そして、そのシェルのユーザーに向かう形は、**すべての入力が流れ込み、すべての出力が出てくる、たった一つのフォルダ** である。

`~/mulmoclaude/` は AI 時代のために再発明されたホームディレクトリだ。1975 年、ホームディレクトリはあなたのファイルが置かれる場所だった。2026 年、そこにはあなたのファイル、調査、会話、スケジュールされた作業、そしてそれらから抽出された知識のすべてが置かれる — しかも「ものをどこに置くべきか」を知っている AI によってメンテナンスされた状態で。これが鍵(アンロック)だ。マルチモーダル出力でもない。並列セッションでもない。ブリッジでもない。それらはすべて、**単一のローカルで AI メンテされた収束点を持っていることの帰結** である。差別化要因は「場所」であって、機能リストの上のどれでもない。

ローンチがうまくいくなら、我々が祝っているのは成功したプロダクトローンチではなく — 新しいコンピューティング表層の存在を宣言している。フェーズ 2 オーディエンス(生産性ユーザー、ナレッジワーカー、日本市場、エンタープライズ)は後から、初日に築いた dev ネイティブな重力によって引き寄せられる。

このフレーミングこそが、このプランを慎重ではなく攻撃的にしている理由だ。我々は "very advanced tool" になろうとしているのではない。ひとつの鋭い製品を通して、コンピューティングの未来を一瞥させようとしている。

---

*MulmoClaude ローンチ用資料。T-7 の素材ドライランの後に改訂すること。ホストデモのスコープ決定は T-10 — クリティカルパス項目。*
