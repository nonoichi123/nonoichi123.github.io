import { createServer } from "node:http";
import { loadLocalEnv } from "../lib/load-env.js";

const PORT = 3456;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;

await loadLocalEnv();

const appId = process.env.INSTAGRAM_APP_ID;
const appSecret = process.env.INSTAGRAM_APP_SECRET;

if (!appId || !appSecret) {
  console.error(
    ".env に INSTAGRAM_APP_ID と INSTAGRAM_APP_SECRET を設定してください。",
  );
  process.exit(1);
}

const authorize = new URL("https://www.instagram.com/oauth/authorize");
authorize.searchParams.set("client_id", appId);
authorize.searchParams.set("redirect_uri", REDIRECT_URI);
authorize.searchParams.set("response_type", "code");
authorize.searchParams.set("scope", "instagram_business_basic");

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname !== "/callback") {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const error = url.searchParams.get("error");
  if (error) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("認証がキャンセルされました。");
    server.close();
    return;
  }

  const code = url.searchParams.get("code");
  if (!code) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("code がありません。");
    return;
  }

  try {
    const shortLived = await exchangeCode(code);
    const longLived = (await exchangeLongLived(shortLived)) || shortLived;
    response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(
      "トークンを取得しました。ターミナルに表示されている値を .env の INSTAGRAM_ACCESS_TOKEN に保存してください。このタブは閉じて構いません。",
    );
    console.log("\nINSTAGRAM_ACCESS_TOKEN を .env に保存してください:\n");
    console.log(longLived);
    console.log("");
  } catch (authError) {
    response.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(
      "トークン取得に失敗しました。ターミナルのログを確認してください。",
    );
    console.error(authError);
  } finally {
    server.close();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Meta のアプリ設定にこの Redirect URI を追加してください:");
  console.log(`  ${REDIRECT_URI}`);
  console.log("\nブラウザで Instagram にログインしてください:");
  console.log(`  ${authorize.toString()}\n`);
});

async function exchangeCode(code) {
  const body = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code,
  });

  const response = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = await response.json();
  const token = payload.access_token || payload.data?.[0]?.access_token;
  if (!response.ok || !token) {
    throw new Error(
      payload.error_message ||
        payload.error?.message ||
        "short-lived token failed",
    );
  }
  return token;
}

async function exchangeLongLived(shortLived) {
  const endpoint = new URL("https://graph.instagram.com/access_token");
  endpoint.searchParams.set("grant_type", "ig_exchange_token");
  endpoint.searchParams.set("client_secret", appSecret);
  endpoint.searchParams.set("access_token", shortLived);

  const response = await fetch(endpoint);
  const payload = await response.json();
  if (!response.ok) {
    return "";
  }
  return payload.access_token || "";
}
