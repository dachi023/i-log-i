import { Hono } from "hono";
import type { AppEnv } from "../types";

export const triggerRoutes = new Hono<AppEnv>();

// GET /trigger
triggerRoutes.get("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /trigger/cancel
triggerRoutes.post("/cancel", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
