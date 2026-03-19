# コーディングルール

## 言語・フォーマット

- TypeScript strict モード必須
- フォーマッター/リンターは Biome を使用
- インデント: スペース2つ
- 引用符: ダブルクォート
- セミコロン: 常に付ける
- 行幅上限: 100文字
- importの自動整理: 有効

```bash
# lint チェック
bun run lint

# 自動修正 + フォーマット
bun run lint:fix
```

## 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| 変数・関数 | camelCase | `getUserById`, `isValid` |
| 型・インターフェース | PascalCase | `User`, `AppEnv`, `EntryType` |
| 定数 | UPPER_SNAKE_CASE | `LIMITS`, `PAGE_SIZE_MAX` |
| ファイル名 | kebab-case | `life-checks.ts`, `person-tags.ts` |
| DBカラム | snake_case | `created_at`, `user_db_name` |
| APIパス | kebab-case | `/person-tags`, `/life-check` |

## ID生成

- 全エンティティのIDにULID（26文字英数字）を使用
- タイムスタンプ順ソート可能
- `isValidUlid()` で検証可能（`@i-log-i/validation`）

## エラーハンドリング

- APIエラーは `ApiError` 型に準拠
- HTTPステータスコードを適切に使い分ける
  - 400: バリデーションエラー
  - 401: 認証エラー
  - 403: 権限エラー
  - 404: リソース不在
  - 409: 競合（重複など）
  - 500: サーバーエラー

## バリデーション

- `@i-log-i/validation` パッケージの `LIMITS` 定数を参照
- 入力値は各エンドポイントのハンドラ冒頭で検証
- バリデーション関数は validation パッケージに集約

## 型定義

- 共有型は `@i-log-i/types` に定義
- API固有の型（リクエスト/レスポンス）は `apps/api` 内に定義
- モバイル固有の型は `apps/mobile` 内に定義
- D1のクエリ結果は明示的に型付け

## Cloudflare Workers 固有

- Node.js の `fs`, `net`, `crypto`（一部）等は使用不可
- `Web Crypto API` を使用
- 環境変数は `Bindings` 経由でアクセス（`c.env.COMMON_DB` 等）
- コンテキスト変数は `Variables` 経由（`c.get("userId")` 等）

## テスト

- テストフレームワーク: TBD（vitest推奨）
- ユニットテストは各モジュールと同階層に `.test.ts` で配置
- D1のテストは `miniflare` のローカルD1を使用
