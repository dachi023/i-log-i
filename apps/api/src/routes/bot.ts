import { Hono } from "hono";
import type { AppEnv } from "../types";

export const botRoutes = new Hono<AppEnv>();

// POST /bot/conversations
botRoutes.post("/conversations", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /bot/conversations
botRoutes.get("/conversations", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /bot/conversations/:id/messages
botRoutes.get("/conversations/:id/messages", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /bot/conversations/:id/messages
botRoutes.post("/conversations/:id/messages", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /bot/messages/:id/feedback
botRoutes.post("/messages/:id/feedback", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
