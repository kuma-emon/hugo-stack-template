# Hugo + Stack テーマ テンプレート

[Hugo](https://gohugo.io/) と [Stack テーマ](https://github.com/CaiJimmy/hugo-theme-stack) を使ったブログテンプレートです。Cloudflare Pages へのデプロイに対応しています。

## 概要

このテンプレートに含まれるもの：

- Hugo 静的サイト生成（Stack テーマ v4 直接同梱）
- Cloudflare Pages への自動デプロイ（GitHub Actions + wrangler）
- 記事一覧・サイドバー・フッター・関連記事のカスタムレイアウト
- ダーク/ライトモード切り替え（sun/moon アイコン）
- シンタックスハイライト（Chroma カスタム配色）
- アフィリエイトリンク ショートコード（`{{< affi id="X" >}}`）
- ファイル埋め込みコードブロック ショートコード（`{{< codefile "path/to/file.js" "js" >}}`）
- テーブルの横スクロール対応（`<div class="table-wrapper">` で自動ラップ）
- WordPress XML → Hugo Markdown 変換ツール（`tools/convert.js`）
- プライバシーポリシー・利用規約・検索・アーカイブページ同梱

## セットアップ

### 1. hugo.toml を編集する

`hugo.toml` を開き、以下の値を書き換えます：

```toml
baseURL = 'https://example.com/'
title = 'サイト名'
```

必要に応じてオプションのパラメーターをコメントアウトして設定します：

```toml
# [services.googleAnalytics]
#   ID = 'G-XXXXXXXXXX'

[params]
  # favicon = "/your-favicon.png"
  # adsensePublisherID = "ca-pub-XXXXXXXXXXXXXXXX"
  # amazonTag           = "your-tag"
  contactFormURL      = "https://forms.gle/..."
  commentFormURL      = "https://docs.google.com/forms/..."
  commentFormEntryID  = "1234567890"

[params.sidebar]
  # avatar = "/avatar.jpg"
```

### 2. Cloudflare Pages プロジェクトを作成する

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) にログインします。
2. **Workers & Pages > Pages > Create application** で新規プロジェクトを作成します。プロジェクト名は任意（例: `my-blog`）。
3. **Git 連携は使わずに** 空のプロジェクトとして作成しておきます（このテンプレートは GitHub Actions からデプロイするため）。

### 3. GitHub Secrets を登録する

GitHub リポジトリの **Settings > Secrets and variables > Actions** を開き、以下の 2 つを登録します。

| Secret 名 | 取得元 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare ダッシュボード → My Profile → API Tokens → **Create Token** で `Edit Cloudflare Pages` テンプレートから発行 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare ダッシュボードの右サイドバーに表示される Account ID |

### 4. deploy.yml の project-name を書き換える

`.github/workflows/deploy.yml` の末尾にある `--project-name=your-project-name` を、手順 2 で作成したプロジェクト名に書き換えてコミットします。

以降は `main` への push ごとに自動でビルド・デプロイされます。

> **注意：** このリポジトリを fork した場合、GitHub Actions はデフォルトで無効になっています。**Settings > Actions > General** で `Allow all actions` を選択して有効化してください。

#### 代替セットアップ：Cloudflare Pages のダッシュボード Git 連携を使う

GitHub Actions を経由せず、Cloudflare Pages 側でリポジトリを直接 Git 連携する方法もあります。シークレット登録が不要で簡単ですが、ビルド時のカスタム環境変数や追加 CI ステップを使いたい場合は GitHub Actions 経由（上記手順）を推奨します。

ダッシュボード Git 連携を使う場合は、`.github/workflows/deploy.yml` を削除した上で以下を設定：

1. **Workers & Pages > Pages > Connect to Git** からこのリポジトリを連携
2. ビルド設定: フレームワークプリセット = Hugo、ビルドコマンド = `hugo --minify`、ビルド出力ディレクトリ = `public`
3. 環境変数: `HUGO_VERSION` = `0.162.0`

### 5. （任意）Google Analytics

`hugo.toml` の `[services.googleAnalytics]` セクションをコメントアウトして測定 ID を設定します：

```toml
[services.googleAnalytics]
  ID = 'G-XXXXXXXXXX'
```

### 6. （任意）Google AdSense

`hugo.toml` にパブリッシャー ID を設定します：

```toml
[params]
  adsensePublisherID = "ca-pub-XXXXXXXXXXXXXXXX"
```

AdSense の警告を解消するには、`static/ads.txt` を作成してください：

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

`pub-XXXXXXXXXXXXXXXX` は自分のパブリッシャー ID に置き換えてください。

### 7. （任意）Amazon アソシエイトタグ

`hugo.toml` にトラッキングタグを設定します。設定すると、記事本文中の Amazon リンクにタグが自動付与されます：

```toml
[params]
  amazonTag = "your-tag"
```

タグはビルド時に自動付与されます。`{{< affi >}}` ショートコード経由の Amazon リンクに適用されます。

### 8. （任意）カスタムドメインの設定

