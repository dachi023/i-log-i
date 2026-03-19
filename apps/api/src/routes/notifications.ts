import { Hono } from "hono";
import type { AppEnv } from "../types";

export const notificationRoutes = new Hono<AppEnv>();

// POST /notifications/register-device
notificationRoutes.post("/register-device", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// DELETE /notifications/unregister-device
notificationRoutes.delete("/unregister-device", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// GET /notifications
notificationRoutes.get("/", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});

// PATCH /notifications/:id/read
notificationRoutes.patch("/:id/read", async (c) => {
  return c.json({ message: "not implemented" }, 501);
});
