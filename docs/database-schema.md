# データベーススキーマ

## 概要

D1（SQLite）を2つのデータベースに分離して使用する。

- **COMMON_DB**: 全ユーザー共有。認証、関係性、トリガーなど。
- **USER_DB**: ユーザーごとのプライベートデータ。記録、プロファイル、ボット会話など。

全テーブルのIDはULID形式（TEXT型、26文字）。日時フィールドは ISO 8601 文字列。

---

## COMMON_DB

### users
```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY,          -- ULID
  display_name  TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL DEFAULT 'recorder',  -- recorder|receiver|both
  user_db_name  TEXT,                      -- recorderのみ設定
  status        TEXT NOT NULL DEFAULT 'active',    -- active|triggered|deleted
  last_active_at TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### auth_providers
```sql
CREATE TABLE auth_providers (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,             -- google|apple
  provider_uid  TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(provider, provider_uid)
);
```

### recipients
```sql
CREATE TABLE recipients (
  id                TEXT PRIMARY KEY,
  owner_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_user_id TEXT NOT NULL REFERENCES users(id),
  relationship      TEXT,
  message           TEXT,
  status            TEXT NOT NULL DEFAULT 'invited',  -- invited|accepted|declined
  invited_at        TEXT NOT NULL DEFAULT (datetime('now')),
  accepted_at       TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(owner_id, recipient_user_id)
);
```

### recipient_permissions
```sql
CREATE TABLE recipient_permissions (
  id            TEXT PRIMARY KEY,
  recipient_id  TEXT NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  scope_type    TEXT NOT NULL,             -- all|tag_based|date_range|manual
  scope_value   TEXT,                      -- JSON: スコープの詳細値
  allow_bot     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**scope_value の形式:**
- `all`: `null`
- `tag_based`: `{"tags": ["家族", "日常"]}`
- `date_range`: `{"from": "2024-01-01", "to": "2024-12-31"}`
- `manual`: `{"entryIds": ["ulid1", "ulid2"]}`

### living_shares
```sql
CREATE TABLE living_shares (
  id            TEXT PRIMARY KEY,
  recipient_id  TEXT NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  share_type    TEXT NOT NULL,             -- message|entry|media
  reference_id  TEXT,                      -- entry/mediaのID（messageの場合null）
  content       TEXT,                      -- messageの場合テキスト
  is_read       INTEGER NOT NULL DEFAULT 0,
  shared_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### trustees
```sql
CREATE TABLE trustees (
  id              TEXT PRIMARY KEY,
  owner_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trustee_user_id TEXT NOT NULL REFERENCES users(id),
  status          TEXT NOT NULL DEFAULT 'invited',
  invited_at      TEXT NOT NULL DEFAULT (datetime('now')),
  accepted_at     TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(owner_id, trustee_user_id)
);
```

### triggers
```sql
CREATE TABLE triggers (
  id                  TEXT PRIMARY KEY,
  owner_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'standby',
  triggered_by_type   TEXT,               -- trustee|recipient
  triggered_by_id     TEXT,
  grace_period_days   INTEGER,
  grace_started_at    TEXT,
  grace_expires_at    TEXT,
  triggered_at        TEXT,
  cancelled_at        TEXT,
  escalated_to_trustees_at   TEXT,
  escalated_to_recipients_at TEXT,
  notes               TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**ステータス遷移:**
`standby` → `escalated_to_trustees` → `escalated_to_recipients` → `grace_period` → `triggered` / `cancelled`

### life_check_settings
```sql
CREATE TABLE life_check_settings (
  id                  TEXT PRIMARY KEY,
  owner_id            TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  check_interval_days INTEGER NOT NULL DEFAULT 30,
  max_missed_checks   INTEGER NOT NULL DEFAULT 3,
  trustee_wait_days   INTEGER NOT NULL DEFAULT 60,
  is_enabled          INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### life_checks
```sql
CREATE TABLE life_checks (
  id                  TEXT PRIMARY KEY,
  owner_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_at             TEXT NOT NULL,
  responded_at        TEXT,
  check_method        TEXT NOT NULL DEFAULT 'push+email',
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### device_tokens
```sql
CREATE TABLE device_tokens (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL,             -- ios|android
  token         TEXT NOT NULL,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, token)
);
```

---

## USER_DB

### entries
```sql
CREATE TABLE entries (
  id            TEXT PRIMARY KEY,
  entry_type    TEXT NOT NULL DEFAULT 'diary',  -- diary|memo|voice_note
  title         TEXT,
  body          TEXT,
  recorded_at   TEXT NOT NULL,
  tags          TEXT,                      -- JSON配列: ["tag1", "tag2"]
  is_private    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### media
```sql
CREATE TABLE media (
  id            TEXT PRIMARY KEY,
  entry_id      TEXT REFERENCES entries(id) ON DELETE SET NULL,
  media_type    TEXT NOT NULL,             -- image|video|audio
  r2_key        TEXT NOT NULL,             -- R2上のオブジェクトキー
  file_name     TEXT,
  file_size     INTEGER,                   -- バイト数
  duration      INTEGER,                   -- 秒数（audio/video）
  mime_type     TEXT,
  caption       TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### person_tags
```sql
CREATE TABLE person_tags (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  relationship  TEXT,
  notes         TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### entry_person_tags
```sql
CREATE TABLE entry_person_tags (
  entry_id      TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  person_tag_id TEXT NOT NULL REFERENCES person_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, person_tag_id)
);
```

### questions
```sql
CREATE TABLE questions (
  id            TEXT PRIMARY KEY,
  category      TEXT NOT NULL,             -- setup|daily|scenario|supplemental
  subcategory   TEXT,
  question_text TEXT NOT NULL,
  is_system     INTEGER NOT NULL DEFAULT 1,
  priority      INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### answers
```sql
CREATE TABLE answers (
  id            TEXT PRIMARY KEY,
  question_id   TEXT NOT NULL REFERENCES questions(id),
  answer_text   TEXT NOT NULL,
  answered_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### profiles
```sql
CREATE TABLE profiles (
  id            TEXT PRIMARY KEY,
  version       INTEGER NOT NULL,
  speech_style        TEXT,               -- JSON
  values_data         TEXT,               -- JSON
  personality_traits  TEXT,               -- JSON
  humor_style         TEXT,               -- JSON
  emotional_patterns  TEXT,               -- JSON
  relationships       TEXT,               -- JSON
  life_story          TEXT,               -- JSON
  confidence_scores   TEXT,               -- JSON
  source_summary      TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### profile_overrides
```sql
CREATE TABLE profile_overrides (
  id            TEXT PRIMARY KEY,
  field_path    TEXT NOT NULL,             -- 例: "speech_style.tone"
  override_value TEXT NOT NULL,
  reason        TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### bot_conversations
```sql
CREATE TABLE bot_conversations (
  id            TEXT PRIMARY KEY,
  participant   TEXT NOT NULL,             -- "self" or "recipient:{userId}"
  started_at    TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at      TEXT
);
```

### bot_messages
```sql
CREATE TABLE bot_messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES bot_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,           -- user|assistant
  content         TEXT NOT NULL,
  profile_version INTEGER,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### bot_feedback
```sql
CREATE TABLE bot_feedback (
  id              TEXT PRIMARY KEY,
  message_id      TEXT NOT NULL REFERENCES bot_messages(id) ON DELETE CASCADE,
  rating          INTEGER NOT NULL,        -- 1-3
  correction      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## インデックス

### COMMON_DB
- `idx_auth_providers_user` ON auth_providers(user_id)
- `idx_recipients_owner` ON recipients(owner_id)
- `idx_recipients_user` ON recipients(recipient_user_id)
- `idx_recipient_permissions_recipient` ON recipient_permissions(recipient_id)
- `idx_living_shares_recipient` ON living_shares(recipient_id)
- `idx_trustees_owner` ON trustees(owner_id)
- `idx_trustees_user` ON trustees(trustee_user_id)
- `idx_triggers_owner` ON triggers(owner_id)
- `idx_triggers_status` ON triggers(status)
- `idx_life_checks_owner` ON life_checks(owner_id)
- `idx_life_checks_sent` ON life_checks(sent_at)
- `idx_device_tokens_user` ON device_tokens(user_id)

### USER_DB
- `idx_entries_recorded_at` ON entries(recorded_at)
- `idx_entries_type` ON entries(entry_type)
- `idx_media_entry` ON media(entry_id)
- `idx_media_type` ON media(media_type)
- `idx_entry_person_tags_person` ON entry_person_tags(person_tag_id)
- `idx_questions_category` ON questions(category)
- `idx_answers_question` ON answers(question_id)
- `idx_answers_answered_at` ON answers(answered_at)
- `idx_profiles_version` ON profiles(version)
- `idx_profile_overrides_field` ON profile_overrides(field_path)
- `idx_bot_conversations_participant` ON bot_conversations(participant)
- `idx_bot_messages_conversation` ON bot_messages(conversation_id)
- `idx_bot_feedback_message` ON bot_feedback(message_id)
