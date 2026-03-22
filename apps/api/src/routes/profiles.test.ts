import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";

async function regenerateProfile() {
  return app.request("/profile/regenerate", { method: "POST" }, env);
}

describe("profiles API", () => {
  describe("GET /profile", () => {
    it("should return null when no profiles exist", async () => {
      const res = await app.request("/profile", {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: null }>();
      expect(json.data).toBeNull();
    });
  });

  describe("POST /profile/regenerate", () => {
    it("should create a new profile version", async () => {
      const res = await regenerateProfile();
      expect(res.status).toBe(201);

      const json = await res.json<{
        data: { id: string; version: number; sourceSummary: string };
      }>();
      expect(json.data.version).toBeGreaterThanOrEqual(1);
      expect(json.data.sourceSummary).toContain("日記");
      expect(json.data.sourceSummary).toContain("回答");
    });

    it("should increment version on subsequent calls", async () => {
      await regenerateProfile();
      const res = await regenerateProfile();
      const json = await res.json<{ data: { version: number } }>();
      // 2つ目は前のバージョン+1
      expect(json.data.version).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /profile (after regenerate)", () => {
    it("should return the latest profile", async () => {
      await regenerateProfile();
      await regenerateProfile();

      const res = await app.request("/profile", {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { version: number } }>();
      expect(json.data).not.toBeNull();
      expect(json.data.version).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /profile/versions", () => {
    it("should return all versions sorted DESC", async () => {
      await regenerateProfile();
      await regenerateProfile();

      const res = await app.request("/profile/versions", {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { version: number }[] }>();
      expect(json.data.length).toBeGreaterThanOrEqual(2);
      // DESC順
      for (let i = 1; i < json.data.length; i++) {
        expect(json.data[i].version).toBeLessThan(json.data[i - 1].version);
      }
    });
  });

  describe("GET /profile/versions/:version", () => {
    it("should return a specific version", async () => {
      await regenerateProfile();

      const res = await app.request("/profile/versions/1", {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { version: number } }>();
      expect(json.data.version).toBe(1);
    });

    it("should return 400 for invalid version", async () => {
      const res = await app.request("/profile/versions/abc", {}, env);
      expect(res.status).toBe(400);
    });

    it("should return 404 for non-existent version", async () => {
      const res = await app.request("/profile/versions/999", {}, env);
      expect(res.status).toBe(404);
    });
  });

  describe("profile overrides", () => {
    it("PUT should create an override", async () => {
      const res = await app.request(
        "/profile/overrides/speech_style.tone",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overrideValue: "カジュアル", reason: "もっとカジュアルです" }),
        },
        env,
      );
      expect(res.status).toBe(200);

      const json = await res.json<{
        data: { fieldPath: string; overrideValue: string; reason: string };
      }>();
      expect(json.data.fieldPath).toBe("speech_style.tone");
      expect(json.data.overrideValue).toBe("カジュアル");
      expect(json.data.reason).toBe("もっとカジュアルです");
    });

    it("PUT should update an existing override", async () => {
      // まず作成
      await app.request(
        "/profile/overrides/speech_style.tone",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overrideValue: "カジュアル" }),
        },
        env,
      );

      // 更新
      const res = await app.request(
        "/profile/overrides/speech_style.tone",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overrideValue: "フォーマル" }),
        },
        env,
      );
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { overrideValue: string; reason: null } }>();
      expect(json.data.overrideValue).toBe("フォーマル");
      expect(json.data.reason).toBeNull();
    });

    it("GET should return overrides list", async () => {
      // まず作成
      await app.request(
        "/profile/overrides/speech_style.tone",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overrideValue: "カジュアル" }),
        },
        env,
      );

      const res = await app.request("/profile/overrides", {}, env);
      expect(res.status).toBe(200);

      const json = await res.json<{ data: { fieldPath: string }[] }>();
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data.some((o) => o.fieldPath === "speech_style.tone")).toBe(true);
    });

    it("PUT should return 400 without overrideValue", async () => {
      const res = await app.request(
        "/profile/overrides/test",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
        env,
      );
      expect(res.status).toBe(400);
    });

    it("DELETE should remove an override", async () => {
      // まず作成
      await app.request(
        "/profile/overrides/speech_style.tone",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overrideValue: "カジュアル" }),
        },
        env,
      );

      const res = await app.request(
        "/profile/overrides/speech_style.tone",
        { method: "DELETE" },
        env,
      );
      expect(res.status).toBe(204);
    });

    it("DELETE should return 404 for non-existent override", async () => {
      const res = await app.request("/profile/overrides/nonexistent", { method: "DELETE" }, env);
      expect(res.status).toBe(404);
    });
  });
});
