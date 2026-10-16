import { mkdir, writeFile } from "node:fs/promises";
import { fetchInstagramFeed } from "./lib/instagram.js";
import { fetchNews } from "./lib/news.js";

export default function (eleventyConfig) {
  eleventyConfig.on("eleventy.before", async () => {
    // お知らせ・ブログの一覧/詳細は Workers SSR（functions/）が担当。
    // トップの News 抜粋だけビルド時取得（未設定時は空）。
    const [feed, news] = await Promise.all([fetchInstagramFeed(), fetchNews()]);
    await mkdir(".cache", { recursive: true });
    await writeFile(".cache/instagram-feed.json", JSON.stringify(feed));
    await writeFile(".cache/news.json", JSON.stringify(news));
  });

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");

  eleventyConfig.addFilter("startsWith", (value, prefix) =>
    String(value || "").startsWith(String(prefix || "")),
  );

  eleventyConfig.addGlobalData("env", {
    production: process.env.ELEVENTY_ENV === "production",
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "html", "md"],
  };
}
