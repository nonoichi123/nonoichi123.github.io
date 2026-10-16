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
  assert.match(html, /被災状況確認LINE/);
  assert.match(html, /災害時の安否確認や被災状況の把握を、身近なLINEで簡単に。/);
  assert.match(html, /https:\/\/hisai-check\.com\//);
  assert.match(html, /service-external-icon/);
  assert.match(html, /新しいタブで開く/);
  assert.match(html, /外部IT担当/);
  assert.match(html, /href="\/services\/it-support\/"/);
  assert.match(html, /セミナー講師/);
  assert.match(html, /生成AI実践セミナー/);
  assert.match(html, /実務に役立つAI活用を、わかりやすく伝えます。/);
  assert.match(
    html,
    /個別相談会を通じて、スタートアップや小規模事業者の課題解決・業務改善も支援/,
  );
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
  assert.match(html, /href="\/works\/"/);
  assert.match(html, /導入・開発実績を見る/);
  assert.doesNotMatch(html, /デモ機貸出システム開発/);
});

test("実績ページに導入・開発案件が表示される", async () => {
  const html = await readBuiltPage("works/index.html");

  assert.match(html, /導入・開発実績/);
  assert.match(html, />実績</);
  assert.match(html, /生成AI活用セミナー開催/);
  assert.match(html, /2026年9月/);
  assert.match(
    html,
    /20名弱の経営層の方々向けに2時間の生成AI実践セミナーを開催しました。/,
  );
  assert.match(html, /デモ機貸出システム開発/);
  assert.match(html, /後払い決済管理システム開発/);
  assert.match(html, /2023年3月 - 2026年6月/);
  assert.match(html, /href="\/#skills"/);
});

test("index.html にブログが表示される", async () => {
  const html = await readBuiltPage("index.html");

  assert.match(html, /Recent Blog/);
  assert.match(html, /Danroo note/);
  assert.match(html, /blog-danroo\.jpg/);
  assert.match(html, /企業ブログ/);
  assert.match(html, /nonopp log/);
  assert.match(html, /開発で学んだことや気付きをまとめています。/);
  assert.match(html, /href="\/blog\/"/);
  assert.doesNotMatch(html, /instagram-grid/);
  assert.doesNotMatch(html, /icon-instagram/);
  assert.doesNotMatch(html, /オリジナル曲を発信しています。/);
  assert.doesNotMatch(html, /instagram-more/);
  assert.doesNotMatch(html, /Instagram を見る/);
  assert.doesNotMatch(html, /instagram\.com\/rhinonolike/);
  assert.doesNotMatch(html, /instagram-feed\.js/);
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

test("外部IT担当の紹介ページにプランと相談先が表示される", async () => {
  const html = await readBuiltPage("services/it-support/index.html");

  assert.match(html, /ITの「これ、誰に聞けばいい？」をなくします。/);
  assert.match(html, /スタンダードプラン/);
  assert.match(html, /5,000円/);
  assert.match(html, /伴走サポートプラン/);
  assert.match(html, /10,000円/);
  assert.match(html, /3,000円/);
  assert.doesNotMatch(html, /080/);
  assert.doesNotMatch(html, /sales@nonopp\.jp/);
  assert.doesNotMatch(html, /平日 10:00/);
  assert.match(html, /assets\/images\/line-qr\.png/);
  assert.match(html, /最初の30分は無料/);
});

test("トップの News 導線と robots.txt がある", async () => {
  const html = await readBuiltPage("index.html");
  const robots = await readBuiltPage("robots.txt");

  assert.match(html, /href="\/news\/"/);
  assert.match(html, />News</);
  assert.match(robots, /Sitemap: https:\/\/nonopp\.jp\/sitemap\.xml/);
});

test("thanks.html にお問い合わせ完了メッセージが表示される", async () => {
  const html = await readBuiltPage("thanks.html");

  assert.match(html, /お問い合わせ/);
  assert.match(html, /ありがとう/);
  assert.match(html, /ホームに戻る/);
});
