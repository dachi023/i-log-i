import { Hono } from "hono";
import type { AppEnv } from "../types";

export const trusteeRoutes = new Hono<AppEnv>();

// GET /trustees
trusteeRoutes.get("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /trustees
trusteeRoutes.post("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// DELETE /trustees/:id
trusteeRoutes.delete("/:id", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /trustee-duties
trusteeRoutes.get("/duties", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /trustee-duties/:id/accept
trusteeRoutes.post("/duties/:id/accept", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /trustee-duties/:id/decline
trusteeRoutes.post("/duties/:id/decline", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// POST /trustee-duties/:id/trigger
trusteeRoutes.post("/duties/:id/trigger", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
