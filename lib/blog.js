import { fetchPublished } from "./content-index.js";

export function fetchBlog() {
  return fetchPublished("blog");
}
