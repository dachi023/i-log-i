import { Hono } from "hono";
import type { AppEnv } from "../types";

export const receivedRoutes = new Hono<AppEnv>();

// GET /received
receivedRoutes.get("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /received/:recipientId/accept
receivedRoutes.post("/:recipientId/accept", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /received/:recipientId/decline
receivedRoutes.post("/:recipientId/decline", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /received/:recipientId/shares
receivedRoutes.get("/:recipientId/shares", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /received/:recipientId/entries
receivedRoutes.get("/:recipientId/entries", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /received/:recipientId/entries/:id
receivedRoutes.get("/:recipientId/entries/:id", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /received/:recipientId/bot/conversations
receivedRoutes.post("/:recipientId/bot/conversations", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /received/:recipientId/bot/conversations/:id/messages
receivedRoutes.post("/:recipientId/bot/conversations/:id/messages", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
