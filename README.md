# Hugo + Stack テーマ テンプレート

[Hugo](https://gohugo.io/) と [Stack テーマ](https://github.com/CaiJimmy/hugo-theme-stack) を使ったブログテンプレートです。デプロイ先として Firebase Hosting と Cloudflare Pages に対応しています。

## 概要

このテンプレートに含まれるもの：

- Hugo 静的サイト生成（Stack テーマ v4 直接同梱）
- Firebase Hosting または Cloudflare Pages への自動デプロイ
- 記事一覧・サイドバー・フッター・関連記事のカスタムレイアウト
- ダーク/ライトモード切り替え（sun/moon アイコン）
- シンタックスハイライト（Chroma カスタム配色）
- アフィリエイトリンク ショートコード（`{{< affi id="X" >}}`）
- WordPress XML → Hugo Markdown 変換ツール（`tools/convert.js`）
- プライバシーポリシー・利用規約・検索・アーカイブページ同梱

## デプロイ先の選択

このテンプレートは **Firebase Hosting**（デフォルト）と **Cloudflare Pages** のどちらにもデプロイできます。

| | Firebase Hosting | Cloudflare Pages |
|---|---|---|
| 無料枠 | 転送 360MB/日・10GB/月 | 帯域・リクエスト無制限 |
| Hugo サポート | GitHub Actions でビルド | 組み込みサポート（設定1行） |
| GitHub 連携 | サービスアカウント JSON が必要 | リポジトリ連携のみ |
| 設定ファイル | `firebase.json` / `.firebaserc` / `deploy.yml` | 不要（ダッシュボードで設定） |

初めて使う場合は **Cloudflare Pages** の方が設定が簡単です。

## セットアップ

### 1. hugo.toml を編集する

`hugo.toml` を開き、以下の値を書き換えます：

```toml
baseURL = 'https://your-site.com/'
title = 'サイト名'
```

必要に応じてオプションのパラメーターをコメントアウトして設定します：

```toml
# [services.googleAnalytics]
#   ID = 'G-XXXXXXXXXX'

[params]
  # favicon = "/your-favicon.png"
  # adsensePublisherID = "ca-pub-XXXXXXXXXXXXXXXX"
  # amazonTag           = "your-tag-22"
  contactFormURL      = "https://forms.gle/..."
  commentFormURL      = "https://docs.google.com/forms/..."
  commentFormEntryID  = "1234567890"

[params.sidebar]
  # avatar = "/avatar.jpg"
```

---

Firebase Hosting を使う場合は手順 2〜3 を、Cloudflare Pages を使う場合は手順 2' を行ってください。

---

### 2. Firebase Hosting を使う場合

#### 2-1. Firebase プロジェクトを作成して .firebaserc を編集する

1. [Firebase コンソール](https://console.firebase.google.com/) で新しいプロジェクトを作成します。
2. Firebase Hosting を有効にします。
3. `.firebaserc` を開き、`your-firebase-project-id` を実際のプロジェクト ID に書き換えます：

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

#### 2-2. GitHub Secrets に FIREBASE_SERVICE_ACCOUNT を登録する

1. Firebase コンソールの **プロジェクトの設定 > サービスアカウント** を開きます。
2. **新しい秘密鍵を生成** をクリックし、JSON ファイルをダウンロードします。
3. GitHub リポジトリの **Settings > Secrets and variables > Actions** を開きます。
4. `FIREBASE_SERVICE_ACCOUNT` という名前でシークレットを作成し、JSON ファイルの内容を貼り付けます。

設定が完了すると、`main` への push ごとに自動でビルド・デプロイされます。

### 2'. Cloudflare Pages を使う場合

Firebase の設定ファイル（`firebase.json` / `.firebaserc` / `.github/workflows/deploy.yml`）は使用しません。削除するか、そのまま放置しても動作に影響しません。

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) にログインします。
2. **Workers & Pages > Pages > Connect to Git** からこのリポジトリを連携します。
3. ビルド設定を以下のように入力します：

| 項目 | 値 |
|------|-----|
| フレームワークプリセット | Hugo |
| ビルドコマンド | `hugo --minify` |
| ビルド出力ディレクトリ | `public` |

4. **環境変数** に以下を追加します：

| 変数名 | 値 |
|--------|-----|
| `HUGO_VERSION` | `0.160.0` |

5. **保存してデプロイ** をクリックします。

以降は `main` への push ごとに自動でビルド・デプロイされます。

### 3. （任意）Google Analytics

`hugo.toml` の `[services.googleAnalytics]` セクションをコメントアウトして測定 ID を設定します：

```toml
[services.googleAnalytics]
  ID = 'G-XXXXXXXXXX'
```

### 4. （任意）Google AdSense

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

### 5. （任意）Amazon アソシエイトタグ

`hugo.toml` にトラッキングタグを設定します。設定すると、記事本文中の Amazon リンクにタグが自動付与されます：

```toml
[params]
  amazonTag = "your-tag-22"
```

### 6. （任意）お問い合わせフォーム・コメントフォーム

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
├── firebase.json           # Firebase Hosting 設定
├── .firebaserc             # Firebase プロジェクト ID
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
├── assets/
│   ├── scss/               # カスタム SCSS
│   ├── css/extended/       # 追加 CSS
│   └── icons/              # カスタム SVG アイコン（sun・moon）
├── data/
│   └── affi-mapping.json   # affi ショートコード用アフィリエイトリンクデータ
└── static/
    ├── images/             # 記事画像
    └── robots.txt
```

各サブディレクトリの詳細は README を参照してください：

- [tools/README.md](tools/README.md) - WordPress 移行ツール
- [layouts/README.md](layouts/README.md) - カスタムレイアウト
- [assets/scss/README.md](assets/scss/README.md) - SCSS カスタマイズ
- [content/page/README.md](content/page/README.md) - 固定ページ

## ライセンス

このプロジェクトは [GNU General Public License v3.0](LICENSE) のもとで公開しています。

`themes/stack/` に同梱している [Stack テーマ](https://github.com/CaiJimmy/hugo-theme-stack) も GPL v3 でライセンスされています。
