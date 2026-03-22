# i-log-i 全体仕様書

## 概要

i-log-i は「デジタル遺産」アプリケーションである。ユーザーが日々の記録（日記・メモ・ボイスノート）を残し、AIがその人のパーソナリティプロファイルを構築する。生前は選んだ受取人と記録を共有でき、死後はトリガーシステムによって受取人にすべてのデータが開放される。受取人はAIボットを通じて故人の「人格」と対話できる。

## コンセプト

- **記録者 (Recorder)**: 日記・メモ・音声を記録し、パーソナリティプロファイルを育てる
- **受取人 (Receiver)**: 記録者から共有された記録を閲覧し、AIボットと対話する
- **第三者 (Trustee)**: 記録者の死後トリガーを発動する信頼された人物
- **AIボット**: 記録とプロファイルに基づき、記録者の人格を模倣して会話する

## ユーザーロール

| ロール | 説明 |
|--------|------|
| `recorder` | 記録のみ行う（デフォルト） |
| `receiver` | 他者の記録を受け取るのみ |
| `both` | 記録と受取の両方 |

## ユーザーステータス

| ステータス | 説明 |
|------------|------|
| `active` | 通常状態 |
| `triggered` | 死後トリガー発動済み |
| `deleted` | 論理削除 |

## フェーズ構成

### Phase 1: 基盤（MVP）
- OAuth認証（Google / Apple）
- ユーザー管理・セットアップ
- 記録の CRUD（entries, media, person-tags）
- パーソナリティ質問 & 回答（デイリー質問含む）
- プロファイル生成（LLM連携）
- AIボット会話（自分用）

### Phase 2: 共有・遺言
- 受取人の招待・管理
- 公開範囲設定（スコープ）
- 生前共有機能
- 受取人側のエントリ閲覧
- 受取人用AIボット会話

### Phase 3: 死後トリガー
- 第三者（Trustee）の管理
- 生存確認（Life Check）システム
- トリガー状態遷移（standby → escalated → grace_period → triggered）
- 通知システム（プッシュ通知）

## 技術スタック

### バックエンド（`apps/api`）
- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Hono
- **データベース**: Cloudflare D1（SQLite）
  - `COMMON_DB`: ユーザー・認証・関係性・トリガー（全ユーザー共通）
  - `USER_DB`: 記録・パーソナリティ・ボット（ユーザーごと）
- **ストレージ**: Cloudflare R2（メディアファイル）
- **キャッシュ/セッション**: Cloudflare KV（`SESSION_KV`）
- **認証**: JWT（Access Token + Refresh Token）
- **AI/LLM**: 外部LLM API（抽象化済み）

### フロントエンド（`apps/mobile`）
- **フレームワーク**: React Native + Expo
- **プラットフォーム**: iOS / Android / Web
- **ナビゲーション**: サイドメニュー（Drawer）方式。タブバーは使用しない
- **APIクライアント**: `src/api/client.ts` — fetch wrapperで全エンドポイントをカバー。開発時は`expo-constants`のhostUriからdev machineのIPを動的取得しローカルAPI（port 8787）に接続
- **状態管理**: `src/data/store.ts` — React Context + useStateベースのストア。起動時にAPI一括取得（entries, user, questions, answers, profile, conversations）。エラー時は`initError`で接続エラー画面を表示

#### モバイルUIデザイン方針

##### ナビゲーション
- **ハンバーガーメニュー**: 右上に配置
- **ナビゲーションバー**: 半透明（BlurView blur効果）を適用。コンテンツがバーの下をスクロールする際に奥行きを感じさせる
- **サイドメニュー**: 右からスライドで表示。固定の半透明背景（`rgba(243,244,246,0.97)`）を使用。コンテンツ全体のスワイプ操作でも開閉可能。開いた際はコンテンツ部がDrawer幅分左に押し出される
- **サイドメニュー項目**: 日々の記録、ボット、パーソナリティの3項目。設定はメニューに含めず、下部のユーザーアイコン+名前のピル型ボタン（`borderRadius: 24`, 軽いシャドウで浮遊感）タップで遷移
- **ユーザーアイコン**: DiceBear API（`glass`テーマ）でランダム生成
- **タイトル表示**: ナビゲーションバーにページタイトルを表示するため、各ページ内に見出し（h1相当）を重複して配置しない
- **サブページ遷移**: `fullScreenGestureEnabled`により、画面全体のスワイプで戻る操作が可能

