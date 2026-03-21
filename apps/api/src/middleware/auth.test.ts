import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";

describe("auth middleware", () => {
  it("should skip auth for /health", async () => {
    const res = await app.request("/health", {}, env);
    expect(res.status).toBe(200);
  });

  it("should set dev user context in development mode", async () => {
    const res = await app.request("/entries", {}, env);
    // development環境ではauth不要で200が返る
    expect(res.status).not.toBe(401);
  });
});
