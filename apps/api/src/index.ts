import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRoutes } from "./routes/auth";
import { botRoutes } from "./routes/bot";
import { entryRoutes } from "./routes/entries";
import { lifeCheckRoutes } from "./routes/life-checks";
import { mediaRoutes } from "./routes/media";
import { notificationRoutes } from "./routes/notifications";
import { personTagRoutes } from "./routes/person-tags";
import { profileRoutes } from "./routes/profiles";
import { questionRoutes } from "./routes/questions";
import { receivedRoutes } from "./routes/received";
import { recipientRoutes } from "./routes/recipients";
import { triggerRoutes } from "./routes/triggers";
import { trusteeRoutes } from "./routes/trustees";
import { userRoutes } from "./routes/users";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use("*", logger());
app.use("*", cors());

app.get("/health", (c) => c.json({ status: "ok" }));

// 認証
app.route("/auth", authRoutes);

// ユーザー
app.route("/users", userRoutes);

// 記録（ユーザーDB）
app.route("/entries", entryRoutes);
app.route("/media", mediaRoutes);
app.route("/person-tags", personTagRoutes);

// パーソナリティ（ユーザーDB）
app.route("/questions", questionRoutes);

// プロファイル（ユーザーDB）
app.route("/profile", profileRoutes);

// AIボット（ユーザーDB）
app.route("/bot", botRoutes);

// 受取人（共通DB）
app.route("/recipients", recipientRoutes);
app.route("/received", receivedRoutes);

// 第三者（共通DB）
app.route("/trustees", trusteeRoutes);

// トリガー・生存確認（共通DB）
app.route("/trigger", triggerRoutes);
app.route("/life-check", lifeCheckRoutes);

// 通知
app.route("/notifications", notificationRoutes);

export default app;