##### 日々の記録（一覧）
- このアプリの記録は「ただの日記」ではない。自身をAIに投影するための記録であり、死後に残された人へAIを通して伝えることが目的である
- **日付が主役**: 「何を記録したか」ではなく「いつ記録したか」を重視する。日付と本文のみで構成し、タイトルフィールドは使わない
- **表示形式**: カード型の日記UIではなく、日付を軸としたタイムライン表示。記録の種類アイコンやタグ表示などの装飾は排除し、シンプルに日付と記録内容だけを見せる
- **記録の内容**: 大げさな自己語りではなく、今日あったことを簡潔にまとめる日常の記録。例: 「今日は子供の10歳の誕生日だった。チョコレートケーキをみんなで食べた。」
- **フローティングバー**: 画面下部（Safe Area直上）にピル型の検索バー + 円形の追加FAB（52px）を横並びで配置。iOS 26+では`GlassContainer`でグループ化しLiquid Glass（`colorScheme="light"`）を適用、非対応環境では`BlurView`（`systemChromeMaterialLight`）にフォールバック。テキスト・アイコンはテーマカラー（`textSecondary`, `primaryDark`）で背景に馴染む明るいトーン
- **検索バー**: プレースホルダー「あなたの記録から検索する」を左寄せで表示。本文のインクリメンタルサーチが可能。入力中はキーボード上部に`InputAccessoryView`で`↓`ボタンを表示し、キーボードを閉じられる
- **BottomBarコンテナ**: フローティングバー・FABの位置管理は`BottomBar`コンポーネント（`ui/BottomBar.tsx`）で共通化。Safe Area下端を基準に配置し、`keyboardAware`オプションでキーボード追従にも対応。全画面で同じ位置に統一

##### 記録詳細
- **表示内容**: 日付（年月日+曜日）と本文のフルテキスト
- **編集ボタン**: 日付の右にペンアイコンを配置。タップで編集画面（モーダル）に遷移
- **削除ボタン**: 編集ボタンの隣にゴミ箱アイコンを配置。タップで確認ダイアログ表示後に削除

##### 記録作成
- **入力項目**: 本文（`body`）と記録日時（`recordedAt`）のみ
- **日付選択**: カレンダーアイコン + 左右矢印で日付を変更可能。未来の日付は選択不可。過去の記録を後から追加するケースに対応
- **メディア添付時の種別判定**: サーバー側でメディアの有無から自動判定する
- **メディア添付**: 写真・動画・音声のアップロードボタンを配置（R2署名付きURL経由）

##### 記録編集
- **モーダル表示**: 記録詳細画面の編集ボタンからモーダルで遷移
- **入力項目**: 本文と日付（作成画面と同じUI）。既存の値がプリセットされる
- **保存**: 変更がある場合のみ保存ボタンが有効化

##### ボット（会話一覧）
- フラットなリスト表示。「進行中」「終了」のセクション見出しで会話を分類
- 各行は最後のメッセージのプレビュー（2行）+ シェブロンアイコンのみ。日付・メッセージ数・ステータスバッジは表示しない
- 右下に`FloatingFab`（`ui/FloatingFab.tsx`）で新規会話作成ボタンを配置。タップで新しい会話を作成し会話画面に遷移

##### パーソナリティ（プロファイル閲覧）
- ヘッダー部に「最終更新: YYYY年M月D日」とソースサマリー（生成に使ったデータの概要）を表示。バージョン番号は表示しない
- 「再生成」ボタンでプロファイルの再生成をリクエスト可能
- 各セクション（話し方・価値観・性格・ユーモア・感情パターン・人間関係・ライフストーリー）をカード形式で表示。各カードに信頼度バーを付与

