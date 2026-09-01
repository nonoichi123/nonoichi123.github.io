import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const cachePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../.cache/instagram-feed.json",
);

export default async function () {
  try {
    const feed = JSON.parse(await readFile(cachePath, "utf8"));
    const posts = Array.isArray(feed.posts) ? feed.posts.slice(0, 3) : [];
    return { posts };
  } catch {
    return { posts: [] };
  }
}
