import type { Context, Next } from "hono";
import type { AppEnv } from "../types";

const DEV_USER = {
  userId: "01JQXK5V0G3M8N2P4R6T8W0Y1Z",
  userRole: "recorder",
  userDbName: "user_01JQXK5V0G3M8N2P4R6T8W0Y1Z",
} as const;

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const path = c.req.path;
  if (path === "/health" || path.startsWith("/auth")) {
    return next();
  }

  if (c.env.ENVIRONMENT === "development") {
    c.set("userId", DEV_USER.userId);
    c.set("userRole", DEV_USER.userRole);
    c.set("userDbName", DEV_USER.userDbName);
    return next();
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Missing or invalid token" } }, 401);
  }

  // TODO: JWT検証を実装
  return c.json(
    { error: { code: "NOT_IMPLEMENTED", message: "JWT verification not implemented" } },
    501,
  );
}
