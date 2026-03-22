import type {
  Answer,
  BotConversation,
  BotMessage,
  Entry,
  Profile,
  Question,
  User,
} from "@i-log-i/types";
import Constants from "expo-constants";

function getBaseUrl(): string {
  if (!__DEV__) {
    return "https://api.i-log-i.app";
  }

  // expo-constants の hostUri からExpo DevServer のホストIPを取得
  // 形式: "192.168.x.x:8081" (Expo DevServerのIP:ポート)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8787`;
  }

  // フォールバック: シミュレータ等でhostUriが取れない場合
  return "http://localhost:8787";
}

const BASE_URL = getBaseUrl();

if (__DEV__) {
  console.log("[api] BASE_URL:", BASE_URL);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    console.error(`[api] ${method} ${path} — non-JSON response (${res.status}):`, text);
    throw new ApiError(
      res.status,
      "INVALID_RESPONSE",
      `サーバーから不正なレスポンス: ${text.slice(0, 200)}`,
    );
  }

  if (!res.ok) {
    const err = (json as { error?: { code: string; message: string } }).error ?? {
      code: "UNKNOWN",
      message: "Unknown error",
    };
    throw new ApiError(res.status, err.code, err.message);
  }

  return json as T;
}

// --- Entries ---

interface PaginatedEntries {
  data: Entry[];
  cursor: string | null;
  hasMore: boolean;
}

export function getEntries(cursor?: string, limit?: number): Promise<PaginatedEntries> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return request("GET", `/entries${qs ? `?${qs}` : ""}`);
}

export function searchEntries(q: string): Promise<PaginatedEntries> {
  return request("GET", `/entries/search?q=${encodeURIComponent(q)}`);
}

export function getEntry(id: string): Promise<{ data: Entry }> {
  return request("GET", `/entries/${id}`);
}

export function createEntry(body: {
  body: string | null;
  recordedAt: string;
}): Promise<{ data: Entry }> {
  return request("POST", "/entries", body);
}

export function updateEntry(
  id: string,
  updates: { body?: string | null; recordedAt?: string },
): Promise<{ data: Entry }> {
  return request("PATCH", `/entries/${id}`, updates);
}

export function deleteEntry(id: string): Promise<void> {
  return request("DELETE", `/entries/${id}`);
}

// --- Users ---

export function getMe(): Promise<{ data: User }> {
  return request("GET", "/users/me");
}

export function updateMe(updates: { displayName?: string }): Promise<{ data: User }> {
  return request("PATCH", "/users/me", updates);
}

// --- Questions & Answers ---

export function getQuestions(category?: string): Promise<{ data: Question[] }> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return request("GET", `/questions${qs}`);
}

export function getAnswers(): Promise<{ data: Answer[] }> {
  return request("GET", "/questions/answers");
}

export function answerQuestion(questionId: string, answerText: string): Promise<{ data: Answer }> {
  return request("POST", `/questions/${questionId}/answer`, { answerText });
}

// --- Profile ---

export function getProfile(): Promise<{ data: Profile | null }> {
  return request("GET", "/profile");
}

export function regenerateProfile(): Promise<{ data: Profile }> {
  return request("POST", "/profile/regenerate");
}

// --- Bot ---

export function getConversations(): Promise<{ data: BotConversation[] }> {
  return request("GET", "/bot/conversations");
}

export function createConversation(participant = "self"): Promise<{ data: BotConversation }> {
  return request("POST", "/bot/conversations", { participant });
}

export function getMessages(conversationId: string): Promise<{ data: BotMessage[] }> {
  return request("GET", `/bot/conversations/${conversationId}/messages`);
}

export function sendMessage(
  conversationId: string,
  content: string,
): Promise<{ data: { userMessage: BotMessage; assistantMessage: BotMessage } }> {
  return request("POST", `/bot/conversations/${conversationId}/messages`, { content });
}
