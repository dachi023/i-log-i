import { LIMITS, isValidEmail } from "@i-log-i/validation";
import { Hono } from "hono";
import { type UserRow, mapUserRow } from "../lib/mappers";
import type { AppEnv } from "../types";

export const userRoutes = new Hono<AppEnv>();

const USER_COLUMNS =
  "id, display_name, email, role, user_db_name, status, last_active_at, created_at, updated_at";

// GET /users/me
userRoutes.get("/me", async (c) => {
  const userId = c.get("userId");
  const db = c.env.COMMON_DB;

  const row = await db
    .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?1`)
    .bind(userId)
    .first<UserRow>();

  if (!row) {
    return c.json({ error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  // last_active_at を更新
  await db
    .prepare(
      "UPDATE users SET last_active_at = datetime('now'), updated_at = datetime('now') WHERE id = ?1",
    )
    .bind(userId)
    .run();

  return c.json({ data: mapUserRow(row) });
});

// PATCH /users/me
userRoutes.patch("/me", async (c) => {
  const userId = c.get("userId");
  const db = c.env.COMMON_DB;
  const body = await c.req.json<{ displayName?: string }>();

  if (body.displayName !== undefined) {
    if (body.displayName.trim().length === 0) {
      return c.json(
        { error: { code: "VALIDATION_ERROR", message: "displayName cannot be empty" } },
        400,
      );
    }
    if (body.displayName.length > LIMITS.DISPLAY_NAME_MAX) {
      return c.json(
        { error: { code: "VALIDATION_ERROR", message: "displayName exceeds maximum length" } },
        400,
      );
    }
  }

  const updates: string[] = ["updated_at = datetime('now')"];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (body.displayName !== undefined) {
    updates.push(`display_name = ?${paramIndex}`);
    values.push(body.displayName.trim());
    paramIndex++;
  }

  values.push(userId);
  await db
    .prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?${paramIndex}`)
    .bind(...values)
    .run();

  const row = await db
    .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?1`)
    .bind(userId)
    .first<UserRow>();

  return c.json({ data: mapUserRow(row as UserRow) });
});

// POST /users/me/setup
// オンボーディング完了時に呼ばれる。ユーザーDBの初期セットアップを行う
userRoutes.post("/me/setup", async (c) => {
  const userId = c.get("userId");
  const db = c.env.COMMON_DB;

  const row = await db
    .prepare("SELECT id, user_db_name FROM users WHERE id = ?1")
    .bind(userId)
    .first<{ id: string; user_db_name: string | null }>();

  if (!row) {
    return c.json({ error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  // user_db_name がすでに設定済みならセットアップ済み
  if (row.user_db_name) {
    return c.json({ error: { code: "CONFLICT", message: "User already set up" } }, 409);
  }

  const userDbName = `user_${userId}`;
  await db
    .prepare("UPDATE users SET user_db_name = ?1, updated_at = datetime('now') WHERE id = ?2")
    .bind(userDbName, userId)
    .run();

  const updated = await db
    .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?1`)
    .bind(userId)
    .first<UserRow>();

  return c.json({ data: mapUserRow(updated as UserRow) }, 201);
});

// POST /users/me/upgrade-to-recorder
userRoutes.post("/me/upgrade-to-recorder", async (c) => {
  const userId = c.get("userId");
  const db = c.env.COMMON_DB;

  const row = await db
    .prepare("SELECT id, role FROM users WHERE id = ?1")
    .bind(userId)
    .first<{ id: string; role: string }>();

  if (!row) {
    return c.json({ error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  if (row.role === "recorder" || row.role === "both") {
    return c.json({ error: { code: "CONFLICT", message: "Already a recorder" } }, 409);
  }

  const newRole = row.role === "receiver" ? "both" : "recorder";
  await db
    .prepare("UPDATE users SET role = ?1, updated_at = datetime('now') WHERE id = ?2")
    .bind(newRole, userId)
    .run();

  const updated = await db
    .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?1`)
    .bind(userId)
    .first<UserRow>();

  return c.json({ data: mapUserRow(updated as UserRow) });
});

// DELETE /users/me
userRoutes.delete("/me", async (c) => {
  const userId = c.get("userId");
  const db = c.env.COMMON_DB;

  await db
    .prepare("UPDATE users SET status = 'deleted', updated_at = datetime('now') WHERE id = ?1")
    .bind(userId)
    .run();

  return c.body(null, 204);
});

// GET /users/search?email={email}
userRoutes.get("/search", async (c) => {
  const email = c.req.query("email");
  if (!email || !isValidEmail(email)) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Valid email is required" } }, 400);
  }

  const db = c.env.COMMON_DB;
  const row = await db
    .prepare(
      "SELECT id, display_name, email, role FROM users WHERE email = ?1 AND status = 'active'",
    )
    .bind(email)
    .first<{ id: string; display_name: string; email: string; role: string }>();

  if (!row) {
    return c.json({ error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  return c.json({
    data: {
      id: row.id,
      displayName: row.display_name,
      email: row.email,
      role: row.role,
    },
  });
});
