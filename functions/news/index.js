import { handleList } from "../_lib/handlers.js";

export async function onRequest(context) {
  return handleList("news", context);
}
