import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnv } from "./load-env.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const imageDir = join(root, "src/assets/images/instagram");
const POST_LIMIT = 3;
const MEDIA_FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_url",
  "permalink",
  "thumbnail_url",
  "timestamp",
  "children{media_url,media_type,thumbnail_url}",
].join(",");

export async function fetchInstagramFeed() {
  await loadLocalEnv();

  const token = await resolveToken();
  if (!token) {
    return { posts: [] };
  }

  try {
    const posts = await fetchRecentPosts(token);
    return { posts };
  } catch (error) {
    console.warn(
      `[instagram] 投稿の取得に失敗したため、Instagram は非表示になります: ${error.message}`,
    );
    return { posts: [] };
  }
}

async function resolveToken() {
  const current = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!current) {
    return "";
  }

  const endpoint = new URL("https://graph.instagram.com/refresh_access_token");
  endpoint.searchParams.set("grant_type", "ig_refresh_token");
  endpoint.searchParams.set("access_token", current);

  try {
    const payload = await fetchJson(endpoint, { timeoutMs: 8000 });
    return payload.access_token || current;
  } catch {
    return current;
  }
}

async function fetchRecentPosts(token) {
  const endpoint = new URL("https://graph.instagram.com/me/media");
  endpoint.searchParams.set("fields", MEDIA_FIELDS);
  endpoint.searchParams.set("limit", String(POST_LIMIT));
  endpoint.searchParams.set("access_token", token);

  const payload = await fetchJson(endpoint, { timeoutMs: 15000 });
  const items = Array.isArray(payload.data)
    ? payload.data.slice(0, POST_LIMIT)
    : [];

  await mkdir(imageDir, { recursive: true });

  const posts = [];
  for (const item of items) {
    const remoteImage = imageUrl(item);
    const localImage = remoteImage ? await saveImage(item.id, remoteImage) : "";

    posts.push({
      id: item.id,
      caption: captionPreview(item.caption),
      permalink: item.permalink,
      dateLabel: formatDate(item.timestamp),
      mediaType: item.media_type,
      image: localImage || remoteImage,
    });
  }

  return posts;
}

function imageUrl(item) {
  if (item.media_type === "VIDEO" || item.media_type === "REELS") {
    return item.thumbnail_url || item.media_url || "";
  }

  if (item.media_type === "CAROUSEL_ALBUM") {
    const child = item.children?.data?.[0];
    if (child?.media_type === "VIDEO") {
      return child.thumbnail_url || child.media_url || item.media_url || "";
    }
    return child?.media_url || item.media_url || "";
  }

  return item.media_url || "";
}

async function saveImage(id, url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      return "";
    }

    const extension = extensionFromType(response.headers.get("content-type"));
    const filename = `${id}.${extension}`;
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(join(imageDir, filename), buffer);
    return `assets/images/instagram/${filename}`;
  } catch {
    return "";
  }
}

function extensionFromType(contentType) {
  if (contentType?.includes("png")) {
    return "png";
  }
  if (contentType?.includes("webp")) {
    return "webp";
  }
  if (contentType?.includes("mp4")) {
    return "jpg";
  }
  return "jpg";
}

function captionPreview(caption) {
  if (!caption) {
    return "";
  }

  const firstLine = caption.split("\n")[0].trim();
  return firstLine.length > 80 ? `${firstLine.slice(0, 79)}…` : firstLine;
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

async function fetchJson(url, { timeoutMs }) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || `HTTP ${response.status}`);
  }
  return payload;
}
