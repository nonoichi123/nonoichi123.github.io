import { fetchArticle, fetchIndex, siteOrigin } from "./content.js";
import {
  isValidSlug,
  renderArticlePage,
  renderErrorPage,
  renderListPage,
} from "./render.js";

export async function handleList(kind, context) {
  const { request, env, waitUntil } = context;
  const origin = siteOrigin(env, request);
  const result = await fetchIndex(kind, env, { waitUntil });

  if (!result.ok) {
    return renderErrorPage({
      status: result.status === 404 ? 404 : 503,
      title: "一時的に表示できません",
      message:
        "コンテンツの取得に失敗しました。しばらくしてから再度お試しください。",
      origin,
      request,
      env,
      activeNav: kind === "news" ? "news" : null,
    });
  }

  return renderListPage({
    kind,
    items: result.items,
    origin,
    request,
    env,
  });
}

export async function handleArticle(kind, context) {
  const { request, env, waitUntil, params } = context;
  const origin = siteOrigin(env, request);
  const slug = decodeURIComponent(String(params.slug || "")).replace(/\/$/, "");

  if (!isValidSlug(slug)) {
    return renderErrorPage({
      status: 404,
      title: "ページが見つかりません",
      message: "指定された記事は存在しないか、公開されていません。",
      origin,
      request,
      env,
      activeNav: kind === "news" ? "news" : null,
    });
  }

  const result = await fetchArticle(kind, slug, env, { waitUntil });
  if (!result.ok) {
    if (result.status === 404) {
      return renderErrorPage({
        status: 404,
        title: "ページが見つかりません",
        message: "指定された記事は存在しないか、公開されていません。",
        origin,
        request,
        env,
        activeNav: kind === "news" ? "news" : null,
      });
    }
    return renderErrorPage({
      status: 503,
      title: "一時的に表示できません",
      message:
        "コンテンツの取得に失敗しました。しばらくしてから再度お試しください。",
      origin,
      request,
      env,
      activeNav: kind === "news" ? "news" : null,
    });
  }

  return renderArticlePage({
    kind,
    article: result.article,
    origin,
    request,
    env,
  });
}

export async function handleSitemap(context) {
  const { request, env, waitUntil } = context;
  const origin = siteOrigin(env, request);
  const urls = [`${origin}/`, `${origin}/news/`, `${origin}/blog/`];

  const [news, blog] = await Promise.all([
    fetchIndex("news", env, { waitUntil }),
    fetchIndex("blog", env, { waitUntil }),
  ]);

  if (news.ok) {
    for (const item of news.items) {
      if (item?.slug) {
        urls.push(`${origin}/news/${encodeURIComponent(item.slug)}/`);
      }
    }
  }
  if (blog.ok) {
    for (const item of blog.items) {
      if (item?.slug) {
        urls.push(`${origin}/blog/${encodeURIComponent(item.slug)}/`);
      }
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url><loc>${escapeXml(loc)}</loc></url>`).join("\n")}
</urlset>
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