##### デイリー質問（パーソナリティ収集）
- 認証済み＆オンボーディング完了後のみ、モーダルで未回答のdaily質問を1問表示する
- モーダルは1セッション1回表示。dismissedステートで再表示を抑制
- **スキップ不可**。回答するまでモーダルは閉じられない
- 質問の出題順は`questions.priority`に従う
- **回答タイプ**: 質問ごとに`answerType`フィールドで入力UIを切り替える
  - `text`: 自由テキスト入力（複数行）
  - `select`: 選択肢ボタンのリスト。タップで1つ選択、選択済みはハイライト表示
  - `scale`: 円形の数値ボタン（`scaleMin`〜`scaleMax`）を横並び表示。上下にラベル（`scaleLabels`）を表示

##### 共通デザイン原則
- **リキッドガラス**: iOS 26+では`expo-glass-effect`の`GlassView`/`GlassContainer`でネイティブLiquid Glassを適用。非対応環境では`expo-blur`の`BlurView`にフォールバック。`GlassBackground`ラッパーコンポーネントで切り替えを抽象化
- **適用箇所**: ナビゲーションバー（`GlassBackground`）、フローティングバー・FAB（`GlassView` `colorScheme="light"`で背景に馴染む明るいトーン）
- **サイドメニュー**: Liquid Glass/BlurViewではなく固定の半透明背景色を使用（`Animated.View`内でのGlassView互換性問題を回避）
- **共通コンポーネント**: `BottomBar`（画面下部の位置管理）、`FloatingFab`（追加ボタン）はUI共通パーツとして全画面で再利用
- サイドメニューの「i-log-i」ロゴフォント（細字・レタースペーシング広め）を維持
- 過度な装飾を避け、記録の内容そのものに集中できるUIを目指す
- 「遺す」という行為の静かな重みを感じさせる、落ち着いたトーン

### 共有パッケージ
- `@i-log-i/types`: TypeScript型定義
- `@i-log-i/validation`: バリデーション定数・関数

### 開発ツール
- **パッケージマネージャ**: Bun
- **モノレポ管理**: Turborepo
- **Lint/Format**: Biome

## 認証フロー

1. クライアントがOAuthプロバイダ（Google/Apple）で認証
2. `POST /auth/oauth/{provider}` にトークンを送信
3. サーバーがプロバイダでトークン検証 → ユーザー作成 or 取得
4. JWT Access Token（短期）+ Refresh Token（長期）を発行
5. Refresh TokenはKVに保存しローテーション管理
6. `POST /auth/refresh` でトークン更新
7. `DELETE /auth/logout` でKV上のRefresh Token無効化

### JWTペイロード
- `userId`: ユーザーID
- `userRole`: ロール
- `userDbName`: ユーザー個別DBの名前

## データモデル

### 共通DB（COMMON_DB）

#### users
ユーザーアカウント。`role`でrecorder/receiver/bothを管理。`user_db_name`はrecorderのみ持つ。

#### auth_providers
OAuthプロバイダとの紐付け。1ユーザーに複数プロバイダ可能。

#### recipients
受取人関係。`owner_id`（記録者）→ `recipient_user_id`（受取人）の方向。招待 → 承諾/拒否のフロー。

#### recipient_permissions
受取人ごとの公開範囲。`scope_type`で全公開/タグベース/日付範囲/手動選択を制御。`allow_bot`でAIボットアクセス可否。

#### living_shares
生前に記録者が受取人に共有したコンテンツ。メッセージ/エントリ/メディアの3種。

#### trustees
第三者。記録者の死後にトリガーを発動する権限を持つ。

#### triggers
死後トリガーの状態管理。状態遷移:
```
standby → escalated_to_trustees → escalated_to_recipients → grace_period → triggered
                                                                         → cancelled
```

#### life_check_settings
生存確認の設定。確認間隔、最大未応答回数、第三者待機期間。

#### life_checks
生存確認の送信・応答ログ。

#### device_tokens
プッシュ通知用のデバイストークン。

### ユーザーDB（USER_DB）

#### entries
記録エントリ。`body`（本文）と`recorded_at`（記録日時）を持つ。

#### media
メディアファイルのメタデータ。実体はR2。エントリに紐付け可能。

