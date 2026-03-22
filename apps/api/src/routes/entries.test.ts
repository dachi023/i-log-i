import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../index";

async function createEntry(body: string, recordedAt: string) {
  const res = await app.request(
    "/entries",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, recordedAt }),
    },
    env,
  );
  return res;
}

describe("entries API", () => {
  describe("POST /entries", () => {
    it("should create an entry and return 201", async () => {
      const res = await createEntry("テスト記録", "2026-03-21T00:00:00.000Z");
      expect(res.status).toBe(201);

      const json = await res.json<{ data: { id: string; body: string; recordedAt: string } }>();
      expect(json.data.body).toBe("テスト記録");
      expect(json.data.recordedAt).toBe("2026-03-21T00:00:00.000Z");
      expect(json.data.id).toHaveLength(26);
    });

    it("should return 400 when recordedAt is missing", async () => {
      const res = await app.request(
        "/entries",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: "テスト" }),
        },
        env,
      );
      expect(res.status).toBe(400);
    });

    it("should allow null body", async () => {
      const res = await createEntry(null as unknown as string, "2026-03-21T00:00:00.000Z");
      expect(res.status).toBe(201);
    });
  });

  describe("GET /entries", () => {
    it("should return empty list when no entries exist", async () => {
      const res = await app.request("/entries", {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: unknown[]; cursor: string | null; hasMore: boolean }>();
      expect(json.data).toBeInstanceOf(Array);
      expect(json.hasMore).toBe(false);
      expect(json.cursor).toBeNull();
    });

    it("should return entries sorted by recorded_at DESC", async () => {
      await createEntry("古い記録", "2026-01-01T00:00:00.000Z");
      await createEntry("新しい記録", "2026-03-01T00:00:00.000Z");

      const res = await app.request("/entries", {}, env);
      const json = await res.json<{ data: { body: string }[] }>();
      expect(json.data[0].body).toBe("新しい記録");
      expect(json.data[1].body).toBe("古い記録");
    });

    it("should support cursor-based pagination", async () => {
      // 5件作成
      for (let i = 0; i < 5; i++) {
        await createEntry(`記録${i}`, `2026-03-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`);
      }

      // limit=3で取得
      const res1 = await app.request("/entries?limit=3", {}, env);
      const json1 = await res1.json<{
        data: { body: string }[];
        cursor: string | null;
        hasMore: boolean;
      }>();
      expect(json1.data).toHaveLength(3);
      expect(json1.hasMore).toBe(true);
      expect(json1.cursor).toBeTruthy();

      // 次のページ
      const res2 = await app.request(`/entries?limit=3&cursor=${json1.cursor}`, {}, env);
      const json2 = await res2.json<{
        data: { body: string }[];
        cursor: string | null;
        hasMore: boolean;
      }>();
      expect(json2.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /entries/:id", () => {
    it("should return an entry by id", async () => {
      const createRes = await createEntry("取得テスト", "2026-03-21T00:00:00.000Z");
      const created = await createRes.json<{ data: { id: string } }>();

      const res = await app.request(`/entries/${created.data.id}`, {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { body: string } }>();
      expect(json.data.body).toBe("取得テスト");
    });

    it("should return 404 for non-existent entry", async () => {
      const res = await app.request("/entries/01JQXK5V0G3M8N2P4R6T8W0Y1Z", {}, env);
      expect(res.status).toBe(404);
    });

    it("should return 400 for invalid ID format", async () => {
      const res = await app.request("/entries/invalid-id", {}, env);
      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /entries/:id", () => {
    it("should update an entry", async () => {
      const createRes = await createEntry("更新前", "2026-03-21T00:00:00.000Z");
      const created = await createRes.json<{ data: { id: string } }>();

      const res = await app.request(
        `/entries/${created.data.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: "更新後" }),
        },
        env,
      );
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { body: string } }>();
      expect(json.data.body).toBe("更新後");
    });

    it("should return 404 for non-existent entry", async () => {
      const res = await app.request(
        "/entries/01JQXK5V0G3M8N2P4R6T8W0Y1Z",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: "test" }),
        },
        env,
      );
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /entries/:id", () => {
    it("should delete an entry and return 204", async () => {
      const createRes = await createEntry("削除テスト", "2026-03-21T00:00:00.000Z");
      const created = await createRes.json<{ data: { id: string } }>();

      const res = await app.request(`/entries/${created.data.id}`, { method: "DELETE" }, env);
      expect(res.status).toBe(204);

      // 削除後に取得すると404
      const getRes = await app.request(`/entries/${created.data.id}`, {}, env);
      expect(getRes.status).toBe(404);
    });

    it("should return 404 for non-existent entry", async () => {
      const res = await app.request(
        "/entries/01JQXK5V0G3M8N2P4R6T8W0Y1Z",
        { method: "DELETE" },
        env,
      );
      expect(res.status).toBe(404);
    });
  });

  describe("GET /entries/search", () => {
    it("should search entries by body text", async () => {
      await createEntry("桜が咲いた", "2026-03-20T00:00:00.000Z");
      await createEntry("雨が降った", "2026-03-21T00:00:00.000Z");

      const res = await app.request("/entries/search?q=桜", {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { body: string }[] }>();
      expect(json.data).toHaveLength(1);
      expect(json.data[0].body).toBe("桜が咲いた");
    });

    it("should return empty array for no matches", async () => {
      const res = await app.request("/entries/search?q=存在しない", {}, env);
      const json = await res.json<{ data: unknown[] }>();
      expect(json.data).toHaveLength(0);
    });

    it("should return empty array for empty query", async () => {
      const res = await app.request("/entries/search?q=", {}, env);
      const json = await res.json<{ data: unknown[] }>();
      expect(json.data).toHaveLength(0);
    });
  });
});
