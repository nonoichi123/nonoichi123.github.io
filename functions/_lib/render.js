import { formatJapaneseDate, toDateOnly } from "./dates.js";
import { escapeAttr, escapeHtml } from "./escape.js";
import { htmlResponse, renderDocument } from "./layout.js";

const KIND_META = {
  news: {
    label: "お知らせ",
    listTitle: "お知らせ一覧",
    listDescription: "ノノップからのお知らせ一覧です。",
    listKeywords: "ノノップ,nonopp,お知らせ,木津川市",
    headingMeta: "お知らせ",
    backHome: { href: "/", label: "ホームへ戻る" },
    backList: { href: "/news/", label: "お知らせ一覧へ戻る" },
    empty: "公開中のお知らせはありません。",
    titleSuffix: " - ノノップ",
    activeNav: "news",
    schemaType: "NewsArticle",
  },
  blog: {
    label: "企業ブログ",
    listTitle: "nonopp log",
    listDescription:
      "ノノップの企業ブログです。開発で学んだことや気付きをまとめています。",
    listKeywords: "ノノップ,nonopp,ブログ,nonopp log,木津川市",
    headingMeta: "企業ブログ",
    backHome: { href: "/#blog", label: "ブログへ戻る" },
    backList: { href: "/blog/", label: "ブログ一覧へ戻る" },
    empty: "公開中の記事はありません。",
    listLead: "開発で学んだことや気付きをまとめています。",
    titleSuffix: " - nonopp log",
    activeNav: null,
    schemaType: "BlogPosting",
  },
};

export function isProductionRequest(request, env) {
  const host = new URL(request.url).hostname;
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".workers.dev")
  ) {
    return false;
  }
  if (String(env.ENVIRONMENT || "").toLowerCase() === "development") {
    return false;
  }
  if (String(env.ENVIRONMENT || "").toLowerCase() === "production") {
    return true;
  }
  if (String(env.ELEVENTY_ENV || "").toLowerCase() === "production") {
    return true;
  }
  return host === "nonopp.jp" || host === "www.nonopp.jp";
}

export function renderListPage({ kind, items, origin, request, env }) {
  const meta = KIND_META[kind];
  const canonical = `${origin}/${kind}/`;
  const listItems = Array.isArray(items) ? items : [];

  let listHtml;
  if (listItems.length === 0) {
    listHtml = `<p>${escapeHtml(meta.empty)}</p>`;
  } else {
    listHtml = `<ul class="news-list">${listItems
      .map((item) => {
        const slug = String(item.slug || "");
        const href = `/${kind}/${encodeURIComponent(slug)}/`;
        const title = escapeHtml(item.title || "");
        const publishedAt = toDateOnly(item.publishedAt);
        const label = formatJapaneseDate(publishedAt);
        const thumb = item.eyecatchUrl
          ? `<img class="news-card-thumb" src="${escapeAttr(item.eyecatchUrl)}" alt="" />`
          : "";
        return `<li>
          <a class="news-card" href="${escapeAttr(href)}">
            <span class="news-card-text">
              <span class="news-card-title">${title}</span>
              <time datetime="${escapeAttr(publishedAt)}">${escapeHtml(label)}</time>
            </span>
            ${thumb}
          </a>
        </li>`;
      })
      .join("")}</ul>`;
  }

  const lead = meta.listLead ? `<p>${escapeHtml(meta.listLead)}</p>` : "";
  const mainHtml = `<section class="colorlib-blog" data-section="${kind}">
  <div class="colorlib-narrow-content">
    <div class="row">
      <div class="col-md-12">
        <p class="it-support-back"><a href="${escapeAttr(meta.backHome.href)}">${escapeHtml(meta.backHome.label)}</a></p>
        <span class="heading-meta">${escapeHtml(meta.headingMeta)}</span>
        <h2 class="colorlib-heading">${escapeHtml(meta.listTitle)}</h2>
        ${lead}
      </div>
    </div>
    ${listHtml}
  </div>
</section>`;

  const html = renderDocument({
    title: `${meta.listTitle} - ノノップ`,
    description: meta.listDescription,
    canonical,
    keywords: meta.listKeywords,
    activeNav: meta.activeNav,
    mainHtml,
    production: isProductionRequest(request, env),
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: meta.listTitle,
      description: meta.listDescription,
      url: canonical,
      isPartOf: {
        "@type": "WebSite",
        name: "ノノップ",
        url: origin + "/",
      },
    },
  });

  return htmlResponse(html);
}

