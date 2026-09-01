import { mkdir, writeFile } from "node:fs/promises";
import { fetchInstagramFeed } from "./lib/instagram.js";

export default function (eleventyConfig) {
  eleventyConfig.on("eleventy.before", async () => {
    const feed = await fetchInstagramFeed();
    await mkdir(".cache", { recursive: true });
    await writeFile(".cache/instagram-feed.json", JSON.stringify(feed));
  });

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/CNAME");

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
