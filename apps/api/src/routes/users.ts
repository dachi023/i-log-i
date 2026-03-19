import { Hono } from "hono";
import type { AppEnv } from "../types";

export const userRoutes = new Hono<AppEnv>();

// GET /users/me
userRoutes.get("/me", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// PATCH /users/me
userRoutes.patch("/me", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /users/me/setup
userRoutes.post("/me/setup", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /users/me/upgrade-to-recorder
userRoutes.post("/me/upgrade-to-recorder", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// DELETE /users/me
userRoutes.delete("/me", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /users/search?email={email}
userRoutes.get("/search", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