export function renderArticlePage({ kind, article, origin, request, env }) {
  const meta = KIND_META[kind];
  const slug = String(article.slug || "");
  const canonical = `${origin}/${kind}/${encodeURIComponent(slug)}/`;
  const pageTitle = String(
    article.seo?.title || article.title || meta.listTitle,
  );
  const description = String(
    article.seo?.description || article.title || meta.listDescription,
  );
  const publishedAt = String(article.publishedAt || "");
  const publishedDate = toDateOnly(publishedAt);
  const publishedLabel = formatJapaneseDate(publishedDate);
  const eyecatch = article.eyecatchUrl ? String(article.eyecatchUrl) : "";
  // body は hubno 側でサニタイズ済みの HTML
  const bodyHtml = String(article.body || "");

  const timeHtml = publishedDate
    ? `<p><time datetime="${escapeAttr(publishedAt || publishedDate)}">${escapeHtml(publishedLabel)}</time></p>`
    : "";
  const eyecatchHtml = eyecatch
    ? `<p><img src="${escapeAttr(eyecatch)}" alt="${escapeAttr(article.title || "")}" class="news-eyecatch" /></p>`
    : "";

  const mainHtml = `<section class="colorlib-blog" data-section="${kind}">
  <div class="colorlib-narrow-content">
    <div class="row">
      <div class="col-md-12">
        <p class="it-support-back"><a href="${escapeAttr(meta.backList.href)}">${escapeHtml(meta.backList.label)}</a></p>
        <span class="heading-meta">${escapeHtml(meta.headingMeta)}</span>
        <h1 class="colorlib-heading">${escapeHtml(article.title || "")}</h1>
        ${timeHtml}
        ${eyecatchHtml}
        <div class="news-body">${bodyHtml}</div>
      </div>
    </div>
  </div>
</section>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": meta.schemaType,
    headline: article.title || pageTitle,
    description,
    datePublished: publishedAt || publishedDate,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    author: {
      "@type": "Organization",
      name: "ノノップ",
      url: origin + "/",
    },
    publisher: {
      "@type": "Organization",
      name: "ノノップ",
      logo: {
        "@type": "ImageObject",
        url: `${origin}/assets/images/nonopp.png`,
      },
    },
  };
  if (eyecatch) {
    jsonLd.image = [eyecatch];
  }

  const html = renderDocument({
    title: `${pageTitle}${meta.titleSuffix}`,
    description,
    canonical,
    keywords: meta.listKeywords,
    ogType: "article",
    ogImage: eyecatch || "/assets/images/nonopp.png",
    jsonLd,
    activeNav: meta.activeNav,
    mainHtml,
    production: isProductionRequest(request, env),
  });

  return htmlResponse(html);
}

export function renderErrorPage({
  status,
  title,
  message,
  origin,
  request,
  env,
  activeNav = null,
}) {
  const canonical = `${origin}/`;
  const mainHtml = `<section class="colorlib-blog">
  <div class="colorlib-narrow-content">
    <div class="row">
      <div class="col-md-12">
        <p class="it-support-back"><a href="/">ホームへ戻る</a></p>
        <h1 class="colorlib-heading">${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
      </div>
    </div>
  </div>
</section>`;

  const html = renderDocument({
    title: `${title} - ノノップ`,
    description: message,
    canonical,
    keywords: "ノノップ,nonopp",
    activeNav,
    mainHtml,
    production: isProductionRequest(request, env),
  });

  return htmlResponse(html, status, "no-store");
}

export function isValidSlug(slug) {
  return typeof slug === "string" && /^[A-Za-z0-9_-]+$/.test(slug);
}
