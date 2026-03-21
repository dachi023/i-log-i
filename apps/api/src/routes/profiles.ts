import { Hono } from "hono";
import { generateUlid } from "../lib/id";
import { type ProfileRow, mapProfileRow } from "../lib/mappers";
import type { AppEnv } from "../types";

export const profileRoutes = new Hono<AppEnv>();

const PROFILE_COLUMNS =
  "id, version, speech_style, values_data, personality_traits, humor_style, emotional_patterns, relationships, life_story, confidence_scores, source_summary, created_at";

// GET /profile
profileRoutes.get("/", async (c) => {
  const db = c.env.USER_DB;
  const row = await db
    .prepare(`SELECT ${PROFILE_COLUMNS} FROM profiles ORDER BY version DESC LIMIT 1`)
    .first<ProfileRow>();

  if (!row) {
    return c.json({ data: null });
  }

  return c.json({ data: mapProfileRow(row) });
});

// GET /profile/versions
profileRoutes.get("/versions", async (c) => {
  const db = c.env.USER_DB;
  const results = await db
    .prepare("SELECT id, version, source_summary, created_at FROM profiles ORDER BY version DESC")
    .all<{ id: string; version: number; source_summary: string | null; created_at: string }>();

  return c.json({
    data: results.results.map((r) => ({
      id: r.id,
      version: r.version,
      sourceSummary: r.source_summary,
      createdAt: r.created_at,
    })),
  });
});

// GET /profile/versions/:version
profileRoutes.get("/versions/:version", async (c) => {
  const version = Number(c.req.param("version"));
  if (Number.isNaN(version) || version < 1) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid version" } }, 400);
  }

  const db = c.env.USER_DB;
  const row = await db
    .prepare(`SELECT ${PROFILE_COLUMNS} FROM profiles WHERE version = ?1`)
    .bind(version)
    .first<ProfileRow>();

  if (!row) {
    return c.json({ error: { code: "NOT_FOUND", message: "Profile version not found" } }, 404);
  }

  return c.json({ data: mapProfileRow(row) });
});

// POST /profile/regenerate
// LLM連携は後回し。現時点ではプレースホルダーのプロファイルを生成
profileRoutes.post("/regenerate", async (c) => {
  const db = c.env.USER_DB;

  // 現在の最新バージョンを取得
  const latest = await db
    .prepare("SELECT version FROM profiles ORDER BY version DESC LIMIT 1")
    .first<{ version: number }>();

  const nextVersion = (latest?.version ?? 0) + 1;
  const id = generateUlid();

  // 回答数とエントリ数を取得してsource_summaryに反映
  const answerCount = await db
    .prepare("SELECT COUNT(*) as count FROM answers")
    .first<{ count: number }>();
  const entryCount = await db
    .prepare("SELECT COUNT(*) as count FROM entries")
    .first<{ count: number }>();

  const sourceSummary = `日記${entryCount?.count ?? 0}件、回答${answerCount?.count ?? 0}件から生成`;

  await db
    .prepare("INSERT INTO profiles (id, version, source_summary) VALUES (?1, ?2, ?3)")
    .bind(id, nextVersion, sourceSummary)
    .run();

  const row = await db
    .prepare(`SELECT ${PROFILE_COLUMNS} FROM profiles WHERE id = ?1`)
    .bind(id)
    .first<ProfileRow>();

  return c.json({ data: mapProfileRow(row as ProfileRow) }, 201);
});

// GET /profile/overrides
profileRoutes.get("/overrides", async (c) => {
  const db = c.env.USER_DB;
  const results = await db
    .prepare(
      "SELECT id, field_path, override_value, reason, created_at, updated_at FROM profile_overrides ORDER BY created_at DESC",
    )
    .all<{
      id: string;
      field_path: string;
      override_value: string;
      reason: string | null;
      created_at: string;
      updated_at: string;
    }>();

  return c.json({
    data: results.results.map((r) => ({
      id: r.id,
      fieldPath: r.field_path,
      overrideValue: r.override_value,
      reason: r.reason,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  });
});

// PUT /profile/overrides/:fieldPath
profileRoutes.put("/overrides/:fieldPath", async (c) => {
  const fieldPath = c.req.param("fieldPath");
  const body = await c.req.json<{ overrideValue: string; reason?: string }>();

  if (!body.overrideValue) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: "overrideValue is required" } },
      400,
    );
  }

  const db = c.env.USER_DB;

  // 既存のオーバーライドを確認
  const existing = await db
    .prepare("SELECT id FROM profile_overrides WHERE field_path = ?1")
    .bind(fieldPath)
    .first<{ id: string }>();

  if (existing) {
    await db
      .prepare(
        "UPDATE profile_overrides SET override_value = ?1, reason = ?2, updated_at = datetime('now') WHERE id = ?3",
      )
      .bind(body.overrideValue, body.reason ?? null, existing.id)
      .run();
  } else {
    const id = generateUlid();
    await db
      .prepare(
        "INSERT INTO profile_overrides (id, field_path, override_value, reason) VALUES (?1, ?2, ?3, ?4)",
      )
      .bind(id, fieldPath, body.overrideValue, body.reason ?? null)
      .run();
  }

  return c.json({
    data: { fieldPath, overrideValue: body.overrideValue, reason: body.reason ?? null },
  });
});

// DELETE /profile/overrides/:fieldPath
profileRoutes.delete("/overrides/:fieldPath", async (c) => {
  const fieldPath = c.req.param("fieldPath");
  const db = c.env.USER_DB;

  const existing = await db
    .prepare("SELECT id FROM profile_overrides WHERE field_path = ?1")
    .bind(fieldPath)
    .first<{ id: string }>();

  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Override not found" } }, 404);
  }

  await db.prepare("DELETE FROM profile_overrides WHERE id = ?1").bind(existing.id).run();
  return c.body(null, 204);
});
