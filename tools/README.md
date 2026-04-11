# tools/

WordPress の記事を Hugo 用 Markdown に変換するツールです。

## 概要

`convert.js` は WordPress のエクスポート XML ファイルを Hugo 互換の Markdown ファイルに変換します。

対応している変換：

- フロントマターの生成（タイトル・日付・最終更新日・URL・アイキャッチ・カテゴリ・タグ）
- アフィリエイトリンク変換：`[affi id=X]` → `{{< affi id="X" >}}`
- 画像パス変換：`/wp-content/uploads/YYYY/MM/file.jpg` → `/images/YYYY/MM/file.jpg`
- 内部リンク変換：`https://example.com/path/` → `/posts/path/`
- 見出しレベルの正規化（最も浅い見出しを h2 に統一）
- コードブロックの言語検出
- 承認済みコメントのレンダリング

## 必要なもの

- [Node.js](https://nodejs.org/)（v18 以降推奨）
- npm

## 設定

`convert.js` の先頭にある `CONFIG` オブジェクトを編集します：

```javascript
const CONFIG = {
  // WordPress サイトのベース URL（末尾スラッシュなし）
  siteUrl: 'https://example.com',

  // WordPress XML エクスポートファイルのパス（tools/ からの相対パス）
  xmlPath: '../WordPress.2026-01-01.xml',

  // 変換後の Markdown ファイルの出力先（tools/ からの相対パス）
  outputDir: '../content/posts',

  // affi-mapping.json のパス（tools/ からの相対パス）
  affiMappingPath: '../data/affi-mapping.json',
};
```

| キー | 説明 |
|------|------|
| `siteUrl` | WordPress サイトのベース URL。内部リンクや画像 URL の検出に使用します。 |
| `xmlPath` | WordPress XML エクスポートファイルのパス（WordPress 管理画面 > ツール > エクスポートで取得）。 |
| `outputDir` | Markdown ファイルの出力先ディレクトリ。存在しない場合は自動作成されます。 |
| `affiMappingPath` | `affi-mapping.json` のパス。WordPress 本文中の `[affi id=X]` の解決に使用します。 |

## 実行方法

```bash
# tools/ ディレクトリで実行
cd tools
npm install   # 初回のみ
node convert.js
```

## 出力

- WordPress の公開済み記事 1 件につき `.md` ファイルを 1 つ出力します。
- ファイル名は WordPress の投稿スラッグから生成されます。
- 各ファイルには TOML フロントマター（`+++ ... +++`）と変換済み Markdown 本文が含まれます。
- 下書き・添付ファイルは自動的にスキップされます。

### 出力ファイル構成の例

```
content/posts/
├── my-first-post.md
├── another-article.md
└── ...
```

### フロントマターの例

```toml
+++
title = "最初の記事"
date = "2026-01-01T10:00:00+09:00"
draft = false
url = "/posts/my-category/my-first-post/"
image = "/images/2026/01/thumbnail.jpg"
categories = ["Tech"]
tags = ["Hugo", "WordPress"]
+++
```

変換後、WordPress のメディアファイル（`wp-content/uploads/` 以下）を `static/images/` にコピーすると、変換済み記事の画像パスと一致します。
