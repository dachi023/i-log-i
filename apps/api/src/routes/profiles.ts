import { Hono } from "hono";
import type { AppEnv } from "../types";

export const profileRoutes = new Hono<AppEnv>();

// GET /profile
profileRoutes.get("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /profile/versions
profileRoutes.get("/versions", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /profile/versions/:version
profileRoutes.get("/versions/:version", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /profile/regenerate
profileRoutes.post("/regenerate", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /profile/overrides
profileRoutes.get("/overrides", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// PUT /profile/overrides/:fieldPath
profileRoutes.put("/overrides/:fieldPath", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// DELETE /profile/overrides/:fieldPath
profileRoutes.delete("/overrides/:fieldPath", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
