-- 共通DB: ユーザー管理・認証・関係性・トリガー

-- ユーザー
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL DEFAULT 'recorder',
  user_db_name  TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  last_active_at TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- OAuth認証
CREATE TABLE auth_providers (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,
  provider_uid  TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(provider, provider_uid)
);
CREATE INDEX idx_auth_providers_user ON auth_providers(user_id);

-- 受取人関係
CREATE TABLE recipients (
  id                TEXT PRIMARY KEY,
  owner_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_user_id TEXT NOT NULL REFERENCES users(id),
  relationship      TEXT,
  message           TEXT,
  status            TEXT NOT NULL DEFAULT 'invited',
  invited_at        TEXT NOT NULL DEFAULT (datetime('now')),
  accepted_at       TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(owner_id, recipient_user_id)
);
CREATE INDEX idx_recipients_owner ON recipients(owner_id);
CREATE INDEX idx_recipients_user ON recipients(recipient_user_id);

-- 受取人ごとの公開範囲
CREATE TABLE recipient_permissions (
  id            TEXT PRIMARY KEY,
  recipient_id  TEXT NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  scope_type    TEXT NOT NULL,
  scope_value   TEXT,
  allow_bot     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_recipient_permissions_recipient ON recipient_permissions(recipient_id);

-- 生前共有
CREATE TABLE living_shares (
  id            TEXT PRIMARY KEY,
  recipient_id  TEXT NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  share_type    TEXT NOT NULL,
  reference_id  TEXT,
  content       TEXT,
  is_read       INTEGER NOT NULL DEFAULT 0,
  shared_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_living_shares_recipient ON living_shares(recipient_id);

-- 第三者
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
CREATE INDEX idx_trustees_owner ON trustees(owner_id);
CREATE INDEX idx_trustees_user ON trustees(trustee_user_id);

-- 死後トリガー
CREATE TABLE triggers (
  id                  TEXT PRIMARY KEY,
  owner_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'standby',
  triggered_by_type   TEXT,
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
CREATE INDEX idx_triggers_owner ON triggers(owner_id);
CREATE INDEX idx_triggers_status ON triggers(status);

-- 生存確認設定
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

-- 生存確認ログ
CREATE TABLE life_checks (
  id                  TEXT PRIMARY KEY,
  owner_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_at             TEXT NOT NULL,
  responded_at        TEXT,
  check_method        TEXT NOT NULL DEFAULT 'push+email',
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_life_checks_owner ON life_checks(owner_id);
CREATE INDEX idx_life_checks_sent ON life_checks(sent_at);

-- デバイストークン
CREATE TABLE device_tokens (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL,
  token         TEXT NOT NULL,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, token)
);
CREATE INDEX idx_device_tokens_user ON device_tokens(user_id);
