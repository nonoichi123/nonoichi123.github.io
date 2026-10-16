import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const cachePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../.cache/news.json",
);

export default async function () {
  let items = [];
  try {
    const parsed = JSON.parse(await readFile(cachePath, "utf8"));
    items = Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    items = [];
  }

  return {
    items,
    articlePages: items,
  };
}
