import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function readBuiltPage(filename) {
  return readFile(join(root, "_site", filename), "utf8");
}

test("index.html にサイト名と拠点が表示される", async () => {
  const html = await readBuiltPage("index.html");

  assert.match(html, /ノノップ/);
  assert.match(html, /木津川市を拠点/);
  assert.match(html, /システム開発・ITサービス運営/);
});

test("index.html に主要セクションが表示される", async () => {
  const html = await readBuiltPage("index.html");

  assert.match(html, />About</);
  assert.match(html, />Services</);
  assert.match(html, />Skills</);
  assert.match(html, />Contact</);
  assert.doesNotMatch(html, />Our Strengths</);
  assert.doesNotMatch(html, />Work Experience</);
});

test("index.html に理念とサービスが表示される", async () => {
  const html = await readBuiltPage("index.html");

  assert.match(html, /信頼できるITパートナー/);
  assert.match(html, /Webシステム開発/);
  assert.match(html, /AIコンサルティング/);
  assert.doesNotMatch(html, /被災状況確認LINE/);
  assert.doesNotMatch(html, /hisai-check\.com/);
});

test("index.html にスキルと資格が表示される", async () => {
  const html = await readBuiltPage("index.html");

  assert.match(html, /TypeScript/);
  assert.match(html, /Laravel/);
  assert.match(html, /assets\/images\/skills\/laravel\.svg/);
  assert.match(html, /プログラム言語／フレームワーク/);
  assert.match(html, /資格・認定/);
  assert.match(html, /認定スクラムマスター（CSM）/);
  assert.match(html, /情報処理安全確保支援士/);
  assert.doesNotMatch(html, /デモ機貸出システム開発/);
});

test("index.html にブログが表示される", async () => {
  const html = await readBuiltPage("index.html");

  assert.match(html, /Recent Blog/);
  assert.match(html, /Danroo note/);
  assert.match(html, /blog-danroo\.jpg/);
  assert.doesNotMatch(html, /Firebase Emulator Suite/);
  assert.doesNotMatch(html, /続きを読む/);
});

test("index.html にお問い合わせフォームが表示される", async () => {
  const html = await readBuiltPage("index.html");

  assert.match(html, /formspree\.io/);
  assert.match(html, /name="company"/);
  assert.match(html, /内容を送信する/);
  assert.doesNotMatch(html, /nonoichi123@gmail\.com/);
  assert.doesNotMatch(html, /名刺交換後/);
});

test("thanks.html にお問い合わせ完了メッセージが表示される", async () => {
  const html = await readBuiltPage("thanks.html");

  assert.match(html, /お問い合わせ/);
  assert.match(html, /ありがとう/);
  assert.match(html, /ホームに戻る/);
});
