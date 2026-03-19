import { Hono } from "hono";
import type { AppEnv } from "../types";

export const authRoutes = new Hono<AppEnv>();

// POST /auth/oauth/google
authRoutes.post("/oauth/google", async (c) => {
  // TODO: Google OAuthコールバック
  return c.json({ message: "not implemented" }, 501);
});

// POST /auth/oauth/apple
authRoutes.post("/oauth/apple", async (c) => {
  // TODO: Apple OAuthコールバック
  return c.json({ message: "not implemented" }, 501);
});

// POST /auth/refresh
authRoutes.post("/refresh", async (c) => {
  // TODO: トークンリフレッシュ
  return c.json({ message: "not implemented" }, 501);
});

// DELETE /auth/logout
authRoutes.delete("/logout", async (c) => {
  // TODO: ログアウト
  return c.json({ message: "not implemented" }, 501);
});