#### person_tags
人物タグ。エントリに登場する人物を管理。

#### entry_person_tags
エントリと人物タグの多対多関係。

#### questions
パーソナリティ質問マスタ。カテゴリ: setup（初期）/ daily（日常）/ scenario（シナリオ）/ supplemental（補足）。

#### answers
質問への回答。`answered_at`でその日既に回答済みかを判定する。

#### profiles
LLMが生成したパーソナリティプロファイル。バージョン管理あり。各フィールド（speech_style, values, personality_traits, humor_style, emotional_patterns, relationships, life_story）はJSON。

#### profile_overrides
ユーザーによるプロファイルの手動修正。`field_path`で対象フィールドを指定。

#### bot_conversations
AIボットとの会話セッション。`participant`で自分用(`self`)か受取人用(`recipient:{id}`)かを区別。

#### bot_messages
会話内の個別メッセージ。`profile_version`でどのバージョンのプロファイルを使ったか記録。

#### bot_feedback
AIの応答に対するユーザー評価（1-3）と修正テキスト。

## APIエンドポイント一覧

### 認証 (`/auth`)
| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/auth/oauth/google` | Google OAuth認証 |
| POST | `/auth/oauth/apple` | Apple OAuth認証 |
| POST | `/auth/refresh` | トークンリフレッシュ |
| DELETE | `/auth/logout` | ログアウト |

### ユーザー (`/users`)
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/users/me` | 自分の情報取得 |
| PATCH | `/users/me` | 自分の情報更新 |
| POST | `/users/me/setup` | 初期セットアップ |
| POST | `/users/me/upgrade-to-recorder` | receiverからrecorderへ昇格 |
| DELETE | `/users/me` | アカウント削除（論理削除） |
| GET | `/users/search?email={email}` | メールでユーザー検索 |

### 記録 (`/entries`)
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/entries` | エントリ一覧（カーソルページネーション） |
| GET | `/entries/:id` | エントリ詳細 |
| POST | `/entries` | エントリ作成 |
| PATCH | `/entries/:id` | エントリ更新 |
| DELETE | `/entries/:id` | エントリ削除 |
| GET | `/entries/search?q={query}` | エントリ全文検索 |

### メディア (`/media`)
| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/media/upload-url` | R2署名付きアップロードURL取得 |
| POST | `/media` | メディアレコード作成 |
| GET | `/media/:id` | メディア情報取得 |
| GET | `/media/:id/download-url` | R2署名付きダウンロードURL取得 |
| DELETE | `/media/:id` | メディア削除 |

### 人物タグ (`/person-tags`)
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/person-tags` | タグ一覧 |
| POST | `/person-tags` | タグ作成 |
| PATCH | `/person-tags/:id` | タグ更新 |
| DELETE | `/person-tags/:id` | タグ削除 |

### パーソナリティ質問 (`/questions`)
| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/questions/:id/answer` | 回答送信 |
| GET | `/questions/answers` | 回答一覧 |

### プロファイル (`/profile`)
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/profile` | 現在のプロファイル取得 |
| GET | `/profile/versions` | バージョン一覧 |
| GET | `/profile/versions/:version` | 特定バージョン取得 |
| POST | `/profile/regenerate` | プロファイル再生成（LLM） |
| GET | `/profile/overrides` | オーバーライド一覧 |
| PUT | `/profile/overrides/:fieldPath` | オーバーライド設定 |
| DELETE | `/profile/overrides/:fieldPath` | オーバーライド削除 |

### AIボット (`/bot`)
| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/bot/conversations` | 会話セッション作成 |
| GET | `/bot/conversations` | 会話一覧 |
| GET | `/bot/conversations/:id/messages` | メッセージ一覧 |
| POST | `/bot/conversations/:id/messages` | メッセージ送信 |
| POST | `/bot/messages/:id/feedback` | 応答へのフィードバック |

