import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import app from "../index";

// テスト用の質問をシード
async function seedQuestion(id: string, category: string, questionText: string, priority = 0) {
  await env.USER_DB.exec(
    `INSERT OR IGNORE INTO questions (id, category, question_text, answer_type, priority) VALUES ('${id}', '${category}', '${questionText}', 'text', ${priority})`,
  );
}

describe("questions API", () => {
  const Q1_ID = "01JR000000000000000000Q001";
  const Q2_ID = "01JR000000000000000000Q002";
  const Q3_ID = "01JR000000000000000000Q003";

  beforeAll(async () => {
    await seedQuestion(Q1_ID, "setup", "あなたの価値観は？", 1);
    await seedQuestion(Q2_ID, "daily", "今日の気分は？", 10);
    await seedQuestion(Q3_ID, "setup", "人生の転機は？", 2);
  });

  describe("GET /questions", () => {
    it("should return all questions sorted by priority", async () => {
      const res = await app.request("/questions", {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { id: string; priority: number }[] }>();
      expect(json.data.length).toBeGreaterThanOrEqual(3);
      // priorityの昇順
      for (let i = 1; i < json.data.length; i++) {
        expect(json.data[i].priority).toBeGreaterThanOrEqual(json.data[i - 1].priority);
      }
    });

    it("should filter by category", async () => {
      const res = await app.request("/questions?category=setup", {}, env);
      const json = await res.json<{ data: { category: string }[] }>();
      for (const q of json.data) {
        expect(q.category).toBe("setup");
      }
    });
  });

  describe("POST /questions/:id/answer", () => {
    it("should create an answer and return 201", async () => {
      const res = await app.request(
        `/questions/${Q1_ID}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answerText: "家族を大切にすること" }),
        },
        env,
      );
      expect(res.status).toBe(201);

      const json = await res.json<{
        data: { questionId: string; answerText: string };
      }>();
      expect(json.data.questionId).toBe(Q1_ID);
      expect(json.data.answerText).toBe("家族を大切にすること");
    });

    it("should return 404 for non-existent question", async () => {
      const res = await app.request(
        "/questions/01JQXK5V0G3M8N2P4R6T8W0Y1Z/answer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answerText: "テスト" }),
        },
        env,
      );
      expect(res.status).toBe(404);
    });

    it("should return 400 for empty answerText", async () => {
      const res = await app.request(
        `/questions/${Q1_ID}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answerText: "" }),
        },
        env,
      );
      expect(res.status).toBe(400);
    });
  });

  describe("GET /questions/answers", () => {
    it("should return list of answers", async () => {
      // 回答を2件作成
      await app.request(
        `/questions/${Q1_ID}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answerText: "テスト回答1" }),
        },
        env,
      );
      await app.request(
        `/questions/${Q2_ID}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answerText: "元気です" }),
        },
        env,
      );

      const res = await app.request("/questions/answers", {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { answerText: string }[] }>();
      expect(json.data.length).toBeGreaterThanOrEqual(2);
    });
  });
});
