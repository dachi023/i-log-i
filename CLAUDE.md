# i-log-i

デジタル遺産アプリケーション。ユーザーの記録・パーソナリティをAIで保存し、死後に受取人へ届ける。

## プロジェクト概要

- **バックエンド**: Cloudflare Workers + Hono + D1 + R2 + KV (`apps/api`)
- **モバイル**: React Native + Expo (`apps/mobile`)
- **共有パッケージ**: `@i-log-i/types`, `@i-log-i/validation` (`packages/`)
- **モノレポ管理**: Bun + Turborepo
- **Lint/Format**: Biome

## コマンド

```bash
bun install              # 依存インストール
bun run dev              # 全アプリ開発サーバー起動
bun run build            # 全アプリビルド
bun run lint             # Biome lint チェック
bun run lint:fix         # Biome lint 自動修正 + フォーマット
bun run typecheck        # TypeScript 型チェック
```

### API固有

```bash
cd apps/api
npx wrangler dev                                    # APIローカル起動
npx wrangler d1 migrations apply common-db --local  # 共通DBマイグレーション
npx wrangler d1 migrations apply user-db --local    # ユーザーDBマイグレーション
```

## ルール

以下のルールファイルを遵守すること:

- **[rules/coding.md](rules/coding.md)** — コーディング規約（命名、フォーマット、型、エラーハンドリング）
- **[rules/git.md](rules/git.md)** — ブランチ戦略、コミットメッセージ規約
- **[rules/api.md](rules/api.md)** — API開発パターン（ルート構成、DB操作、レスポンス形式）

## 仕様ドキュメント

実装時は以下のドキュメントを参照:

- **[docs/spec.md](docs/spec.md)** — 全体仕様書（フェーズ構成、認証フロー、データモデル、全APIエンドポイント一覧）
- **[docs/architecture.md](docs/architecture.md)** — アーキテクチャ詳細（モノレポ構成、Dual DB戦略、認証設計、LLM統合）
- **[docs/api-reference.md](docs/api-reference.md)** — APIリファレンス（全エンドポイントのリクエスト/レスポンス例）
- **[docs/database-schema.md](docs/database-schema.md)** — データベーススキーマ（全テーブル定義、インデックス）

## ディレクトリ構成

```
apps/
  api/                    # Cloudflare Workers API
    src/
      index.ts            # Honoエントリポイント
      types.ts            # AppEnv型
      routes/             # ルートハンドラ（ドメインごと）
      db/common/          # 共通DBマイグレーション
      db/user/            # ユーザーDBマイグレーション
    wrangler.toml         # Cloudflare設定
  mobile/                 # React Native + Expo
packages/
  types/                  # @i-log-i/types（共有型定義）
  validation/             # @i-log-i/validation（バリデーション）
docs/                     # 仕様・設計ドキュメント
rules/                    # 開発ルール
```

## 実装上の注意

- 全IDはULID形式（`@i-log-i/validation` の `isValidUlid()` で検証）
- DBは2つ: `COMMON_DB`（全ユーザー共有）と `USER_DB`（ユーザーごと）
- メディアファイルはR2に保存、署名付きURLでアクセス
- Refresh TokenはKVで管理（ローテーション方式）
- `/auth/*` と `/health` 以外は JWT認証必須
- ページネーションはカーソルベース（デフォルト20件、最大100件）
- Workers環境のためNode.js APIの一部は使用不可（Web APIを使用）
