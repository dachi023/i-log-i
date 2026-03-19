import { Hono } from "hono";
import type { AppEnv } from "../types";

export const personTagRoutes = new Hono<AppEnv>();

// GET /person-tags
personTagRoutes.get("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /person-tags
personTagRoutes.post("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// PATCH /person-tags/:id
personTagRoutes.patch("/:id", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// DELETE /person-tags/:id
personTagRoutes.delete("/:id", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
