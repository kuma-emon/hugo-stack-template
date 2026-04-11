const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');
const TurndownService = require('turndown');
const { gfm } = require('turndown-plugin-gfm');

// --- CONFIG ---
// Edit these values to match your WordPress site and local environment.
const CONFIG = {
  // The base URL of your WordPress site (no trailing slash)
  // Example: 'https://example.com'
  siteUrl: 'https://example.com',

  // Path to the WordPress XML export file
  // Example: '../WordPress.2026-01-01.xml'
  xmlPath: '../WordPress.2026-01-01.xml',

  // Output directory for converted Markdown files
  // Example: '../content/posts'
  outputDir: '../content/posts',

  // Path to the affi-mapping.json file
  // Example: '../data/affi-mapping.json'
  affiMappingPath: '../data/affi-mapping.json',
};

// --- 初期化 ---
const SITE_BASE_URL = CONFIG.siteUrl;
const XML_FILE = CONFIG.xmlPath;
const OUTPUT_DIR = CONFIG.outputDir;
const AFFI_MAPPING_FILE = CONFIG.affiMappingPath;

if (!fs.existsSync(XML_FILE)) {
  console.error(`エラー: XMLファイルが見つかりません: ${XML_FILE}`);
  console.error('CONFIG.xmlPath を正しいパスに設定してください。');
  process.exit(1);
}

const affiMapping = JSON.parse(fs.readFileSync(AFFI_MAPPING_FILE, 'utf-8'));
const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
td.use(gfm);

// --- コードブロックの言語を抽出するカスタムルール ---
const LANG_MAP = {
  'lang-bash': 'bash', 'lang-js': 'javascript', 'lang-ts': 'typescript',
  'lang-python': 'python', 'lang-r': 'r', 'lang-ps1': 'powershell',
  'lang-plain': '', 'lang-sql': 'sql', 'lang-css': 'css', 'lang-html': 'html',
};

