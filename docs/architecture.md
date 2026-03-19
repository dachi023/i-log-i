# アーキテクチャ

## モノレポ構成

```
i-log-i/
├── apps/
│   ├── api/          # Cloudflare Workers API（Hono）
│   └── mobile/       # React Native + Expo
├── packages/
│   ├── types/        # @i-log-i/types - 共有型定義
│   └── validation/   # @i-log-i/validation - バリデーション
├── docs/             # 仕様・設計ドキュメント
└── rules/            # Claude Code用ルールファイル
```

## バックエンド アーキテクチャ

### ランタイム: Cloudflare Workers

エッジコンピューティング環境で動作。Node.js APIの一部は使用不可（`fs`, `net`等）。代わりにCloudflareのバインディングを通じてD1, R2, KVにアクセス。

### フレームワーク: Hono

軽量Webフレームワーク。`AppEnv`型でBindingsとVariablesを型安全に管理。

```typescript
type AppEnv = {
  Bindings: {
    COMMON_DB: D1Database;
    USER_DB: D1Database;
    MEDIA_BUCKET: R2Bucket;
    SESSION_KV: KVNamespace;
    JWT_SECRET: string;
    ENVIRONMENT: string;
  };
  Variables: {
    userId: string;
    userRole: string;
    userDbName: string | null;
  };
};
```

### データベース戦略: Dual D1

**COMMON_DB（共通DB）** — 全ユーザー共有のデータ:
- ユーザーアカウント、認証プロバイダ
- 受取人関係、公開範囲設定
- 第三者関係
- トリガー、生存確認
- デバイストークン

**USER_DB（ユーザーDB）** — ユーザーごとのプライベートデータ:
- エントリ（日記・メモ・音声メモ）
- メディアメタデータ
- 人物タグ
- パーソナリティ質問・回答
- プロファイル
- AIボット会話

> 注: 現在のwrangler.tomlでは1つのUSER_DBバインディングだが、将来的にはユーザーごとに異なるD1インスタンスにルーティングする設計を想定。`userDbName`フィールドがそのためのキー。

### ストレージ: R2

メディアファイル（画像・動画・音声）の実体を保管。APIは署名付きURLを発行し、クライアントが直接R2にアップロード/ダウンロード。

### セッション管理: KV

Refresh Tokenの保管と無効化に使用。TTL付きで自動期限切れ。

## 認証アーキテクチャ

### JWT構成
- **Access Token**: 短期有効（15-30分想定）。リクエストごとに検証
- **Refresh Token**: 長期有効。KVに保存。ローテーション方式

### ミドルウェア
認証ミドルウェアがJWTを検証し、`c.set("userId", ...)` でコンテキストに注入。`/auth/*`と`/health`は認証不要。

## ルーティング構成

```
/health              → ヘルスチェック（認証不要）
/auth/*              → 認証（認証不要）
/users/*             → ユーザー管理（COMMON_DB）
/entries/*           → 記録（USER_DB）
/media/*             → メディア（USER_DB + R2）
/person-tags/*       → 人物タグ（USER_DB）
/questions/*         → パーソナリティ質問（USER_DB）
/profile/*           → プロファイル（USER_DB + LLM）
/bot/*               → AIボット（USER_DB + LLM）
/recipients/*        → 受取人管理（COMMON_DB）
/received/*          → 受信側操作（COMMON_DB + 他ユーザーのUSER_DB）
/trustees/*          → 第三者管理（COMMON_DB）
/trigger/*           → トリガー（COMMON_DB）
/life-check/*        → 生存確認（COMMON_DB）
/notifications/*     → 通知（COMMON_DB）
```

## フロントエンド アーキテクチャ

### React Native + Expo

Expo Managed Workflowで iOS/Android/Web をサポート。現在は初期スキャフォールドのみ。

### 想定する画面構成

1. **認証画面**: OAuth（Google/Apple）ログイン
2. **ホーム/ダッシュボード**: 記録一覧、クイック記録
3. **記録画面**: エントリ作成・編集（日記/メモ/音声）
4. **質問画面**: パーソナリティ質問への回答
5. **プロファイル画面**: AIプロファイルの閲覧・修正
6. **ボット画面**: AIとの会話
7. **受取人管理画面**: 招待・公開範囲設定
8. **受信画面**: 共有されたコンテンツの閲覧
9. **設定画面**: 生存確認設定、第三者管理、アカウント

## LLM統合

### 抽象化レイヤー

```typescript
interface GenerateTextParams {
  systemPrompt: string;
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
}

interface GenerateTextResult {
  text: string;
  usage: { inputTokens: number; outputTokens: number };
}
```

### 用途
1. **プロファイル生成**: 質問回答 + エントリからパーソナリティを抽出
2. **AIボット会話**: プロファイル + 記録を参照し、記録者の人格で応答
3. **エントリ要約**: （将来）記録の要約生成

## ID生成方針

全エンティティのIDにULID（Universally Unique Lexicographically Sortable Identifier）を使用。26文字英数字。タイムスタンプ順にソート可能。
