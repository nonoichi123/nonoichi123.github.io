import { handleSitemap } from "./_lib/handlers.js";

export async function onRequest(context) {
  return handleSitemap(context);
}
