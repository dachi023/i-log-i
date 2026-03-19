import { Hono } from "hono";
import type { AppEnv } from "../types";

export const questionRoutes = new Hono<AppEnv>();

// GET /questions/next
questionRoutes.get("/next", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /questions/:id/answer
questionRoutes.post("/:id/answer", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /questions/:id/skip
questionRoutes.post("/:id/skip", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /answers
questionRoutes.get("/answers", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
