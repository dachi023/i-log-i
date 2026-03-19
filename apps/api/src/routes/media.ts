import { Hono } from "hono";
import type { AppEnv } from "../types";

export const mediaRoutes = new Hono<AppEnv>();

// POST /media/upload-url
mediaRoutes.post("/upload-url", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /media
mediaRoutes.post("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /media/:id
mediaRoutes.get("/:id", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /media/:id/download-url
mediaRoutes.get("/:id/download-url", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// DELETE /media/:id
mediaRoutes.delete("/:id", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
