# nonopp.jp

ノノップのポートフォリオサイト（[Eleventy](https://www.11ty.dev/)）

## ローカル起動

### 必要環境

- Node.js 22 以上
- npm

### 手順

```bash
# 依存関係のインストール
npm ci

# 開発サーバーの起動
npm start
```

ブラウザで [http://localhost:8080](http://localhost:8080) を開いて確認できます。ファイルを保存すると自動で再ビルドされます。

### その他のコマンド

| コマンド        | 説明                                      |
| --------------- | ----------------------------------------- |
| `npm run build` | 本番用に `_site` へビルド                 |
| `npm run clean` | ビルド成果物（`_site`）を削除             |
| `npm test`      | ビルド・HTML 検証・コンテンツテストを実行 |
