import type {
  Answer,
  BotConversation,
  BotMessage,
  BotParticipant,
  Entry,
  MessageRole,
  PersonTag,
  Profile,
  Question,
  QuestionAnswerType,
  QuestionCategory,
  User,
  UserRole,
  UserStatus,
} from "@i-log-i/types";

export interface EntryRow {
  id: string;
  body: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export function mapEntryRow(row: EntryRow): Entry {
  return {
    id: row.id,
    body: row.body,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface UserRow {
  id: string;
  display_name: string;
  email: string;
  role: string;
  user_db_name: string | null;
  status: string;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    role: row.role as UserRole,
    userDbName: row.user_db_name,
    status: row.status as UserStatus,
    lastActiveAt: row.last_active_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface PersonTagRow {
  id: string;
  name: string;
  relationship: string | null;
  notes: string | null;
  created_at: string;
}

export function mapPersonTagRow(row: PersonTagRow): PersonTag {
  return {
    id: row.id,
    name: row.name,
    relationship: row.relationship,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export interface QuestionRow {
  id: string;
  category: string;
  subcategory: string | null;
  question_text: string;
  answer_type: string;
  options: string | null;
  scale_min: number | null;
  scale_max: number | null;
  scale_labels: string | null;
  is_system: number;
  priority: number;
  created_at: string;
}

export function mapQuestionRow(row: QuestionRow): Question {
  return {
    id: row.id,
    category: row.category as QuestionCategory,
    subcategory: row.subcategory,
    questionText: row.question_text,
    answerType: row.answer_type as QuestionAnswerType,
    options: row.options ? JSON.parse(row.options) : null,
    scaleMin: row.scale_min,
    scaleMax: row.scale_max,
    scaleLabels: row.scale_labels ? JSON.parse(row.scale_labels) : null,
    isSystem: row.is_system === 1,
    priority: row.priority,
    createdAt: row.created_at,
  };
}

export interface AnswerRow {
  id: string;
  question_id: string;
  answer_text: string;
  answered_at: string;
}

export function mapAnswerRow(row: AnswerRow): Answer {
  return {
    id: row.id,
    questionId: row.question_id,
    answerText: row.answer_text,
    answeredAt: row.answered_at,
  };
}

export interface ProfileRow {
  id: string;
  version: number;
  speech_style: string | null;
  values_data: string | null;
  personality_traits: string | null;
  humor_style: string | null;
  emotional_patterns: string | null;
  relationships: string | null;
  life_story: string | null;
  confidence_scores: string | null;
  source_summary: string | null;
  created_at: string;
}

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    version: row.version,
    speechStyle: row.speech_style ? JSON.parse(row.speech_style) : null,
    values: row.values_data ? JSON.parse(row.values_data) : null,
    personalityTraits: row.personality_traits ? JSON.parse(row.personality_traits) : null,
    humorStyle: row.humor_style ? JSON.parse(row.humor_style) : null,
    emotionalPatterns: row.emotional_patterns ? JSON.parse(row.emotional_patterns) : null,
    relationships: row.relationships ? JSON.parse(row.relationships) : null,
    lifeStory: row.life_story ? JSON.parse(row.life_story) : null,
    confidenceScores: row.confidence_scores ? JSON.parse(row.confidence_scores) : null,
    sourceSummary: row.source_summary,
    createdAt: row.created_at,
  };
}

export interface BotConversationRow {
  id: string;
  participant: string;
  started_at: string;
  ended_at: string | null;
}

export function mapBotConversationRow(row: BotConversationRow): BotConversation {
  return {
    id: row.id,
    participant: row.participant as BotParticipant,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}

export interface BotMessageRow {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  profile_version: number | null;
  created_at: string;
}

export function mapBotMessageRow(row: BotMessageRow): BotMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role as MessageRole,
    content: row.content,
    profileVersion: row.profile_version,
    createdAt: row.created_at,
  };
}
