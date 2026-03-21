import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";

async function createTag(name: string, relationship?: string) {
  return app.request(
    "/person-tags",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, relationship }),
    },
    env,
  );
}

describe("person-tags API", () => {
  describe("POST /person-tags", () => {
    it("should create a tag and return 201", async () => {
      const res = await createTag("田中 美咲", "妻");
      expect(res.status).toBe(201);

      const json = await res.json<{ data: { name: string; relationship: string } }>();
      expect(json.data.name).toBe("田中 美咲");
      expect(json.data.relationship).toBe("妻");
    });

    it("should return 400 for missing name", async () => {
      const res = await app.request(
        "/person-tags",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
        env,
      );
      expect(res.status).toBe(400);
    });
  });

  describe("GET /person-tags", () => {
    it("should return list of tags", async () => {
      await createTag("テスト太郎");
      const res = await app.request("/person-tags", {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { name: string }[] }>();
      expect(json.data.length).toBeGreaterThan(0);
    });
  });

  describe("PATCH /person-tags/:id", () => {
    it("should update a tag", async () => {
      const createRes = await createTag("更新前");
      const created = await createRes.json<{ data: { id: string } }>();

      const res = await app.request(
        `/person-tags/${created.data.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "更新後", relationship: "友人" }),
        },
        env,
      );
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { name: string; relationship: string } }>();
      expect(json.data.name).toBe("更新後");
      expect(json.data.relationship).toBe("友人");
    });

    it("should return 404 for non-existent tag", async () => {
      const res = await app.request(
        "/person-tags/01JQXK5V0G3M8N2P4R6T8W0Y1Z",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "test" }),
        },
        env,
      );
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /person-tags/:id", () => {
    it("should delete a tag and return 204", async () => {
      const createRes = await createTag("削除用");
      const created = await createRes.json<{ data: { id: string } }>();

      const res = await app.request(`/person-tags/${created.data.id}`, { method: "DELETE" }, env);
      expect(res.status).toBe(204);
    });

    it("should return 404 for non-existent tag", async () => {
      const res = await app.request(
        "/person-tags/01JQXK5V0G3M8N2P4R6T8W0Y1Z",
        { method: "DELETE" },
        env,
      );
      expect(res.status).toBe(404);
    });
  });
});
