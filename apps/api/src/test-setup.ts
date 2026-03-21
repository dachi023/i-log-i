import { env } from "cloudflare:test";
import { beforeAll } from "vitest";

const USER_DB_STATEMENTS = [
  // biome-ignore format: SQL
  "CREATE TABLE IF NOT EXISTS entries (id TEXT PRIMARY KEY, entry_type TEXT NOT NULL DEFAULT 'diary', title TEXT, body TEXT, recorded_at TEXT NOT NULL, tags TEXT, is_private INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_entries_recorded_at ON entries(recorded_at)",
  // biome-ignore format: SQL
  "CREATE TABLE IF NOT EXISTS person_tags (id TEXT PRIMARY KEY, name TEXT NOT NULL, relationship TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))",
  // biome-ignore format: SQL
  "CREATE TABLE IF NOT EXISTS questions (id TEXT PRIMARY KEY, category TEXT NOT NULL, subcategory TEXT, question_text TEXT NOT NULL, answer_type TEXT NOT NULL DEFAULT 'text', options TEXT, scale_min INTEGER, scale_max INTEGER, scale_labels TEXT, is_system INTEGER NOT NULL DEFAULT 1, priority INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))",
  // biome-ignore format: SQL
  "CREATE TABLE IF NOT EXISTS answers (id TEXT PRIMARY KEY, question_id TEXT NOT NULL REFERENCES questions(id), answer_text TEXT NOT NULL, answered_at TEXT NOT NULL DEFAULT (datetime('now')))",
  // biome-ignore format: SQL
  "CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, version INTEGER NOT NULL, speech_style TEXT, values_data TEXT, personality_traits TEXT, humor_style TEXT, emotional_patterns TEXT, relationships TEXT, life_story TEXT, confidence_scores TEXT, source_summary TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))",
  // biome-ignore format: SQL
  "CREATE TABLE IF NOT EXISTS bot_conversations (id TEXT PRIMARY KEY, participant TEXT NOT NULL, started_at TEXT NOT NULL DEFAULT (datetime('now')), ended_at TEXT)",
  // biome-ignore format: SQL
  "CREATE TABLE IF NOT EXISTS bot_messages (id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES bot_conversations(id) ON DELETE CASCADE, role TEXT NOT NULL, content TEXT NOT NULL, profile_version INTEGER, created_at TEXT NOT NULL DEFAULT (datetime('now')))",
  // biome-ignore format: SQL
  "CREATE TABLE IF NOT EXISTS bot_feedback (id TEXT PRIMARY KEY, message_id TEXT NOT NULL REFERENCES bot_messages(id) ON DELETE CASCADE, rating INTEGER NOT NULL, correction TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))",
  // biome-ignore format: SQL
  "CREATE TABLE IF NOT EXISTS profile_overrides (id TEXT PRIMARY KEY, field_path TEXT NOT NULL, override_value TEXT NOT NULL, reason TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))",
];

const COMMON_DB_STATEMENTS = [
  // biome-ignore format: SQL
  "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, display_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, role TEXT NOT NULL DEFAULT 'recorder', user_db_name TEXT, status TEXT NOT NULL DEFAULT 'active', last_active_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))",
  // biome-ignore format: SQL
  "INSERT OR IGNORE INTO users (id, display_name, email, role, user_db_name, status) VALUES ('01JQXK5V0G3M8N2P4R6T8W0Y1Z', '田中 太郎', 'tanaka.taro@example.com', 'recorder', 'user_01JQXK5V0G3M8N2P4R6T8W0Y1Z', 'active')",
];

beforeAll(async () => {
  for (const stmt of USER_DB_STATEMENTS) {
    await env.USER_DB.exec(stmt);
  }
  for (const stmt of COMMON_DB_STATEMENTS) {
    await env.COMMON_DB.exec(stmt);
  }
});