td.addRule('fencedCodeBlock', {
  filter: (node) => node.nodeName === 'PRE' && node.querySelector('code'),
  replacement: (_content, node) => {
    const cls = node.getAttribute('class') || '';
    const dataLang = (node.getAttribute('data-lang') || '').toLowerCase();

    let lang = '';
    // lang-xxx クラスから取得
    const langClass = cls.split(' ').find(c => c.startsWith('lang-'));
    if (langClass) lang = LANG_MAP[langClass] ?? langClass.replace('lang-', '');
    // data-lang から補完
    if (!lang && dataLang) lang = dataLang;
    // wp-block-code の後ろに言語が書かれている場合（例: "wp-block-code javascript"）
    if (!lang && cls.includes('wp-block-code')) {
      const wpLang = cls.replace('wp-block-code', '').trim();
      if (wpLang) lang = wpLang;
    }

    const code = node.querySelector('code').textContent;
    // コード内にバッククォートが含まれる場合はフェンス数を増やす
    const maxBackticks = (code.match(/`+/g) || []).reduce((max, s) => Math.max(max, s.length), 2);
    const fence = '`'.repeat(Math.max(3, maxBackticks + 1));
    return `\n${fence}${lang}\n${code}\n${fence}\n`;
  },
});

// --- affiショートコードをプレースホルダーに置換（Turndown前）---
function replaceAffiWithPlaceholder(content) {
  return content.replace(/\[affi\s+id=(\d+)\]/g, (_match, id) => `AFFIPH${id}END`);
}

// --- サイト内URLを相対パスに変換（Turndown前）---
function convertInternalUrls(html) {
  const escaped = SITE_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html
    // 画像URL: /wp-content/uploads/ → /images/（ドメインあり・なし両方）
    .replace(new RegExp(escaped + '\\/wp-content\\/uploads\\/', 'g'), '/images/')
    .replace(/\/wp-content\/uploads\//g, '/images/')
    // 内部リンク: https://example.com/path/ → /posts/path/（wp-content以外）
    .replace(new RegExp(escaped + '\\/([a-zA-Z][^"\'\\s>]*)', 'g'), '/posts/$1');
}

// --- プレースホルダーを Hugo ショートコードに置換（Turndown後）---
function resolvePlaceholders(content) {
  // Markdownエスケープされた場合も考慮
  return content.replace(/AFFIPH(\d+)END/g, (_match, id) => {
    if (!affiMapping[id]) {
      console.warn(`  [warn] affi id=${id} がマッピングに未登録です`);
      return `<!-- affi id=${id} -->`;
    }
    return `{{< affi id="${id}" >}}`;
  });
}

// --- 見出しレベルを正規化（最浅の見出しをh2に揃える）---
function normalizeHeadings(md) {
  // コードブロック（```〜```）を除いた部分の見出しだけを対象にする
  const stripped = md.replace(/^`{3,}[\s\S]*?^`{3,}/gm, '');
  const levels = [];
  for (const m of stripped.matchAll(/^(#{1,6}) /gm)) levels.push(m[1].length);
  if (levels.length === 0) return md;
  const minLevel = Math.min(...levels);
  if (minLevel <= 2) return md;
  const shift = minLevel - 2;
  // コードブロック外の見出しのみ変換（コードブロック内の # は触らない）
  return md.replace(/(^`{3,}[\s\S]*?^`{3,})|(^#{1,6} )/gm, (_match, codeBlock, heading) => {
    if (codeBlock) return codeBlock;
    return '#'.repeat(heading.trimEnd().length - shift) + ' ';
  });
}

// --- スラッグをファイル名として安全な形に変換 ---
function safeSlug(slug, id) {
  if (!slug || !slug.trim()) return `post-${id}`;
  try {
    // URLエンコードされている場合はデコードする（例: %ef%bc%9a → ：）
    return decodeURIComponent(slug.trim());
  } catch {
    return slug.trim();
  }
}

// --- コメントをMarkdownに変換 ---
function formatComments(item) {
  const comments = Array.isArray(item['wp:comment']) ? item['wp:comment'] : item['wp:comment'] ? [item['wp:comment']] : [];
  const approved = comments.filter(c => String(c['wp:comment_approved']?.['__cdata'] ?? c['wp:comment_approved']) === '1');
  if (approved.length === 0) return '';

  const lines = ['\n\n---\n\n<div class="comment-section-title">コメント</div>\n'];
  for (const c of approved) {
    const author = c['wp:comment_author']?.['__cdata'] ?? c['wp:comment_author'] ?? '';
    const dateStr = c['wp:comment_date']?.['__cdata'] ?? c['wp:comment_date'] ?? '';
    const content = c['wp:comment_content']?.['__cdata'] ?? c['wp:comment_content'] ?? '';

    const d = new Date(dateStr.replace(' ', 'T') + '+09:00');
    const jstDate = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

    lines.push(`**${author}** · ${jstDate}\n`);

    // コード的な内容（行頭スペース・Traceback・エラー行）を検出してコードブロックに
    const paragraphs = content.split(/\n{2,}/);
    const formatted = paragraphs.map(para => {
      const paraLines = para.split('\n');
      const isCode = paraLines.some(l =>
        /^[ \t]{2,}/.test(l) ||
        /^(Traceback|File "|  File "|urllib|raise |[A-Za-z]+Error:)/.test(l)
      );
      if (isCode) {
        return `> \`\`\`\n${paraLines.map(l => `> ${l}`).join('\n')}\n> \`\`\``;
      }
      return paraLines.map(l => `> ${l}`).join('\n');
    });

    lines.push(formatted.join('\n>\n'));
    lines.push('');
  }

  return lines.join('\n');
}

// --- 日付をJST（+09:00）形式に ---
function parseDate(dateStr) {
  if (!dateStr || dateStr === '0000-00-00 00:00:00') return null;
  const d = new Date(dateStr);
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${jst.getUTCFullYear()}-${pad(jst.getUTCMonth() + 1)}-${pad(jst.getUTCDate())}` +
         `T${pad(jst.getUTCHours())}:${pad(jst.getUTCMinutes())}:${pad(jst.getUTCSeconds())}+09:00`;
}

// --- メイン処理 ---
function convert() {
  const xml = fs.readFileSync(XML_FILE, 'utf-8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
    isArray: (name) => ['item', 'category', 'tag', 'wp:category', 'wp:tag', 'wp:comment'].includes(name),
  });

  const result = parser.parse(xml);
  const items = result?.rss?.channel?.item ?? [];

  // attachmentのID→URLマッピングを作成
  const attachments = {};
  for (const item of items) {
    const postType = item['wp:post_type']?.['__cdata'] ?? item['wp:post_type'];
    if (postType !== 'attachment') continue;
    const id = String(item['wp:post_id']);
    const guid = item.guid?.['#text'] ?? item.guid ?? '';
    if (id && guid) attachments[id] = guid.trim();
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let converted = 0;
  let skipped = 0;

  for (const item of items) {
    // 公開済みの投稿のみ対象
    const postType = item['wp:post_type']?.['__cdata'] ?? item['wp:post_type'];
    const status = item['wp:status']?.['__cdata'] ?? item['wp:status'];
    if (postType !== 'post' || status !== 'publish') {
      skipped++;
      continue;
    }

    const title = item.title?.['__cdata'] ?? item.title ?? '';
    const postId = item['wp:post_id'];
    const slug = safeSlug(
      item['wp:post_name']?.['__cdata'] ?? item['wp:post_name'],
      postId
    );
    const date = parseDate(item['wp:post_date']?.['__cdata'] ?? item['wp:post_date']);
    const modified = parseDate(item['wp:post_modified']?.['__cdata'] ?? item['wp:post_modified']);
    const lastmod = (modified && modified !== date) ? modified : null;
    const rawContent = item['content:encoded']?.['__cdata'] ?? '';

    // アイキャッチ画像を取得
    const postMeta = Array.isArray(item['wp:postmeta']) ? item['wp:postmeta'] : item['wp:postmeta'] ? [item['wp:postmeta']] : [];
    const thumbMeta = postMeta.find(m => (m['wp:meta_key']?.['__cdata'] ?? m['wp:meta_key']) === '_thumbnail_id');
    const thumbId = thumbMeta ? String(thumbMeta['wp:meta_value']?.['__cdata'] ?? thumbMeta['wp:meta_value']) : null;
    const thumbUrl = thumbId ? (attachments[thumbId] ?? null) : null;
    const coverImage = thumbUrl ? thumbUrl.replace(SITE_BASE_URL + '/wp-content/uploads/', '/images/') : null;

    // WordPressのURL（例: https://example.com/it/pc/6206/）からパスを抽出
    const wpLink = item.link ?? '';
    const wpPath = wpLink.replace(SITE_BASE_URL, '').replace(/\/?$/, '/') || `/${slug}/`;

    // カテゴリとタグを収集
    const categories = [];
    const tags = [];
    const termNodes = Array.isArray(item.category) ? item.category : item.category ? [item.category] : [];
    for (const cat of termNodes) {
      const domain = cat['@_domain'];
      const name = cat['__cdata'] ?? cat['#text'] ?? '';
      if (!name) continue;
      if (domain === 'category') categories.push(name);
      else if (domain === 'post_tag') tags.push(name);
    }

    // affiをプレースホルダーに置換 → 内部URL変換 → Markdown変換 → プレースホルダーを最終リンクに解決
    const replacedContent = replaceAffiWithPlaceholder(rawContent);
    const urlConverted = convertInternalUrls(replacedContent);
    const markdown = resolvePlaceholders(normalizeHeadings(td.turndown(urlConverted)));

    // フロントマターを生成
    const frontMatter = [
      '+++',
      `title = ${JSON.stringify(title)}`,
      date ? `date = "${date}"` : '',
      lastmod ? `lastmod = "${lastmod}"` : '',
      `draft = false`,
      `url = "/posts${wpPath}"`,
      coverImage ? `image = "${coverImage}"` : '',
      categories.length ? `categories = [${categories.map(c => JSON.stringify(c)).join(', ')}]` : '',
      tags.length ? `tags = [${tags.map(t => JSON.stringify(t)).join(', ')}]` : '',
      '+++',
    ].filter(Boolean).join('\n');

    const commentSection = formatComments(item);
    const fileContent = `${frontMatter}\n\n${markdown}${commentSection}\n`;
    const outputPath = path.join(OUTPUT_DIR, `${slug}.md`);
    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`  [ok] ${slug}.md`);
    converted++;
  }

  console.log(`\n完了: ${converted}件変換, ${skipped}件スキップ`);
}

convert();