1. Cloudflare ダッシュボードの **Pages > プロジェクト > カスタムドメイン** を開きます。
2. ドメインを入力して追加します。
3. ドメインの DNS を Cloudflare で管理している場合は CNAME レコードが自動で作成されます。他の DNS プロバイダーを使っている場合は、表示された CNAME レコードを手動で追加します。

`hugo.toml` の `baseURL` をカスタムドメインに更新してください：

```toml
baseURL = 'https://example.com/'
```

### 9. （任意）お問い合わせフォーム・コメントフォーム

Google フォームを使ったお問い合わせ・コメント機能を設定できます。

**お問い合わせフォーム**：サイドバーにリンクが表示されます。

**コメントフォーム**：各記事の末尾に「コメントを送る」ボタンが表示されます。ボタンを押すと Google フォームが開き、記事の URL が自動入力されます。

```toml
[params]
  contactFormURL     = "https://forms.gle/..."          # お問い合わせフォームの URL
  commentFormURL     = "https://docs.google.com/forms/..." # コメントフォームの URL
  commentFormEntryID = "1234567890"                      # コメントフォームの記事URL入力欄のエントリー ID
```

`commentFormEntryID` は Google フォームの編集画面で入力フィールドを右クリック →「事前入力したリンクを取得」から確認できます。いずれも空のままにしておくと非表示になります。

## affi ショートコードの使い方

アフィリエイトリンクを記事に埋め込むためのショートコードです。リンク情報を `data/affi-mapping.json` で一元管理し、記事には ID のみ書くことで、URL 変更時に JSON を更新するだけで全記事に反映されます。

### 1. affi-mapping.json にリンクを追加する

`data/affi-mapping.json` を編集します：

```json
{
  "1": {
    "text": "商品名 (Amazon)",
    "url": "https://www.amazon.co.jp/dp/XXXXXXXXXX"
  },
  "2": {
    "text": "商品名 B (楽天)",
    "url": "https://item.rakuten.co.jp/..."
  }
}
```

| フィールド | 説明 |
|-----------|------|
| キー（`"1"` など） | 記事から参照する ID |
| `text` | リンクのテキスト。プラットフォーム名を末尾に付けると分かりやすい |
| `url` | リンク先 URL |

Amazon アソシエイトタグは URL に含めず、`hugo.toml` の `amazonTag` で一元管理してください（セットアップ手順 5 参照）。タグはビルド時にショートコードが自動付与します。

### 2. 記事に埋め込む

Markdown 内にショートコードを記述します：

```
{{< affi id="1" >}}
```

`id` には `affi-mapping.json` のキーを指定します。

## ローカルでの確認

```bash
# ドラフト記事を含めてローカルプレビュー
hugo server -D
```

ブラウザで http://localhost:1313/ を開きます。

## ディレクトリ構成

```
hugo-stack-template/
├── hugo.toml               # Hugo 設定ファイル
├── .github/
│   ├── dependabot.yml      # Dependabot 月次更新設定
│   └── workflows/
│       └── deploy.yml      # Cloudflare Pages デプロイワークフロー
├── .gitignore
├── README.md               # このファイル
├── tools/                  # WordPress 移行ツール
│   ├── convert.js          # WordPress XML → Hugo Markdown 変換スクリプト
│   ├── package.json
│   └── README.md
├── content/
│   ├── posts/              # 記事（Markdown）
│   │   └── sample-post.md  # サンプル記事
│   └── page/               # 固定ページ（プライバシー・利用規約・検索・アーカイブ）
├── themes/
│   └── stack/              # Stack テーマ（直接同梱）
├── layouts/                # Stack テーマのカスタムレイアウト
│   ├── robots.txt          # robots.txt テンプレート（baseURL から Sitemap URL を動的生成）
│   ├── _partials/article/components/content.html  # テーブルを table-wrapper でラップ（横スクロール対応）
│   └── _shortcodes/
│       ├── affi.html       # アフィリエイトリンク（data/affi-mapping.json 参照）
│       ├── codefile.html   # assets/ 配下のファイルをコードブロックとして表示
│       └── site-name.html  # サイト名の出力
├── assets/
│   ├── scss/               # カスタム SCSS
│   ├── css/extended/       # 追加 CSS
│   └── icons/              # カスタム SVG アイコン（sun・moon）
├── data/
│   └── affi-mapping.json   # affi ショートコード用アフィリエイトリンクデータ
└── static/
    └── images/             # 記事画像
```

各サブディレクトリの詳細は README を参照してください：

- [content/posts/README.md](content/posts/README.md) - 記事の書き方
- [content/page/README.md](content/page/README.md) - 固定ページ
- [assets/scss/README.md](assets/scss/README.md) - SCSS カスタマイズ
- [tools/README.md](tools/README.md) - WordPress 移行ツール

## ライセンス

このプロジェクトは [GNU General Public License v3.0](LICENSE) のもとで公開しています。

`themes/stack/` に同梱している [Stack テーマ](https://github.com/CaiJimmy/hugo-theme-stack) も GPL v3 でライセンスされています。
