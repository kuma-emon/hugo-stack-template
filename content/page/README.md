# content/page/

ブログ記事一覧には含まれない固定ページを格納するディレクトリです。

## 含まれるページ

| ディレクトリ | URL | 説明 |
|------------|-----|------|
| `privacy/` | `/page/privacy/` | プライバシーポリシー |
| `terms/` | `/page/terms/` | 利用規約 |
| `search/` | `/page/search/` | サイト内検索（Stack テーマ組み込み） |
| `archives/` | `/page/archives/` | 日付別アーカイブ |

## ページの編集

各ページはサブディレクトリ内の `index.md` ファイルです。直接編集してください。

例：プライバシーポリシーを更新する場合：

```bash
open content/page/privacy/index.md
```

フロントマターは TOML 形式（`+++ ... +++`）です：

```toml
+++
title = "プライバシーポリシー"
draft = false
+++
```

## 新しいページを追加する

新しいサブディレクトリを作成し、`index.md` を追加するだけで固定ページを追加できます。
