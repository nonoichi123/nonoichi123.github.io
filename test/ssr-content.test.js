import assert from "node:assert/strict";
import { test } from "node:test";
import { escapeHtml } from "../functions/_lib/escape.js";
import { renderArticlePage, renderListPage } from "../functions/_lib/render.js";

const request = new Request("https://nonopp.jp/news/");
const env = { ENVIRONMENT: "production", SITE_ORIGIN: "https://nonopp.jp" };

test("escapeHtml が特殊文字をエスケープする", () => {
  assert.equal(
    escapeHtml('<a href="x">\'&'),
    "&lt;a href=&quot;x&quot;&gt;&#39;&amp;",
  );
});

test("お知らせ一覧の HTML に SEO と見出しが含まれる", async () => {
  const response = renderListPage({
    kind: "news",
    items: [
      {
        slug: "hello",
        title: "公開テスト <script>",
        publishedAt: "2026-10-02",
        eyecatchUrl: null,
      },
    ],
    origin: "https://nonopp.jp",
    request,
    env,
  });
  const html = await response.text();

  assert.match(html, /<title>お知らせ一覧 - ノノップ<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/nonopp\.jp\/news\/"/);
  assert.match(
    html,
    /name="description" content="ノノップからのお知らせ一覧です。"/,
  );
  assert.match(html, /お知らせ一覧/);
  assert.match(html, /href="\/news\/hello\/"/);
  assert.match(html, /公開テスト &lt;script&gt;/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /CollectionPage/);
});

test("記事詳細の HTML ソースに本文と SEO が含まれる", async () => {
  const response = renderArticlePage({
    kind: "news",
    article: {
      version: 1,
      type: "news",
      slug: "hello",
      title: "タイトル",
      publishedAt: "2026-09-30T09:00:00+09:00",
      body: "<p>本文です。JavaScript不要。</p>",
      eyecatchUrl: "https://cdn.example.com/a.jpg",
      seo: {
        title: "SEOタイトル",
        description: "SEO説明文",
      },
    },
    origin: "https://nonopp.jp",
    request: new Request("https://nonopp.jp/news/hello/"),
    env,
  });
  const html = await response.text();

  assert.match(html, /<title>SEOタイトル - ノノップ<\/title>/);
  assert.match(html, /name="description" content="SEO説明文"/);
  assert.match(
    html,
    /rel="canonical" href="https:\/\/nonopp\.jp\/news\/hello\/"/,
  );
  assert.match(html, /<h1 class="colorlib-heading">タイトル<\/h1>/);
  assert.match(html, /<p>本文です。JavaScript不要。<\/p>/);
  assert.match(html, /NewsArticle/);
  assert.match(html, /datePublished/);
  assert.match(html, /cdn\.example\.com\/a\.jpg/);
});

test("ブログ詳細は BlogPosting の JSON-LD を出す", async () => {
  const response = renderArticlePage({
    kind: "blog",
    article: {
      version: 1,
      type: "blog",
      slug: "post-1",
      title: "ブログ記事",
      publishedAt: "2026-09-30",
      body: "<p>blog body</p>",
      eyecatchUrl: null,
      seo: { title: "ブログ記事", description: "desc" },
    },
    origin: "https://nonopp.jp",
    request: new Request("https://nonopp.jp/blog/post-1/"),
    env,
  });
  const html = await response.text();
  assert.match(html, /BlogPosting/);
  assert.match(html, /blog body/);
  assert.match(html, /canonical" href="https:\/\/nonopp\.jp\/blog\/post-1\/"/);
});
