import { fetchPublished } from "./content-index.js";

export function fetchNews() {
  return fetchPublished("news");
}
