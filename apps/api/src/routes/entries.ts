import { Hono } from "hono";
import type { AppEnv } from "../types";

export const entryRoutes = new Hono<AppEnv>();

// GET /entries
entryRoutes.get("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /entries/:id
entryRoutes.get("/:id", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /entries
entryRoutes.post("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// PATCH /entries/:id
entryRoutes.patch("/:id", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// DELETE /entries/:id
entryRoutes.delete("/:id", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /entries/search?q={query}
entryRoutes.get("/search", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
