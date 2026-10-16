# nonopp.jp

ノノップのポートフォリオサイト（[Eleventy](https://www.11ty.dev/) + Cloudflare Workers SSR）

## ローカル起動

### 必要環境

- Node.js 22 以上
- npm

### 手順

```bash
# 依存関係のインストール
npm ci

# 開発サーバーの起動（静的ページ）
npm start
```

ブラウザで [http://localhost:8080](http://localhost:8080) を開いて確認できます。ファイルを保存すると自動で再ビルドされます。

お知らせ・ブログの SSR（`/news/` `/blog/`）を含めて確認する場合:

```bash
# .dev.vars に NEWS_INDEX_URL を置く（.env と同値で可）
npm run preview
```

### その他のコマンド

| コマンド        | 説明                                      |
| --------------- | ----------------------------------------- |
| `npm run build` | 本番用に `_site` へビルド                 |
| `npm run clean` | ビルド成果物（`_site`）を削除             |
| `npm test`      | ビルド・HTML 検証・コンテンツテストを実行 |

## お知らせ・ブログ（SSR）

hubno（`https://hubno.nonopp.jp`）が配信する既存の公開 JSON を、Cloudflare Workers がリクエスト時に取得して HTML を生成します。

- 一覧: `/news/` `/blog/`
- 詳細: `/news/{slug}/` `/blog/{slug}/`
- sitemap: `/sitemap.xml`

実装は `functions/` 配下の Pages Functions 互換ファイルベースルーティングで、`workers/ssr.js` が Workers + Static Assets 向けに紐づけています。

**hubno で記事を公開・更新するだけで nonopp.jp に反映されます。** コンテンツ変更のためのサイト再デプロイは不要です（JSON は短時間キャッシュします）。

### JSON 仕様（hubno 既存）

`NEWS_INDEX_URL` 例: `https://.../api/public/{token}/news/index.json`

- 一覧: 配列。各要素は `slug`, `title`, `publishedAt`, `url`, `eyecatchUrl`
- 詳細: `{slug}.json`。`version`, `type`, `slug`, `title`, `publishedAt`, `body`, `eyecatchUrl`, `seo.title`, `seo.description`

### 環境変数

| 変数             | 用途                                                 |
| ---------------- | ---------------------------------------------------- |
| `NEWS_INDEX_URL` | ビルド時（トップ抜粋）と Workers 実行時（SSR）       |
| `BLOG_INDEX_URL` | 任意。未設定時は news URL の `/blog/index.json`      |
| `SITE_ORIGIN`    | canonical / sitemap 用（本番は `https://nonopp.jp`） |

Cloudflare ダッシュボード（または `wrangler secret put NEWS_INDEX_URL`）に **実行時** の `NEWS_INDEX_URL` を設定してください。GitHub Actions の build 用 secrets とは別に必要です。

## Cloudflare

- Build command: `npm run build`
- Assets directory: `_site`
- Worker entry: `workers/ssr.js`
- Runtime secret: `NEWS_INDEX_URL`
