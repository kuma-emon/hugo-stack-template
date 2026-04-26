+++
title = "サンプル記事"
date = "2026-01-01"
draft = false
image = "/images/eyecatch-sample.webp"
categories = ["カテゴリ"]
tags = ["タグ"]
+++

この記事は Hugo + Stack テーマを使ったブログのサンプル記事です。
実際の記事を書く際の参考としてください。

## 見出し2

本文のテキストが入ります。段落を分けるには空行を挿入します。

### 見出し3

見出しは `##` から始めることを推奨します（`#` はタイトルと重複するため）。

## リスト

### 箇条書きリスト

- アイテム1
- アイテム2
  - ネストされたアイテム
  - ネストされたアイテム2
- アイテム3

### 番号付きリスト

1. 手順1
2. 手順2
3. 手順3

## コードブロック

インラインコードは `backtick` で囲みます。

```bash
# Bash コマンドの例
hugo server -D
git add .
git commit -m "Add new post"
git push
```

```javascript
// JavaScript の例
const greeting = (name) => {
  console.log(`Hello, ${name}!`);
};
greeting('World');
```

## 画像

![サンプル画像](/images/eyecatch-sample.webp)

画像は `static/images/` に配置し、`/images/` から参照します。

## リンク

- [Hugo 公式ドキュメント](https://gohugo.io/documentation/)
- [Stack テーマ](https://github.com/CaiJimmy/hugo-theme-stack)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

## アフィリエイトリンク（affi ショートコード）

`data/affi-mapping.json` に登録したアフィリエイトリンクは、以下のショートコードで挿入できます。

{{< affi id="1" >}}

{{< affi id="2" >}}

## 強調・引用

**太字テキスト**、*斜体テキスト*、~~打ち消し線~~。

> これは引用文です。
> 複数行にわたる引用も可能です。

## 表

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| データA | データB | データC |
| データD | データE | データF |

---

以上がサンプル記事の内容です。
この記事をテンプレートとして、実際の記事を作成してください。
