import { isValidUlid } from "@i-log-i/validation";
import { Hono } from "hono";
import { generateUlid } from "../lib/id";
import {
  type BotConversationRow,
  type BotMessageRow,
  mapBotConversationRow,
  mapBotMessageRow,
} from "../lib/mappers";
import type { AppEnv } from "../types";

export const botRoutes = new Hono<AppEnv>();

const CONVERSATION_COLUMNS = "id, participant, started_at, ended_at";
const MESSAGE_COLUMNS = "id, conversation_id, role, content, profile_version, created_at";

// POST /bot/conversations
botRoutes.post("/conversations", async (c) => {
  const body = await c.req.json<{ participant?: string }>();

  if (!body.participant) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "participant is required" } }, 400);
  }

  // participant は "self" または "recipient:{ulid}" 形式
  if (body.participant !== "self" && !body.participant.startsWith("recipient:")) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid participant format" } },
      400,
    );
  }

  const db = c.env.USER_DB;
  const id = generateUlid();

  await db
    .prepare("INSERT INTO bot_conversations (id, participant) VALUES (?1, ?2)")
    .bind(id, body.participant)
    .run();

  const row = await db
    .prepare(`SELECT ${CONVERSATION_COLUMNS} FROM bot_conversations WHERE id = ?1`)
    .bind(id)
    .first<BotConversationRow>();

  return c.json({ data: mapBotConversationRow(row as BotConversationRow) }, 201);
});

// GET /bot/conversations
botRoutes.get("/conversations", async (c) => {
  const db = c.env.USER_DB;
  const results = await db
    .prepare(`SELECT ${CONVERSATION_COLUMNS} FROM bot_conversations ORDER BY started_at DESC`)
    .all<BotConversationRow>();

  return c.json({ data: results.results.map(mapBotConversationRow) });
});

// GET /bot/conversations/:id/messages
botRoutes.get("/conversations/:id/messages", async (c) => {
  const conversationId = c.req.param("id");
  if (!isValidUlid(conversationId)) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid ID format" } }, 400);
  }

  const db = c.env.USER_DB;

  // 会話の存在確認
  const conversation = await db
    .prepare("SELECT id FROM bot_conversations WHERE id = ?1")
    .bind(conversationId)
    .first<{ id: string }>();

  if (!conversation) {
    return c.json({ error: { code: "NOT_FOUND", message: "Conversation not found" } }, 404);
  }

  const results = await db
    .prepare(
      `SELECT ${MESSAGE_COLUMNS} FROM bot_messages WHERE conversation_id = ?1 ORDER BY created_at ASC`,
    )
    .bind(conversationId)
    .all<BotMessageRow>();

  return c.json({ data: results.results.map(mapBotMessageRow) });
});

// POST /bot/conversations/:id/messages
// LLM連携は後回し。現時点ではプレースホルダー応答を返す
botRoutes.post("/conversations/:id/messages", async (c) => {
  const conversationId = c.req.param("id");
  if (!isValidUlid(conversationId)) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid ID format" } }, 400);
  }

  const body = await c.req.json<{ content?: string }>();
  if (!body.content?.trim()) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "content is required" } }, 400);
  }

  const db = c.env.USER_DB;

  // 会話の存在確認
  const conversation = await db
    .prepare("SELECT id, ended_at FROM bot_conversations WHERE id = ?1")
    .bind(conversationId)
    .first<{ id: string; ended_at: string | null }>();

  if (!conversation) {
    return c.json({ error: { code: "NOT_FOUND", message: "Conversation not found" } }, 404);
  }

  if (conversation.ended_at) {
    return c.json(
      { error: { code: "CONVERSATION_ENDED", message: "Conversation has ended" } },
      400,
    );
  }

  // ユーザーメッセージを保存
  const userMsgId = generateUlid();
  await db
    .prepare(
      "INSERT INTO bot_messages (id, conversation_id, role, content) VALUES (?1, ?2, ?3, ?4)",
    )
    .bind(userMsgId, conversationId, "user", body.content.trim())
    .run();

  // プレースホルダー応答（LLM統合時に置き換え）
  const assistantMsgId = generateUlid();
  const placeholderResponse =
    "これはプレースホルダー応答です。LLM統合後に実際の応答に置き換わります。";
  await db
    .prepare(
      "INSERT INTO bot_messages (id, conversation_id, role, content) VALUES (?1, ?2, ?3, ?4)",
    )
    .bind(assistantMsgId, conversationId, "assistant", placeholderResponse)
    .run();

  const userMsg = await db
    .prepare(`SELECT ${MESSAGE_COLUMNS} FROM bot_messages WHERE id = ?1`)
    .bind(userMsgId)
    .first<BotMessageRow>();

  const assistantMsg = await db
    .prepare(`SELECT ${MESSAGE_COLUMNS} FROM bot_messages WHERE id = ?1`)
    .bind(assistantMsgId)
    .first<BotMessageRow>();

  return c.json(
    {
      data: {
        userMessage: mapBotMessageRow(userMsg as BotMessageRow),
        assistantMessage: mapBotMessageRow(assistantMsg as BotMessageRow),
      },
    },
    201,
  );
});

// POST /bot/messages/:id/feedback
botRoutes.post("/messages/:id/feedback", async (c) => {
  const messageId = c.req.param("id");
  if (!isValidUlid(messageId)) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "Invalid ID format" } }, 400);
  }

  const body = await c.req.json<{ rating?: number; correction?: string }>();

  if (body.rating == null || ![1, 2, 3].includes(body.rating)) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: "rating must be 1, 2, or 3" } },
      400,
    );
  }

  const db = c.env.USER_DB;

  // メッセージの存在確認（assistantのメッセージのみフィードバック可能）
  const message = await db
    .prepare("SELECT id, role FROM bot_messages WHERE id = ?1")
    .bind(messageId)
    .first<{ id: string; role: string }>();

  if (!message) {
    return c.json({ error: { code: "NOT_FOUND", message: "Message not found" } }, 404);
  }

  if (message.role !== "assistant") {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Feedback can only be given to assistant messages",
        },
      },
      400,
    );
  }

  const id = generateUlid();
  await db
    .prepare(
      "INSERT INTO bot_feedback (id, message_id, rating, correction) VALUES (?1, ?2, ?3, ?4)",
    )
    .bind(id, messageId, body.rating, body.correction ?? null)
    .run();

  const row = await db
    .prepare(
      "SELECT id, message_id, rating, correction, created_at FROM bot_feedback WHERE id = ?1",
    )
    .bind(id)
    .first<{
      id: string;
      message_id: string;
      rating: number;
      correction: string | null;
      created_at: string;
    }>();

  return c.json(
    {
      data: {
        id: (row as { id: string }).id,
        messageId: (row as { message_id: string }).message_id,
        rating: (row as { rating: number }).rating,
        correction: (row as { correction: string | null }).correction,
        createdAt: (row as { created_at: string }).created_at,
      },
    },
    201,
  );
});
