import { loadLocalEnv } from "./load-env.js";

export async function fetchPublished(kind) {
  await loadLocalEnv();
  const indexUrl = indexUrlFor(kind);
  const label = kind === "blog" ? "ブログ" : "お知らせ";
  if (!indexUrl) {
    return { items: [] };
  }

  try {
    const index = await fetchJson(indexUrl);
    if (!Array.isArray(index)) {
      throw new Error(`${kind} index.json must be an array`);
    }

    const items = [];
    for (const entry of index) {
      if (!entry || typeof entry.slug !== "string" || !entry.slug) {
        continue;
      }

      const articleUrl = articleJsonUrl(indexUrl, entry.slug);
      let article = null;
      try {
        article = await fetchJson(articleUrl);
      } catch (error) {
        console.warn(
          `[${kind}] ${entry.slug} の取得に失敗しました: ${error.message}`,
        );
      }

      const publishedAt = String(
        entry.publishedAt || article?.publishedAt || "",
      ).slice(0, 10);
      items.push({
        slug: entry.slug,
        title: String(article?.title || entry.title || ""),
        publishedAt,
        publishedAtLabel: formatJapaneseDate(publishedAt),
        url: `/${kind}/${encodeURIComponent(entry.slug)}/`,
        eyecatchUrl: String(article?.eyecatchUrl || entry.eyecatchUrl || ""),
        description: String(article?.seo?.description || ""),
        body: String(article?.body || ""),
      });
    }

    return { items };
  } catch (error) {
    console.warn(
      `[${kind}] ${label}の取得に失敗したため、一覧は空になります: ${error.message}`,
    );
    return { items: [] };
  }
}

function indexUrlFor(kind) {
  if (kind === "blog") {
    const explicit = process.env.BLOG_INDEX_URL?.trim();
    if (explicit) {
      return explicit;
    }
    return process.env.NEWS_INDEX_URL?.trim().replace(
      /\/news\/index\.json(?=$|\?)/,
      "/blog/index.json",
    );
  }
  return process.env.NEWS_INDEX_URL?.trim();
}

function articleJsonUrl(indexUrl, slug) {
  return indexUrl.replace(
    /index\.json(?:\?.*)?$/,
    `${encodeURIComponent(slug)}.json`,
  );
}

function formatJapaneseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return value;
  }
  return `${Number(match[1])}年${Number(match[2])}月${Number(match[3])}日`;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`${url} -> ${response.status}`);
  }
  return response.json();
}
