import { LIMITS, isValidUlid } from "@i-log-i/validation";
import { Hono } from "hono";
import { generateUlid } from "../lib/id";
import { type EntryRow, mapEntryRow } from "../lib/mappers";
import type { AppEnv } from "../types";

export const entryRoutes = new Hono<AppEnv>();

const ENTRY_COLUMNS = "id, body, recorded_at, created_at, updated_at";

// カーソルをエンコード/デコード
function encodeCursor(recordedAt: string, id: string): string {
  return btoa(JSON.stringify({ recordedAt, id }));
}

function decodeCursor(cursor: string): { recordedAt: string; id: string } | null {
  try {
    return JSON.parse(atob(cursor));
  } catch {
    return null;
  }
}

// GET /entries/search?q={query}
// `:id` より前に登録しないとパスが衝突する
entryRoutes.get("/search", async (c) => {
  const q = c.req.query("q");
  if (!q?.trim()) {
    return c.json({ data: [], cursor: null, hasMore: false });
  }

  const db = c.env.USER_DB;
  const results = await db
    .prepare(
      `SELECT ${ENTRY_COLUMNS} FROM entries WHERE body LIKE ?1 ORDER BY recorded_at DESC, id DESC LIMIT ?2`,
    )
    .bind(`%${q}%`, LIMITS.PAGE_SIZE_DEFAULT)
    .all<EntryRow>();

  return c.json({
    data: results.results.map(mapEntryRow),
    cursor: null,
    hasMore: false,
  });
});

// GET /entries
entryRoutes.get("/", async (c) => {
  const db = c.env.USER_DB;
  const cursorParam = c.req.query("cursor");
  const limitParam = c.req.query("limit");
  const limit = Math.min(
    Math.max(Number(limitParam) || LIMITS.PAGE_SIZE_DEFAULT, 1),
    LIMITS.PAGE_SIZE_MAX,
  );

  let query: string;
  let params: unknown[];

  if (cursorParam) {
    const decoded = decodeCursor(cursorParam);
    if (!decoded) {
      return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid cursor" } }, 400);
    }
    query = `SELECT ${ENTRY_COLUMNS} FROM entries WHERE (recorded_at < ?1) OR (recorded_at = ?1 AND id < ?2) ORDER BY recorded_at DESC, id DESC LIMIT ?3`;
    params = [decoded.recordedAt, decoded.id, limit + 1];
  } else {
    query = `SELECT ${ENTRY_COLUMNS} FROM entries ORDER BY recorded_at DESC, id DESC LIMIT ?1`;
    params = [limit + 1];
  }

  const results = await db
    .prepare(query)
    .bind(...params)
    .all<EntryRow>();
  const hasMore = results.results.length > limit;
  const items = results.results.slice(0, limit).map(mapEntryRow);
  const nextCursor =
    hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].recordedAt, items[items.length - 1].id)
      : null;

  return c.json({ data: items, cursor: nextCursor, hasMore });
});

// GET /entries/:id
entryRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  if (!isValidUlid(id)) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid ID format" } }, 400);
  }

  const db = c.env.USER_DB;
  const row = await db
    .prepare(`SELECT ${ENTRY_COLUMNS} FROM entries WHERE id = ?1`)
    .bind(id)
    .first<EntryRow>();

  if (!row) {
    return c.json({ error: { code: "NOT_FOUND", message: "Entry not found" } }, 404);
  }

  return c.json({ data: mapEntryRow(row) });
});

// POST /entries
entryRoutes.post("/", async (c) => {
  const body = await c.req.json<{ body?: string | null; recordedAt?: string }>();

  if (!body.recordedAt) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "recordedAt is required" } }, 400);
  }
  if (body.body && body.body.length > LIMITS.ENTRY_BODY_MAX) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: "Body exceeds maximum length" } },
      400,
    );
  }

  const db = c.env.USER_DB;
  const id = generateUlid();

  await db
    .prepare("INSERT INTO entries (id, body, recorded_at) VALUES (?1, ?2, ?3)")
    .bind(id, body.body ?? null, body.recordedAt)
    .run();

  const row = await db
    .prepare(`SELECT ${ENTRY_COLUMNS} FROM entries WHERE id = ?1`)
    .bind(id)
    .first<EntryRow>();

  return c.json({ data: mapEntryRow(row as EntryRow) }, 201);
});

// PATCH /entries/:id
entryRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  if (!isValidUlid(id)) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid ID format" } }, 400);
  }

  const db = c.env.USER_DB;
  const existing = await db
    .prepare("SELECT id FROM entries WHERE id = ?1")
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Entry not found" } }, 404);
  }

  const body = await c.req.json<{ body?: string | null; recordedAt?: string }>();
  if (body.body && body.body.length > LIMITS.ENTRY_BODY_MAX) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: "Body exceeds maximum length" } },
      400,
    );
  }

  const updates: string[] = ["updated_at = datetime('now')"];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (body.body !== undefined) {
    updates.push(`body = ?${paramIndex}`);
    values.push(body.body);
    paramIndex++;
  }
  if (body.recordedAt !== undefined) {
    updates.push(`recorded_at = ?${paramIndex}`);
    values.push(body.recordedAt);
    paramIndex++;
  }

  values.push(id);
  await db
    .prepare(`UPDATE entries SET ${updates.join(", ")} WHERE id = ?${paramIndex}`)
    .bind(...values)
    .run();

  const row = await db
    .prepare(`SELECT ${ENTRY_COLUMNS} FROM entries WHERE id = ?1`)
    .bind(id)
    .first<EntryRow>();

  return c.json({ data: mapEntryRow(row as EntryRow) });
});

// DELETE /entries/:id
entryRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (!isValidUlid(id)) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid ID format" } }, 400);
  }

  const db = c.env.USER_DB;
  const existing = await db
    .prepare("SELECT id FROM entries WHERE id = ?1")
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Entry not found" } }, 404);
  }

  await db.prepare("DELETE FROM entries WHERE id = ?1").bind(id).run();
  return c.body(null, 204);
});
