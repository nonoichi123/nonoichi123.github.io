/**
 * Workers + Static Assets 向けアダプタ。
 * functions/ 配下の Pages Functions 互換ハンドラへルーティングする。
 */
import * as blogIndex from "../functions/blog/index.js";
import * as blogSlug from "../functions/blog/[slug].js";
import * as newsIndex from "../functions/news/index.js";
import * as newsSlug from "../functions/news/[slug].js";
import * as sitemap from "../functions/sitemap.xml.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = normalizePath(url.pathname);
    const context = {
      request,
      env,
      params: {},
      waitUntil: ctx.waitUntil.bind(ctx),
      next: () => env.ASSETS.fetch(request),
      data: {},
    };

    if (path === "/sitemap.xml") {
      return sitemap.onRequest(context);
    }

    if (path === "/news" || path === "/news/") {
      return newsIndex.onRequest(context);
    }

    const newsMatch = /^\/news\/([^/]+)\/?$/.exec(path);
    if (newsMatch) {
      context.params = { slug: newsMatch[1] };
      return newsSlug.onRequest(context);
    }

    if (path === "/blog" || path === "/blog/") {
      return blogIndex.onRequest(context);
    }

    const blogMatch = /^\/blog\/([^/]+)\/?$/.exec(path);
    if (blogMatch) {
      context.params = { slug: blogMatch[1] };
      return blogSlug.onRequest(context);
    }

    return env.ASSETS.fetch(request);
  },
};

function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname;
  }
  return pathname;
}
