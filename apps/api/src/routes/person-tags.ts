import { LIMITS, isValidUlid } from "@i-log-i/validation";
import { Hono } from "hono";
import { generateUlid } from "../lib/id";
import { type PersonTagRow, mapPersonTagRow } from "../lib/mappers";
import type { AppEnv } from "../types";

export const personTagRoutes = new Hono<AppEnv>();

const TAG_COLUMNS = "id, name, relationship, notes, created_at";

// GET /person-tags
personTagRoutes.get("/", async (c) => {
  const db = c.env.USER_DB;
  const results = await db
    .prepare(`SELECT ${TAG_COLUMNS} FROM person_tags ORDER BY created_at DESC`)
    .all<PersonTagRow>();

  return c.json({ data: results.results.map(mapPersonTagRow) });
});

// POST /person-tags
personTagRoutes.post("/", async (c) => {
  const body = await c.req.json<{
    name?: string;
    relationship?: string | null;
    notes?: string | null;
  }>();

  if (!body.name?.trim()) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "name is required" } }, 400);
  }
  if (body.name.length > LIMITS.PERSON_TAG_NAME_MAX) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: "name exceeds maximum length" } },
      400,
    );
  }
  if (body.relationship && body.relationship.length > LIMITS.RELATIONSHIP_MAX) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: "relationship exceeds maximum length" } },
      400,
    );
  }

  const db = c.env.USER_DB;
  const id = generateUlid();

  await db
    .prepare("INSERT INTO person_tags (id, name, relationship, notes) VALUES (?1, ?2, ?3, ?4)")
    .bind(id, body.name.trim(), body.relationship ?? null, body.notes ?? null)
    .run();

  const row = await db
    .prepare(`SELECT ${TAG_COLUMNS} FROM person_tags WHERE id = ?1`)
    .bind(id)
    .first<PersonTagRow>();

  return c.json({ data: mapPersonTagRow(row as PersonTagRow) }, 201);
});

// PATCH /person-tags/:id
personTagRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  if (!isValidUlid(id)) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid ID format" } }, 400);
  }

  const db = c.env.USER_DB;
  const existing = await db
    .prepare("SELECT id FROM person_tags WHERE id = ?1")
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Person tag not found" } }, 404);
  }

  const body = await c.req.json<{
    name?: string;
    relationship?: string | null;
    notes?: string | null;
  }>();

  if (body.name !== undefined && body.name.length > LIMITS.PERSON_TAG_NAME_MAX) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: "name exceeds maximum length" } },
      400,
    );
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (body.name !== undefined) {
    updates.push(`name = ?${paramIndex}`);
    values.push(body.name.trim());
    paramIndex++;
  }
  if (body.relationship !== undefined) {
    updates.push(`relationship = ?${paramIndex}`);
    values.push(body.relationship);
    paramIndex++;
  }
  if (body.notes !== undefined) {
    updates.push(`notes = ?${paramIndex}`);
    values.push(body.notes);
    paramIndex++;
  }

  if (updates.length === 0) {
    const row = await db
      .prepare(`SELECT ${TAG_COLUMNS} FROM person_tags WHERE id = ?1`)
      .bind(id)
      .first<PersonTagRow>();
    return c.json({ data: mapPersonTagRow(row as PersonTagRow) });
  }

  values.push(id);
  await db
    .prepare(`UPDATE person_tags SET ${updates.join(", ")} WHERE id = ?${paramIndex}`)
    .bind(...values)
    .run();

  const row = await db
    .prepare(`SELECT ${TAG_COLUMNS} FROM person_tags WHERE id = ?1`)
    .bind(id)
    .first<PersonTagRow>();

  return c.json({ data: mapPersonTagRow(row as PersonTagRow) });
});

// DELETE /person-tags/:id
personTagRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (!isValidUlid(id)) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid ID format" } }, 400);
  }

  const db = c.env.USER_DB;
  const existing = await db
    .prepare("SELECT id FROM person_tags WHERE id = ?1")
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Person tag not found" } }, 404);
  }

  await db.prepare("DELETE FROM person_tags WHERE id = ?1").bind(id).run();
  return c.body(null, 204);
});
