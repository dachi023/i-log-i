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

Expo Managed Workflowで iOS/Android/Web をサポート。

### APIクライアント層（`src/api/client.ts`）

バックエンドAPIとの通信を担う薄いfetch wrapper。

- **ベースURL解決**: 開発時は`expo-constants`の`hostUri`からExpo DevServerのホストIPを取得し、ポート8787でローカルAPIに接続。本番は`https://api.i-log-i.app`
- **`request<T>()`関数**: 全リクエストの共通処理（JSON serialize/deserialize、エラーハンドリング、204対応）
- **`ApiError`クラス**: HTTPステータス・エラーコード・メッセージを保持する型付きエラー
- **エンドポイント関数**: `getEntries`, `createEntry`, `updateEntry`, `deleteEntry`, `searchEntries`, `getMe`, `getQuestions`, `getAnswers`, `answerQuestion`, `getProfile`, `getConversations`, `createConversation`, `getMessages`, `sendMessage`

### ストア設計（`src/data/store.ts`）

React Context + useStateベースのグローバルストア。`StoreProvider`で全画面にデータを提供。

**初期化フロー**:
- 起動時に`Promise.all`でAPI一括取得（entries, user, questions, answers, profile, conversations）
- 成功時: 各stateにセット → `isInitializing: false`
- 失敗時: `initError`にメッセージをセット → `_layout.tsx`の`AppGate`が接続エラー画面を表示

**ローディングステート**:
- `isInitializing`: 初期データ取得中
- `isLoadingEntries`: pull-to-refresh / 無限スクロール中
- `isSubmitting`: エントリ作成・回答送信中

**データ更新パターン**:
- **作成（wait-for-server）**: APIレスポンス確定後にstateへ追加
- **更新（optimistic update）**: 即座にUI反映 → API失敗時はサーバーから再取得してrevert
- **削除（optimistic update）**: 即座にUI削除 → API失敗時は削除前データをrevert

**ページネーション**:
- `refreshEntries()`: 先頭から再取得（pull-to-refresh用）
- `loadMoreEntries()`: カーソルベースで次ページ読み込み（無限スクロール用）
- `entriesCursor` / `hasMoreEntries` で状態管理

**派生データ**:
- `setupQuestions`: `category === "setup"`をpriority順にソート
- `todaysDailyQuestion`: 未回答のdaily質問をpriority順で1問選出

### ナビゲーション構成

- **Stack Navigator**（expo-router）をルートに配置
- **GlassBackground**（`ui/GlassBackground.tsx`）: iOS 26+では`expo-glass-effect`の`GlassView`、非対応では`expo-blur`の`BlurView`にフォールバックするラッパー
- **BottomBar**（`ui/BottomBar.tsx`）: 画面下部のフローティングUI用コンテナ。Safe Area下端基準の位置管理と`keyboardAware`オプションによるキーボード追従を共通化。全画面で同じ位置に統一
- **FloatingFab**（`ui/FloatingFab.tsx`）: `BottomBar`を内包する追加ボタンコンポーネント。`GlassView`（iOS 26+）/ `BlurView`（フォールバック）で`colorScheme="light"`の明るいガラスモーフィズム。`FAB_SIZE=52`をexport
- **グローバルNavBar**（`ui/NavBar.tsx`）: `GlassBackground`で半透明、タイトル中央寄せ、右にハンバーガーメニュー。サブページでは左に戻るアイコンを表示。モーダル画面では`modal`propにより右に閉じる（×）ボタンのみ表示
- **グローバルSideMenu**（`ui/SideMenu.tsx`）: 右からアニメーション付きで開閉するDrawer。固定の半透明背景色（`rgba(243,244,246,0.97)`）を使用（`Animated.View`内でのGlassView互換性問題を回避）。全画面からアクセス可能。コンテンツ全体のスワイプ操作でも開閉でき、開いた際はコンテンツ部がDrawer幅分左に押し出される。下部のユーザーボタンはピル型（`borderRadius: 24`）で軽いシャドウによる浮遊感
- **DrawerContext**（`ui/DrawerContext.tsx`）: サイドバーの開閉状態とAnimated.Valueをグローバルに管理。コンテンツのpush-outアニメーションも制御
- **DailyQuestionModal**（`ui/DailyQuestionModal.tsx`）: 認証済み＆オンボーディング完了後に、未回答のdaily質問を1問モーダル表示。回答タイプ（`text`/`select`/`scale`）に応じた入力UIを出し分け。dismissedステートで1セッション1回表示
- **AppGate**（`app/_layout.tsx`内）: `isInitializing`中はローディング表示、`initError`時は接続エラー画面を表示。正常時のみDrawer・SideMenu・DailyQuestionModalを描画

### 画面構成

Drawer内の画面（グローバルナビゲーション）:
1. **日々の記録**（`(drawer)/index.tsx`）: 日付ベースのタイムライン表示。下部に`BottomBar`（`keyboardAware`）でピル型検索バー + 追加FABのフローティングバーを配置
2. **ボット**（`(drawer)/bot.tsx`）: AIボット会話一覧。下部に`FloatingFab`で新規会話作成ボタンを配置
3. **パーソナリティ**（`(drawer)/profile.tsx`）: AIが分析したパーソナリティの閲覧。ヘッダーに最終更新日（バージョン番号ではなく日付）とソースサマリーを表示
- **設定**（`settings.tsx`）はメニューに表示せず、サイドバー下部のユーザーアイコン+名前タップでモーダル遷移

サブページ（Stack遷移）:
- **記録詳細**（`entries/[id].tsx`）: 日付と本文表示 + 編集・削除アクション
- **記録作成**（`entries/create.tsx`）: 本文入力 + 日付選択 + メディア添付（モーダル）
- **記録編集**（`entries/edit.tsx`）: 既存エントリの本文・日付を編集（モーダル）
- **ボット会話**（`bot/[id].tsx`）: チャットUI
- **認証**（`(auth)/login.tsx`）: OAuth ログイン
- **オンボーディング**（`onboarding.tsx`）: 初回セットアップ質問（3問）

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
