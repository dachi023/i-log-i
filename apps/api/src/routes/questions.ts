import { LIMITS, isValidUlid } from "@i-log-i/validation";
import { Hono } from "hono";
import { generateUlid } from "../lib/id";
import { type AnswerRow, type QuestionRow, mapAnswerRow, mapQuestionRow } from "../lib/mappers";
import type { AppEnv } from "../types";

export const questionRoutes = new Hono<AppEnv>();

const QUESTION_COLUMNS =
  "id, category, subcategory, question_text, answer_type, options, scale_min, scale_max, scale_labels, is_system, priority, created_at";

// GET /questions
questionRoutes.get("/", async (c) => {
  const category = c.req.query("category");
  const db = c.env.USER_DB;

  let query = `SELECT ${QUESTION_COLUMNS} FROM questions`;
  const params: unknown[] = [];

  if (category) {
    query += " WHERE category = ?1";
    params.push(category);
  }

  query += " ORDER BY priority ASC, created_at ASC";

  const results = await db
    .prepare(query)
    .bind(...params)
    .all<QuestionRow>();
  return c.json({ data: results.results.map(mapQuestionRow) });
});

// GET /questions/answers
questionRoutes.get("/answers", async (c) => {
  const db = c.env.USER_DB;
  const results = await db
    .prepare(
      "SELECT id, question_id, answer_text, answered_at FROM answers ORDER BY answered_at DESC",
    )
    .all<AnswerRow>();

  return c.json({ data: results.results.map(mapAnswerRow) });
});

// POST /questions/:id/answer
questionRoutes.post("/:id/answer", async (c) => {
  const questionId = c.req.param("id");
  if (!isValidUlid(questionId)) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid ID format" } }, 400);
  }

  const db = c.env.USER_DB;

  // 質問の存在確認
  const question = await db
    .prepare("SELECT id FROM questions WHERE id = ?1")
    .bind(questionId)
    .first<{ id: string }>();

  if (!question) {
    return c.json({ error: { code: "NOT_FOUND", message: "Question not found" } }, 404);
  }

  const body = await c.req.json<{ answerText?: string }>();
  if (!body.answerText?.trim()) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "answerText is required" } }, 400);
  }
  if (body.answerText.length > LIMITS.ANSWER_TEXT_MAX) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: "answerText exceeds maximum length" } },
      400,
    );
  }

  const id = generateUlid();
  await db
    .prepare("INSERT INTO answers (id, question_id, answer_text) VALUES (?1, ?2, ?3)")
    .bind(id, questionId, body.answerText.trim())
    .run();

  const row = await db
    .prepare("SELECT id, question_id, answer_text, answered_at FROM answers WHERE id = ?1")
    .bind(id)
    .first<AnswerRow>();

  return c.json({ data: mapAnswerRow(row as AnswerRow) }, 201);
});
