import { Hono } from "hono";
import type { AppEnv } from "../types";

export const lifeCheckRoutes = new Hono<AppEnv>();

// GET /life-check/settings
lifeCheckRoutes.get("/settings", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// PATCH /life-check/settings
lifeCheckRoutes.patch("/settings", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /life-check/respond
lifeCheckRoutes.post("/respond", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /life-check/history
lifeCheckRoutes.get("/history", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
