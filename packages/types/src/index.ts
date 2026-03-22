// ============================================================
// ユーザー・認証
// ============================================================

export type UserRole = "recorder" | "receiver" | "both";
export type UserStatus = "active" | "triggered" | "deleted";

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  userDbName: string | null;
  status: UserStatus;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AuthProvider = "google" | "apple";

export interface AuthProviderRecord {
  id: string;
  userId: string;
  provider: AuthProvider;
  providerUid: string;
  createdAt: string;
}

// ============================================================
// 記録
// ============================================================

export interface Entry {
  id: string;
  body: string | null;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = "image" | "video" | "audio";

export interface Media {
  id: string;
  entryId: string | null;
  mediaType: MediaType;
  r2Key: string;
  fileName: string | null;
  fileSize: number | null;
  duration: number | null;
  mimeType: string | null;
  caption: string | null;
  createdAt: string;
}

export interface PersonTag {
  id: string;
  name: string;
  relationship: string | null;
  notes: string | null;
  createdAt: string;
}

// ============================================================
// パーソナリティ
// ============================================================

export type QuestionCategory = "setup" | "daily" | "scenario" | "supplemental";
export type QuestionAnswerType = "text" | "select" | "scale";

export interface Question {
  id: string;
  category: QuestionCategory;
  subcategory: string | null;
  questionText: string;
  answerType: QuestionAnswerType;
  options: string[] | null;
  scaleMin: number | null;
  scaleMax: number | null;
  scaleLabels: [string, string] | null;
  isSystem: boolean;
  priority: number;
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  answerText: string;
  answeredAt: string;
}

// ============================================================
// プロファイル
// ============================================================

export interface Profile {
  id: string;
  version: number;
  speechStyle: unknown;
  values: unknown;
  personalityTraits: unknown;
  humorStyle: unknown;
  emotionalPatterns: unknown;
  relationships: unknown;
  lifeStory: unknown;
  confidenceScores: unknown;
  sourceSummary: string | null;
  createdAt: string;
}

export interface ProfileOverride {
  id: string;
  fieldPath: string;
  overrideValue: string;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// AIボット
// ============================================================

export type BotParticipant = "self" | `recipient:${string}`;
export type MessageRole = "user" | "assistant";

export interface BotConversation {
  id: string;
  participant: BotParticipant;
  startedAt: string;
  endedAt: string | null;
}

export interface BotMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  profileVersion: number | null;
  createdAt: string;
}

export interface BotFeedback {
  id: string;
  messageId: string;
  rating: 1 | 2 | 3;
  correction: string | null;
  createdAt: string;
}

// ============================================================
// 受取人・第三者
// ============================================================

export type InvitationStatus = "invited" | "accepted" | "declined";

export interface Recipient {
  id: string;
  ownerId: string;
  recipientUserId: string;
  relationship: string | null;
  message: string | null;
  status: InvitationStatus;
  invitedAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ScopeType = "all" | "tag_based" | "date_range" | "manual";

export interface RecipientPermission {
  id: string;
  recipientId: string;
  scopeType: ScopeType;
  scopeValue: unknown;
  allowBot: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ShareType = "message" | "entry" | "media";

export interface LivingShare {
  id: string;
  recipientId: string;
  shareType: ShareType;
  referenceId: string | null;
  content: string | null;
  isRead: boolean;
  sharedAt: string;
}

export interface Trustee {
  id: string;
  ownerId: string;
  trusteeUserId: string;
  status: InvitationStatus;
  invitedAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

// ============================================================
// トリガー・生存確認
// ============================================================

export type TriggerStatus =
  | "standby"
  | "escalated_to_trustees"
  | "escalated_to_recipients"
  | "grace_period"
  | "triggered"
  | "cancelled";

export type TriggerByType = "trustee" | "recipient";

export interface Trigger {
  id: string;
  ownerId: string;
  status: TriggerStatus;
  triggeredByType: TriggerByType | null;
  triggeredById: string | null;
  gracePeriodDays: number | null;
  graceStartedAt: string | null;
  graceExpiresAt: string | null;
  triggeredAt: string | null;
  cancelledAt: string | null;
  escalatedToTrusteesAt: string | null;
  escalatedToRecipientsAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LifeCheckSettings {
  id: string;
  ownerId: string;
  checkIntervalDays: number;
  maxMissedChecks: number;
  trusteeWaitDays: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LifeCheck {
  id: string;
  ownerId: string;
  sentAt: string;
  respondedAt: string | null;
  checkMethod: string;
  createdAt: string;
}

// ============================================================
// 通知・デバイス
// ============================================================

export type Platform = "ios" | "android";

export interface DeviceToken {
  id: string;
  userId: string;
  platform: Platform;
  token: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// API共通
// ============================================================

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
}

// ============================================================
// LLM抽象化
// ============================================================

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateTextParams {
  systemPrompt: string;
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateTextResult {
  text: string;
  usage: { inputTokens: number; outputTokens: number };
}
