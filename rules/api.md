# API 開発ルール

## ルートファイル構成

```
apps/api/src/
├── index.ts              # Honoアプリのエントリポイント
├── types.ts              # AppEnv型定義
├── middleware/            # ミドルウェア（認証等）
├── routes/               # ルートハンドラ（ドメインごとに分割）
│   ├── auth.ts
│   ├── users.ts
│   ├── entries.ts
│   └── ...
├── services/             # ビジネスロジック
├── db/
│   ├── common/migrations/  # COMMON_DB マイグレーション
│   └── user/migrations/    # USER_DB マイグレーション
└── lib/                  # ユーティリティ（ID生成、LLM連携等）
```

## ルートハンドラの実装パターン

```typescript
import { Hono } from "hono";
import type { AppEnv } from "../types";

export const exampleRoutes = new Hono<AppEnv>();

exampleRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const db = c.env.COMMON_DB;

  // 1. 入力バリデーション
  // 2. ビジネスロジック（サービス層に委譲推奨）
  // 3. DB操作
  // 4. レスポンス

  return c.json({ data: result });
});
```

## DB操作

### D1クエリの書き方
```typescript
// SELECT
const result = await db
  .prepare("SELECT * FROM users WHERE id = ?")
  .bind(userId)
  .first<UserRow>();

// INSERT
await db
  .prepare("INSERT INTO users (id, display_name, email) VALUES (?, ?, ?)")
  .bind(id, displayName, email)
  .run();

// UPDATE
await db
  .prepare("UPDATE users SET display_name = ?, updated_at = datetime('now') WHERE id = ?")
  .bind(displayName, userId)
  .run();
```

### 共通DBとユーザーDBの使い分け
- `c.env.COMMON_DB`: ユーザー管理、関係性、トリガー系
- `c.env.USER_DB`: 記録、プロファイル、ボット系
- ルートごとにどちらのDBを使うかは `docs/architecture.md` のルーティング構成を参照

## R2操作

```typescript
// 署名付きURL生成
const bucket = c.env.MEDIA_BUCKET;

// アップロード
await bucket.put(key, body);

// ダウンロード
const object = await bucket.get(key);

// 削除
await bucket.delete(key);
```

## KV操作

```typescript
const kv = c.env.SESSION_KV;

// 保存（TTL付き）
await kv.put(key, value, { expirationTtl: 86400 });

// 取得
const value = await kv.get(key);

// 削除
await kv.delete(key);
```

## 認証ミドルウェア

認証済みルートでは以下のコンテキスト変数が利用可能:
- `c.get("userId")`: ユーザーID
- `c.get("userRole")`: ロール（recorder/receiver/both）
- `c.get("userDbName")`: ユーザーDB名（receiverはnull）

## レスポンス形式

```typescript
// 単一リソース
return c.json({ data: resource });

// 一覧（ページネーション）
return c.json({ data: items, cursor: nextCursor, hasMore: hasMore });

// エラー
return c.json({ error: { code: "NOT_FOUND", message: "Entry not found" } }, 404);

// 成功（ボディなし）
return c.body(null, 204);
```

## マイグレーション

```bash
# ローカル実行
cd apps/api
npx wrangler d1 migrations apply common-db --local
npx wrangler d1 migrations apply user-db --local
```

新しいマイグレーションは連番ファイルで追加:
- `src/db/common/migrations/0002_xxx.sql`
- `src/db/user/migrations/0002_xxx.sql`
