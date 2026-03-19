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
- パーソナリティ質問 & 回答
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
記録エントリ。diary/memo/voice_noteの3種。タグはJSON配列として格納。`is_private`で受取人への非公開指定。

#### media
メディアファイルのメタデータ。実体はR2。エントリに紐付け可能。

#### person_tags
人物タグ。エントリに登場する人物を管理。

#### entry_person_tags
エントリと人物タグの多対多関係。

#### questions
パーソナリティ質問マスタ。カテゴリ: setup（初期）/ daily（日常）/ scenario（シナリオ）/ supplemental（補足）。

#### answers
質問への回答。

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
| GET | `/questions/next` | 次の質問取得 |
| POST | `/questions/:id/answer` | 回答送信 |
| POST | `/questions/:id/skip` | 質問スキップ |
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
