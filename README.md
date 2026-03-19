# i-log-i

あなたの記録と人格を、大切な人へ届けるデジタル遺産アプリケーション。

## 概要

i-log-i は、ユーザーが日々の記録（日記・メモ・ボイスノート）を残し、AIがパーソナリティプロファイルを構築するアプリケーションです。生前は選んだ受取人と記録を共有でき、死後はトリガーシステムによって受取人にデータが開放されます。受取人はAIボットを通じて故人の「人格」と対話できます。

## 主な機能

- **記録**: 日記・メモ・ボイスノートの作成と管理
- **パーソナリティ**: 質問への回答とAIによるプロファイル構築
- **AIボット**: プロファイルに基づく人格模倣会話
- **共有**: 受取人への記録共有と公開範囲管理
- **死後トリガー**: 生存確認 → 第三者確認 → 猶予期間 → データ開放

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| バックエンド | Cloudflare Workers, Hono, D1, R2, KV |
| フロントエンド | React Native, Expo |
| 共有パッケージ | TypeScript types, Validation |
| モノレポ | Bun, Turborepo |
| Lint/Format | Biome |

## セットアップ

```bash
# 依存インストール
bun install

# 開発サーバー起動
bun run dev

# DBマイグレーション（API）
cd apps/api
bunx wrangler d1 migrations apply common-db --local
bunx wrangler d1 migrations apply user-db --local
```

## プロジェクト構成

```
apps/
  api/        # バックエンドAPI（Cloudflare Workers）
  mobile/     # モバイルアプリ（React Native + Expo）
packages/
  types/      # 共有型定義
  validation/ # バリデーション
```

## ドキュメント

- [全体仕様書](docs/spec.md)
- [アーキテクチャ](docs/architecture.md)
- [APIリファレンス](docs/api-reference.md)
- [データベーススキーマ](docs/database-schema.md)
