const INDEX_CACHE_TTL_SECONDS = 120;
const ARTICLE_CACHE_TTL_SECONDS = 120;

/**
 * hubno / CMS の公開 JSON を取得する。
 * NEWS_INDEX_URL = .../news/index.json
 * blog は同トークンの /blog/index.json
 */
export function indexUrlFor(kind, env) {
  if (kind === "blog") {
    const explicit = String(env.BLOG_INDEX_URL || "").trim();
    if (explicit) {
      return explicit;
    }
    return String(env.NEWS_INDEX_URL || "")
      .trim()
      .replace(/\/news\/index\.json(?=$|\?)/, "/blog/index.json");
  }
  return String(env.NEWS_INDEX_URL || "").trim();
}

export function articleJsonUrl(indexUrl, slug) {
  return indexUrl.replace(
    /index\.json(?:\?.*)?$/,
    `${encodeURIComponent(slug)}.json`,
  );
}

export function siteOrigin(env, request) {
  const configured = String(env.SITE_ORIGIN || "")
    .trim()
    .replace(/\/$/, "");
  if (configured) {
    return configured;
  }
  return new URL(request.url).origin;
}

export async function fetchIndex(kind, env, ctx) {
  const indexUrl = indexUrlFor(kind, env);
  if (!indexUrl) {
    return {
      ok: false,
      status: 503,
      error: "NEWS_INDEX_URL is not configured",
    };
  }

  try {
    const data = await fetchJsonCached(
      indexUrl,
      env,
      ctx,
      INDEX_CACHE_TTL_SECONDS,
    );
    if (!Array.isArray(data)) {
      return {
        ok: false,
        status: 502,
        error: `${kind} index.json must be an array`,
      };
    }
    return { ok: true, indexUrl, items: data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      error: error.message || String(error),
    };
  }
}

export async function fetchArticle(kind, slug, env, ctx) {
  const indexResult = await fetchIndex(kind, env, ctx);
  if (!indexResult.ok) {
    return indexResult;
  }

  const entry = indexResult.items.find((item) => item && item.slug === slug);
  if (!entry) {
    return { ok: false, status: 404, error: "not_found" };
  }

  const articleUrl = articleJsonUrl(indexResult.indexUrl, slug);
  try {
    const article = await fetchJsonCached(
      articleUrl,
      env,
      ctx,
      ARTICLE_CACHE_TTL_SECONDS,
    );
    if (!article || typeof article !== "object") {
      return { ok: false, status: 502, error: "invalid article json" };
    }
    return {
      ok: true,
      entry,
      article,
      indexUrl: indexResult.indexUrl,
    };
  } catch (error) {
    const status = /-> 404\b/.test(error.message) ? 404 : 502;
    return {
      ok: false,
      status,
      error: error.message || String(error),
    };
  }
}

async function fetchJsonCached(url, env, ctx, ttlSeconds) {
  const cache = caches.default;
  const cacheKey = new Request(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached.json();
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    cf: {
      cacheTtl: ttlSeconds,
      cacheEverything: true,
    },
  });

  if (!response.ok) {
    throw new Error(`${url} -> ${response.status}`);
  }

  const cloned = response.clone();
  if (ctx?.waitUntil) {
    const headers = new Headers(cloned.headers);
    headers.set("Cache-Control", `public, s-maxage=${ttlSeconds}`);
    ctx.waitUntil(cache.put(cacheKey, new Response(cloned.body, { headers })));
  }

  return response.json();
}
