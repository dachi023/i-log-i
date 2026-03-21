# API リファレンス

## 共通仕様

### ベースURL
- ローカル: `http://localhost:8787`
- 本番: TBD

### 認証
`/auth/*` と `/health` 以外の全エンドポイントは Bearer Token（JWT）が必要。

```
Authorization: Bearer <access_token>
```

### レスポンス形式

**成功時:**
```json
{ "data": { ... } }
```

**一覧（ページネーション）:**
```json
{
  "data": [...],
  "cursor": "next_cursor_value",
  "hasMore": true
}
```

**エラー:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Body exceeds maximum length",
    "details": { "field": "body", "max": 10000 }
  }
}
```

### ページネーション
カーソルベース。クエリパラメータ:
- `cursor`: 前回レスポンスの`cursor`値
- `limit`: 取得件数（デフォルト20、最大100）

---

## 認証 `/auth`

### `POST /auth/oauth/google`
Google OAuthトークンを検証し、JWT を発行。

**Request Body:**
```json
{
  "idToken": "google_id_token",
  "displayName": "表示名"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "jwt_access_token",
  "refreshToken": "refresh_token",
  "user": { ... }
}
```

### `POST /auth/oauth/apple`
Apple Sign Inトークンを検証し、JWT を発行。

**Request Body:**
```json
{
  "identityToken": "apple_identity_token",
  "displayName": "表示名"
}
```

### `POST /auth/refresh`
Refresh Tokenを使ってAccess Tokenを再発行。Refresh Tokenもローテーション。

**Request Body:**
```json
{
  "refreshToken": "current_refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "new_jwt_access_token",
  "refreshToken": "new_refresh_token"
}
```

### `DELETE /auth/logout`
Refresh TokenをKVから削除。認証必要。

---

## ユーザー `/users`

### `GET /users/me`
現在のユーザー情報を取得。

### `PATCH /users/me`
ユーザー情報を更新。

**Request Body:**
```json
{
  "displayName": "新しい表示名"
}
```

### `POST /users/me/setup`
初回ログイン後のセットアップ。ユーザーDBの作成、初期質問のシードなど。

### `POST /users/me/upgrade-to-recorder`
`receiver`ロールのユーザーを`both`に昇格。ユーザーDBを新規作成。

### `DELETE /users/me`
アカウントの論理削除。`status`を`deleted`に変更。

### `GET /users/search?email={email}`
メールアドレスでユーザーを検索。受取人・第三者の招待時に使用。

---

## 記録 `/entries`

### `GET /entries`
エントリ一覧。カーソルページネーション。

**Query Parameters:**
- `cursor`, `limit`

### `GET /entries/:id`
エントリ詳細。紐付くメディアと人物タグも含む。

### `POST /entries`
エントリ作成。

**Request Body:**
```json
{
  "body": "本文...",
  "recordedAt": "2025-03-01T10:00:00Z"
}
```

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `body` | Yes | 記録本文 |
| `recordedAt` | Yes | 記録日時（ISO 8601） |

### `PATCH /entries/:id`
エントリ更新。送信フィールドのみ更新。

### `DELETE /entries/:id`
エントリ削除。紐付くメディアも削除（R2含む）。

### `GET /entries/search?q={query}`
エントリの全文検索。タイトル・本文・タグを対象。

---

## メディア `/media`

### `POST /media/upload-url`
R2へのダイレクトアップロード用の署名付きURLを取得。

**Request Body:**
```json
{
  "mediaType": "image",
  "mimeType": "image/jpeg",
  "fileSize": 1048576
}
```

**Response:**
```json
{
  "uploadUrl": "https://r2-signed-url...",
  "r2Key": "users/{userId}/media/{ulid}.jpg"
}
```

### `POST /media`
アップロード完了後にメディアレコードを作成。

**Request Body:**
```json
{
  "entryId": "entry_ulid",
  "mediaType": "image",
  "r2Key": "users/{userId}/media/{ulid}.jpg",
  "fileName": "photo.jpg",
  "fileSize": 1048576,
  "mimeType": "image/jpeg",
  "caption": "キャプション"
}
```

### `GET /media/:id`
メディア情報取得。

### `GET /media/:id/download-url`
署名付きダウンロードURL取得。

### `DELETE /media/:id`
メディア削除（D1レコード + R2オブジェクト）。

---

## 人物タグ `/person-tags`

### `GET /person-tags`
人物タグ一覧。

### `POST /person-tags`
人物タグ作成。

**Request Body:**
```json
{
  "name": "田中太郎",
  "relationship": "友人",
  "notes": "大学時代の友人"
}
```

### `PATCH /person-tags/:id`
人物タグ更新。

### `DELETE /person-tags/:id`
人物タグ削除。エントリとの紐付けも解除。

---

## パーソナリティ質問 `/questions`

### `POST /questions/:id/answer`
質問に回答。

**Request Body:**
```json
{
  "answerText": "回答テキスト..."
}
```

### `GET /questions/answers`
自分の回答一覧。

---

## プロファイル `/profile`

### `GET /profile`
最新バージョンのプロファイルを取得。オーバーライド適用済み。

### `GET /profile/versions`
プロファイルのバージョン一覧。

### `GET /profile/versions/:version`
特定バージョンのプロファイルを取得。

### `POST /profile/regenerate`
LLMを使ってプロファイルを再生成。質問回答とエントリを入力として使用。新バージョンとして保存。

### `GET /profile/overrides`
オーバーライド一覧。

### `PUT /profile/overrides/:fieldPath`
プロファイルフィールドのオーバーライドを設定/更新。

**Request Body:**
```json
{
  "overrideValue": "修正値",
  "reason": "AIの推測が異なるため"
}
```

### `DELETE /profile/overrides/:fieldPath`
オーバーライドを削除。

---

## AIボット `/bot`

### `POST /bot/conversations`
新しい会話セッションを開始。

**Request Body:**
```json
{
  "participant": "self"
}
```

### `GET /bot/conversations`
会話セッション一覧。

### `GET /bot/conversations/:id/messages`
会話のメッセージ一覧。

### `POST /bot/conversations/:id/messages`
メッセージを送信し、AIの応答を受け取る。

**Request Body:**
```json
{
  "content": "メッセージテキスト"
}
```

**Response:**
```json
{
  "userMessage": { ... },
  "assistantMessage": { ... }
}
```

### `POST /bot/messages/:id/feedback`
AI応答へのフィードバック。

**Request Body:**
```json
{
  "rating": 2,
  "correction": "もっとカジュアルに話すと思う"
}
```

---

## 受取人管理 `/recipients`

### `GET /recipients`
自分が設定した受取人一覧。

### `POST /recipients`
受取人を招待。

**Request Body:**
```json
{
  "recipientUserId": "user_ulid",
  "relationship": "妻",
  "message": "私の記録を共有します"
}
```

### `GET /recipients/:id`
受取人詳細（権限設定含む）。

### `PATCH /recipients/:id`
受取人情報の更新。

### `DELETE /recipients/:id`
受取人を削除。

### `POST /recipients/:id/permissions`
公開範囲を設定。

**Request Body:**
```json
{
  "scopeType": "tag_based",
  "scopeValue": { "tags": ["家族", "日常"] },
  "allowBot": true
}
```

### `PATCH /recipients/:id/permissions`
公開範囲を更新。

### `POST /recipients/:id/share`
受取人にコンテンツを共有。

**Request Body:**
```json
{
  "shareType": "entry",
  "referenceId": "entry_ulid"
}
```

### `GET /recipients/:id/shares`
受取人に共有済みのコンテンツ一覧。

---

## 受信側 `/received`

### `GET /received`
自分宛の招待一覧。

### `POST /received/:recipientId/accept`
招待を承諾。

### `POST /received/:recipientId/decline`
招待を拒否。

### `GET /received/:recipientId/shares`
共有コンテンツ一覧。

### `GET /received/:recipientId/entries`
公開されたエントリ一覧（権限に基づくフィルタリング）。

### `GET /received/:recipientId/entries/:id`
公開エントリの詳細。

### `POST /received/:recipientId/bot/conversations`
記録者のAIボットとの会話を開始。`allowBot`権限が必要。

### `POST /received/:recipientId/bot/conversations/:id/messages`
ボットにメッセージを送信。

---

## 第三者 `/trustees`

### `GET /trustees`
自分が設定した第三者一覧。

### `POST /trustees`
第三者を追加。

**Request Body:**
```json
{
  "trusteeUserId": "user_ulid"
}
```

### `DELETE /trustees/:id`
第三者を削除。

### `GET /trustees/duties`
自分が第三者として引き受けている義務の一覧。

### `POST /trustees/duties/:id/accept`
第三者義務を承諾。

### `POST /trustees/duties/:id/decline`
第三者義務を拒否。

### `POST /trustees/duties/:id/trigger`
トリガーを発動。

---

## トリガー `/trigger`

### `GET /trigger`
自分のトリガー状態を取得。

### `POST /trigger/cancel`
トリガーをキャンセル（grace_period中のみ）。

---

## 生存確認 `/life-check`

### `GET /life-check/settings`
生存確認設定を取得。

### `PATCH /life-check/settings`
設定を更新。

**Request Body:**
```json
{
  "checkIntervalDays": 30,
  "maxMissedChecks": 3,
  "trusteeWaitDays": 60,
  "isEnabled": true
}
```

### `POST /life-check/respond`
生存確認に応答。

### `GET /life-check/history`
過去の生存確認一覧。

---

## 通知 `/notifications`

### `POST /notifications/register-device`
デバイストークンを登録。

**Request Body:**
```json
{
  "platform": "ios",
  "token": "apns_device_token"
}
```

### `DELETE /notifications/unregister-device`
デバイストークンを解除。

### `GET /notifications`
通知一覧。

### `PATCH /notifications/:id/read`
通知を既読にする。
