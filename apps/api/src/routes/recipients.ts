import { Hono } from "hono";
import type { AppEnv } from "../types";

export const recipientRoutes = new Hono<AppEnv>();

// GET /recipients
recipientRoutes.get("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /recipients
recipientRoutes.post("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /recipients/:id
recipientRoutes.get("/:id", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// PATCH /recipients/:id
recipientRoutes.patch("/:id", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// DELETE /recipients/:id
recipientRoutes.delete("/:id", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /recipients/:id/permissions
recipientRoutes.post("/:id/permissions", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// PATCH /recipients/:id/permissions
recipientRoutes.patch("/:id/permissions", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /recipients/:id/share
recipientRoutes.post("/:id/share", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /recipients/:id/shares
recipientRoutes.get("/:id/shares", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
