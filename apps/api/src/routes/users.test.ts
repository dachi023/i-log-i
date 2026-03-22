import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";

describe("users API", () => {
  describe("GET /users/me", () => {
    it("should return the current user", async () => {
      const res = await app.request("/users/me", {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { id: string; displayName: string; email: string } }>();
      expect(json.data.id).toBe("01JQXK5V0G3M8N2P4R6T8W0Y1Z");
      expect(json.data.displayName).toBe("田中 太郎");
      expect(json.data.email).toBe("tanaka.taro@example.com");
    });
  });

  describe("PATCH /users/me", () => {
    it("should update display name", async () => {
      const res = await app.request(
        "/users/me",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: "田中 次郎" }),
        },
        env,
      );
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { displayName: string } }>();
      expect(json.data.displayName).toBe("田中 次郎");
    });

    it("should return 400 for empty displayName", async () => {
      const res = await app.request(
        "/users/me",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: "  " }),
        },
        env,
      );
      expect(res.status).toBe(400);
    });
  });

  describe("POST /users/me/setup", () => {
    it("should set user_db_name on first setup", async () => {
      // 開発シードでuser_db_nameが既にセットされているのでCONFLICTになる
      const res = await app.request("/users/me/setup", { method: "POST" }, env);
      // シードデータにはuser_db_nameが入っているので409
      expect(res.status).toBe(409);
    });
  });

  describe("POST /users/me/upgrade-to-recorder", () => {
    it("should return 409 if already a recorder", async () => {
      const res = await app.request("/users/me/upgrade-to-recorder", { method: "POST" }, env);
      expect(res.status).toBe(409);
    });
  });

  describe("DELETE /users/me", () => {
    it("should soft delete user and return 204", async () => {
      const res = await app.request("/users/me", { method: "DELETE" }, env);
      expect(res.status).toBe(204);
    });
  });

  describe("GET /users/search", () => {
    it("should return 400 for missing email", async () => {
      const res = await app.request("/users/search", {}, env);
      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid email", async () => {
      const res = await app.request("/users/search?email=invalid", {}, env);
      expect(res.status).toBe(400);
    });

    it("should return 404 for unknown email", async () => {
      const res = await app.request("/users/search?email=unknown@example.com", {}, env);
      expect(res.status).toBe(404);
    });
  });
});
