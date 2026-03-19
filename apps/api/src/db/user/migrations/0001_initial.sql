-- ユーザーDB: 記録・パーソナリティ・AIボット（ユーザーごとに1つ）

-- エントリ
CREATE TABLE entries (
  id            TEXT PRIMARY KEY,
  entry_type    TEXT NOT NULL DEFAULT 'diary',
  title         TEXT,
  body          TEXT,
  recorded_at   TEXT NOT NULL,
  tags          TEXT,
  is_private    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_entries_recorded_at ON entries(recorded_at);
CREATE INDEX idx_entries_type ON entries(entry_type);

-- メディアファイル
CREATE TABLE media (
  id            TEXT PRIMARY KEY,
  entry_id      TEXT REFERENCES entries(id) ON DELETE SET NULL,
  media_type    TEXT NOT NULL,
  r2_key        TEXT NOT NULL,
  file_name     TEXT,
  file_size     INTEGER,
  duration      INTEGER,
  mime_type     TEXT,
  caption       TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_media_entry ON media(entry_id);
CREATE INDEX idx_media_type ON media(media_type);

-- 人物タグ
CREATE TABLE person_tags (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  relationship  TEXT,
  notes         TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- エントリと人物の紐づけ
CREATE TABLE entry_person_tags (
  entry_id      TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  person_tag_id TEXT NOT NULL REFERENCES person_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, person_tag_id)
);
CREATE INDEX idx_entry_person_tags_person ON entry_person_tags(person_tag_id);

-- 質問マスタ
CREATE TABLE questions (
  id            TEXT PRIMARY KEY,
  category      TEXT NOT NULL,
  subcategory   TEXT,
  question_text TEXT NOT NULL,
  is_system     INTEGER NOT NULL DEFAULT 1,
  priority      INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_questions_category ON questions(category);

-- 質問への回答
CREATE TABLE answers (
  id            TEXT PRIMARY KEY,
  question_id   TEXT NOT NULL REFERENCES questions(id),
  answer_text   TEXT NOT NULL,
  answered_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_answers_answered_at ON answers(answered_at);

-- プロファイル
CREATE TABLE profiles (
  id            TEXT PRIMARY KEY,
  version       INTEGER NOT NULL,
  speech_style        TEXT,
  values_data         TEXT,
  personality_traits  TEXT,
  humor_style         TEXT,
  emotional_patterns  TEXT,
  relationships       TEXT,
  life_story          TEXT,
  confidence_scores   TEXT,
  source_summary      TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_profiles_version ON profiles(version);

-- プロファイルオーバーライド
CREATE TABLE profile_overrides (
  id            TEXT PRIMARY KEY,
  field_path    TEXT NOT NULL,
  override_value TEXT NOT NULL,
  reason        TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_profile_overrides_field ON profile_overrides(field_path);

-- 会話セッション
CREATE TABLE bot_conversations (
  id            TEXT PRIMARY KEY,
  participant   TEXT NOT NULL,
  started_at    TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at      TEXT
);
CREATE INDEX idx_bot_conversations_participant ON bot_conversations(participant);

-- メッセージ
CREATE TABLE bot_messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES bot_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,
  content         TEXT NOT NULL,
  profile_version INTEGER,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_bot_messages_conversation ON bot_messages(conversation_id);

-- 応答への評価
CREATE TABLE bot_feedback (
  id              TEXT PRIMARY KEY,
  message_id      TEXT NOT NULL REFERENCES bot_messages(id) ON DELETE CASCADE,
  rating          INTEGER NOT NULL,
  correction      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_bot_feedback_message ON bot_feedback(message_id);
