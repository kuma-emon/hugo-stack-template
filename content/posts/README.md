# content/posts/

ブログ記事を格納するディレクトリです。

## 記事の書き方

### 1. Markdown ファイルを作成する

`content/posts/` 直下に `.md` ファイルを追加します。ファイル名が記事の URL スラッグになります。

```
content/posts/my-first-article.md  →  /posts/my-first-article/
```

### 2. フロントマターを書く

ファイルの先頭に TOML フロントマター（`+++ ... +++`）を記述します：

```toml
+++
title = "記事のタイトル"
date = "2026-01-01T10:00:00+09:00"
lastmod = "2026-01-01T10:00:00+09:00"
draft = false
url = "/posts/my-first-article/"
image = "/images/eyecatch.webp"
categories = ["カテゴリ名"]
tags = ["タグ1", "タグ2"]
+++

記事本文をここに書きます。
```

| フィールド | 必須/任意 | 説明 |
|-----------|---------|------|
| `title` | 必須 | 記事タイトル |
| `date` | 必須 | 公開日時（ISO 8601 形式） |
| `lastmod` | 任意 | 最終更新日時。記事を修正した際に更新すると SEO 上の効果がある |
| `draft` | 任意 | `true` にするとローカルのみ表示（本番ビルドには含まれない）。省略時は `false` |
| `url` | 任意 | 記事の URL を明示的に指定する。省略時はファイル名から自動生成される |
| `image` | 任意 | アイキャッチ画像のパス（`static/` からの相対パス） |
| `categories` | 任意 | カテゴリ（配列） |
| `tags` | 任意 | タグ（配列） |

### 3. 画像を追加する

アイキャッチ画像は `assets/images/` に WebP 形式で配置します。

```
assets/images/eyecatch.webp  →  image = "/images/eyecatch.webp"
```

### 4. ローカルで確認する

```bash
hugo server -D
```

ブラウザで http://localhost:1313/ を開きます。`draft = true` の記事も表示されます。

### 5. 公開する

`draft = false` に変更して `main` にプッシュすると自動でデプロイされます。

## サンプル記事

`sample-post.md` を参考に記事を作成してください。不要になったら削除して構いません。
