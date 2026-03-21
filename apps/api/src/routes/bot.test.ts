import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";

async function createConversation(participant = "self") {
  return app.request(
    "/bot/conversations",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participant }),
    },
    env,
  );
}

async function sendMessage(conversationId: string, content: string) {
  return app.request(
    `/bot/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    },
    env,
  );
}

describe("bot API", () => {
  describe("POST /bot/conversations", () => {
    it("should create a conversation and return 201", async () => {
      const res = await createConversation();
      expect(res.status).toBe(201);

      const json = await res.json<{ data: { id: string; participant: string; endedAt: null } }>();
      expect(json.data.participant).toBe("self");
      expect(json.data.endedAt).toBeNull();
    });

    it("should accept recipient participant format", async () => {
      const res = await createConversation("recipient:01JQXK5V0G3M8N2P4R6T8W0Y1Z");
      expect(res.status).toBe(201);

      const json = await res.json<{ data: { participant: string } }>();
      expect(json.data.participant).toBe("recipient:01JQXK5V0G3M8N2P4R6T8W0Y1Z");
    });

    it("should return 400 for missing participant", async () => {
      const res = await app.request(
        "/bot/conversations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
        env,
      );
      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid participant format", async () => {
      const res = await createConversation("invalid");
      expect(res.status).toBe(400);
    });
  });

  describe("GET /bot/conversations", () => {
    it("should return list of conversations", async () => {
      await createConversation();

      const res = await app.request("/bot/conversations", {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { id: string }[] }>();
      expect(json.data.length).toBeGreaterThan(0);
    });
  });

  describe("POST /bot/conversations/:id/messages", () => {
    it("should send a message and receive placeholder response", async () => {
      const createRes = await createConversation();
      const created = await createRes.json<{ data: { id: string } }>();

      const res = await sendMessage(created.data.id, "こんにちは");
      expect(res.status).toBe(201);

      const json = await res.json<{
        data: {
          userMessage: { role: string; content: string };
          assistantMessage: { role: string; content: string };
        };
      }>();
      expect(json.data.userMessage.role).toBe("user");
      expect(json.data.userMessage.content).toBe("こんにちは");
      expect(json.data.assistantMessage.role).toBe("assistant");
    });

    it("should return 404 for non-existent conversation", async () => {
      const res = await sendMessage("01JQXK5V0G3M8N2P4R6T8W0Y1Z", "test");
      expect(res.status).toBe(404);
    });

    it("should return 400 for empty content", async () => {
      const createRes = await createConversation();
      const created = await createRes.json<{ data: { id: string } }>();

      const res = await app.request(
        `/bot/conversations/${created.data.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "" }),
        },
        env,
      );
      expect(res.status).toBe(400);
    });

    it("should return 400 for ended conversation", async () => {
      const createRes = await createConversation();
      const created = await createRes.json<{ data: { id: string } }>();

      // 会話を終了させる
      await env.USER_DB.exec(
        `UPDATE bot_conversations SET ended_at = datetime('now') WHERE id = '${created.data.id}'`,
      );

      const res = await sendMessage(created.data.id, "test");
      expect(res.status).toBe(400);
    });
  });

  describe("GET /bot/conversations/:id/messages", () => {
    it("should return messages for a conversation", async () => {
      const createRes = await createConversation();
      const created = await createRes.json<{ data: { id: string } }>();

      await sendMessage(created.data.id, "テストメッセージ");

      const res = await app.request(`/bot/conversations/${created.data.id}/messages`, {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { role: string }[] }>();
      expect(json.data.length).toBe(2); // user + assistant
      expect(json.data[0].role).toBe("user");
      expect(json.data[1].role).toBe("assistant");
    });

    it("should return 404 for non-existent conversation", async () => {
      const res = await app.request(
        "/bot/conversations/01JQXK5V0G3M8N2P4R6T8W0Y1Z/messages",
        {},
        env,
      );
      expect(res.status).toBe(404);
    });
  });

  describe("POST /bot/messages/:id/feedback", () => {
    it("should create feedback for assistant message", async () => {
      const createRes = await createConversation();
      const created = await createRes.json<{ data: { id: string } }>();

      const msgRes = await sendMessage(created.data.id, "フィードバックテスト");
      const msgs = await msgRes.json<{
        data: { assistantMessage: { id: string } };
      }>();

      const res = await app.request(
        `/bot/messages/${msgs.data.assistantMessage.id}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: 2, correction: "もっとカジュアルに" }),
        },
        env,
      );
      expect(res.status).toBe(201);

      const json = await res.json<{
        data: { rating: number; correction: string; messageId: string };
      }>();
      expect(json.data.rating).toBe(2);
      expect(json.data.correction).toBe("もっとカジュアルに");
      expect(json.data.messageId).toBe(msgs.data.assistantMessage.id);
    });

    it("should return 400 for invalid rating", async () => {
      const createRes = await createConversation();
      const created = await createRes.json<{ data: { id: string } }>();

      const msgRes = await sendMessage(created.data.id, "test");
      const msgs = await msgRes.json<{
        data: { assistantMessage: { id: string } };
      }>();

      const res = await app.request(
        `/bot/messages/${msgs.data.assistantMessage.id}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: 5 }),
        },
        env,
      );
      expect(res.status).toBe(400);
    });

    it("should return 400 for feedback on user message", async () => {
      const createRes = await createConversation();
      const created = await createRes.json<{ data: { id: string } }>();

      const msgRes = await sendMessage(created.data.id, "test");
      const msgs = await msgRes.json<{
        data: { userMessage: { id: string } };
      }>();

      const res = await app.request(
        `/bot/messages/${msgs.data.userMessage.id}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: 1 }),
        },
        env,
      );
      expect(res.status).toBe(400);
    });

    it("should return 404 for non-existent message", async () => {
      const res = await app.request(
        "/bot/messages/01JQXK5V0G3M8N2P4R6T8W0Y1Z/feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: 1 }),
        },
        env,
      );
      expect(res.status).toBe(404);
    });
  });
});
