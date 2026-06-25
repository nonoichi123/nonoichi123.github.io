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
  assert.match(html, /フルスタックエンジニア/);
});

test("index.html に主要セクションが表示される", async () => {
  const html = await readBuiltPage("index.html");

  assert.match(html, />My Strengths</);
  assert.match(html, />About</);
  assert.match(html, />Services</);
  assert.match(html, />Skills</);
  assert.match(html, />Work Experience</);
  assert.match(html, />Contact</);
});

test("index.html に案件実績とスキルが表示される", async () => {
  const html = await readBuiltPage("index.html");

  assert.match(html, /デモ機貸出システム開発/);
  assert.match(html, /後払い決済管理システム開発/);
  assert.match(html, /TypeScript/);
  assert.match(html, /認定スクラムマスター（CSM）/);
  assert.match(html, /情報処理安全確保支援士/);
});

test("index.html に連絡先が表示される", async () => {
  const html = await readBuiltPage("index.html");

  assert.match(html, /nonoichi123@gmail\.com/);
  assert.match(html, /formspree\.io/);
});

test("thanks.html にお問い合わせ完了メッセージが表示される", async () => {
  const html = await readBuiltPage("thanks.html");

  assert.match(html, /お問い合わせ/);
  assert.match(html, /ありがとう/);
  assert.match(html, /ホームに戻る/);
});
