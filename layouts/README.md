# layouts/

Stack テーマのデフォルトレイアウトを上書きするカスタムファイルを格納しています。
Hugo は `themes/stack/layouts/` より `layouts/` を優先するため、同名のファイルを置くことで挙動を変更できます。

## カスタマイズ済みファイル

### 変更リスク高（テーマ更新時に競合しやすいファイル）

| ファイル | 変更内容 |
|---------|---------|
| `home.html` | トップページの記事一覧上部に検索フォームを追加 |
| `single.html` | 全記事末尾に Google フォームのコメントボタンを追加。`no-right-sidebar` クラスのサポート |
| `_partials/sidebar/left.html` | ダーク/ライトモード切り替えを sun/moon SVG アイコンに変更。メニュー名を safe HTML としてレンダリング（名前に `<br>` を使用可能）|
| `_partials/article/components/header.html` | 記事一覧のレイアウトをアイキャッチ左・タイトル/日付/抜粋右の横並びに変更 |
| `_partials/article/components/details.html` | 記事メタ情報の順序を タイトル・日付・抜粋・タグ の順に変更 |

### 変更リスク中

| ファイル | 変更内容 |
|---------|---------|
| `_partials/article/components/footer.html` | 記事フッターのカスタマイズ |
| `_partials/article/components/related-content.html` | 関連記事セクションに左右スクロールボタンを追加 |
| `_partials/footer/footer.html` | フッターを1行に集約（コピーライト + Hugo/Stack クレジット） |
| `_partials/widget/toc.html` | 目次ウィジェットから `#` アイコンを削除 |
| `_partials/helper/image.html` | `static/` ディレクトリの画像を配信できるよう対応 |

### その他

| ファイル | 説明 |
|---------|------|
| `_shortcodes/affi.html` | `data/affi-mapping.json` を参照してアフィリエイトリンクを表示するショートコード |
| `_shortcodes/site-name.html` | `hugo.toml` のサイト名を表示するショートコード |

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
    "text": "商品名 B (Amazon)",
    "url": "https://www.amazon.co.jp/dp/XXXXXXXXXX"
  }
}
```

| フィールド | 説明 |
|-----------|------|
| キー（`"1"` など） | 記事から参照する ID |
| `text` | リンクのテキスト。プラットフォーム名を末尾に付けると分かりやすい（例：`商品名 (Amazon)`） |
| `url` | リンク先 URL |

Amazon アソシエイトタグは URL に含めず、`hugo.toml` の `amazonTag` で一元管理してください。タグはビルド時にショートコードが自動付与します。

### 2. 記事に埋め込む

Markdown 内にショートコードを記述します：

```
{{< affi id="1" >}}
```

`id` には `affi-mapping.json` のキーを指定します。

## テーマ更新時の注意

これらのファイルはテーマのデフォルトを上書きしているため、**Stack テーマを更新しても自動的には反映されません**。

テーマ更新前に、上書きファイルと新しいテーマファイルの差分を確認してください：

```bash
# 例：テーマ側の header.html が変更されていないか確認する
diff layouts/_partials/article/components/header.html \
     themes/stack/layouts/_partials/article/components/header.html
```

テーマを更新したら、各上書きファイルを手動で確認・マージし、`hugo server -D` でローカルテストを行ってからデプロイしてください。
