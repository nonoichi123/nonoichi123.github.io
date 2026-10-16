import { handleArticle } from "../_lib/handlers.js";

export async function onRequest(context) {
  return handleArticle("blog", context);
}