### 受取人管理 (`/recipients`)
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/recipients` | 受取人一覧 |
| POST | `/recipients` | 受取人招待 |
| GET | `/recipients/:id` | 受取人詳細 |
| PATCH | `/recipients/:id` | 受取人情報更新 |
| DELETE | `/recipients/:id` | 受取人削除 |
| POST | `/recipients/:id/permissions` | 公開範囲設定 |
| PATCH | `/recipients/:id/permissions` | 公開範囲更新 |
| POST | `/recipients/:id/share` | コンテンツ共有 |
| GET | `/recipients/:id/shares` | 共有済み一覧 |

### 受信側 (`/received`)
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/received` | 受信一覧 |
| POST | `/received/:recipientId/accept` | 招待承諾 |
| POST | `/received/:recipientId/decline` | 招待拒否 |
| GET | `/received/:recipientId/shares` | 共有コンテンツ一覧 |
| GET | `/received/:recipientId/entries` | 公開エントリ一覧 |
| GET | `/received/:recipientId/entries/:id` | 公開エントリ詳細 |
| POST | `/received/:recipientId/bot/conversations` | ボット会話開始 |
| POST | `/received/:recipientId/bot/conversations/:id/messages` | ボットメッセージ送信 |

### 第三者 (`/trustees`)
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/trustees` | 第三者一覧 |
| POST | `/trustees` | 第三者追加 |
| DELETE | `/trustees/:id` | 第三者削除 |
| GET | `/trustees/duties` | 自分が引き受けた第三者義務一覧 |
| POST | `/trustees/duties/:id/accept` | 義務承諾 |
| POST | `/trustees/duties/:id/decline` | 義務拒否 |
| POST | `/trustees/duties/:id/trigger` | トリガー発動 |

### トリガー (`/trigger`)
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/trigger` | トリガー状態取得 |
| POST | `/trigger/cancel` | トリガーキャンセル |

### 生存確認 (`/life-check`)
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/life-check/settings` | 設定取得 |
| PATCH | `/life-check/settings` | 設定更新 |
| POST | `/life-check/respond` | 生存応答 |
| GET | `/life-check/history` | 確認履歴 |

### 通知 (`/notifications`)
| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/notifications/register-device` | デバイス登録 |
| DELETE | `/notifications/unregister-device` | デバイス解除 |
| GET | `/notifications` | 通知一覧 |
| PATCH | `/notifications/:id/read` | 既読マーク |

## API共通仕様

### 認証
- Bearer Token（JWT）をAuthorizationヘッダに含める
- `/auth/*` と `/health` 以外は認証必須

### ページネーション
- カーソルベースページネーション
- レスポンス: `{ data: T[], cursor: string | null, hasMore: boolean }`
- デフォルト20件、最大100件

### エラーレスポンス
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### ID生成
- ULID形式（26文字英数字、ソート可能）

## バリデーション定数

| 項目 | 上限 |
|------|------|
| エントリタイトル | 200文字 |
| エントリ本文 | 50,000文字 |
| 回答テキスト | 10,000文字 |
| メッセージ | 5,000文字 |
| タグ文字数 | 50文字 |
| エントリあたりタグ数 | 20個 |
| 人物タグ名 | 100文字 |
| 表示名 | 100文字 |
| 関係性テキスト | 50文字 |
| 画像アップロード | 10MB |
| 動画アップロード | 100MB |
| 音声アップロード | 50MB |

## トリガー状態遷移

```
standby
  ↓ (生存確認の未応答が閾値超過)
escalated_to_trustees
  ↓ (第三者の待機期間経過 or 第三者がトリガー発動)
escalated_to_recipients
  ↓ (受取人への通知)
grace_period
  ↓ (猶予期間経過)          ↓ (本人がキャンセル)
triggered                  cancelled
```

## 生存確認フロー

1. `check_interval_days` ごとにプッシュ通知 + メール送信
2. ユーザーが `POST /life-check/respond` で応答
3. `max_missed_checks` 回連続未応答 → トリガーを `escalated_to_trustees` へ
4. 第三者に通知 → `trustee_wait_days` 待機
5. 第三者が `POST /trustees/duties/:id/trigger` で確認 or 期間経過 → エスカレーション継続
6. 猶予期間（`grace_period_days`）→ 最終確認
7. 猶予期間経過 → `triggered`（全受取人にデータ開放）
