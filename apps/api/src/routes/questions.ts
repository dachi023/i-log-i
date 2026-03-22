import { Hono } from "hono";
import type { AppEnv } from "../types";

export const questionRoutes = new Hono<AppEnv>();

// POST /questions/:id/answer
questionRoutes.post("/:id/answer", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /answers
questionRoutes.get("/answers", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
