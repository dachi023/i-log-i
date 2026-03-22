import type {
  Answer,
  BotConversation,
  BotMessage,
  Entry,
  PersonTag,
  Profile,
  Question,
  User,
} from "@i-log-i/types";
import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import React from "react";
import {
  answers as dummyAnswers,
  botConversations as dummyConversations,
  entries as dummyEntries,
  botMessages as dummyMessages,
  personTags as dummyPersonTags,
  profile as dummyProfile,
  questions as dummyQuestions,
  currentUser as dummyUser,
} from "./dummy";

export interface AppStore {
  // Auth
  isAuthenticated: boolean;
  isOnboarded: boolean;
  login: () => void;
  completeOnboarding: () => void;

  user: User;
  entries: Entry[];
  personTags: PersonTag[];
  questions: Question[];
  answers: Answer[];
  profile: Profile | null;
  botConversations: BotConversation[];
  botMessages: BotMessage[];

  // Derived
  setupQuestions: Question[];
  todaysDailyQuestion: Question | null;

  // Actions
  addEntry: (entry: { body: string | null; recordedAt: string }) => void;
  updateEntry: (id: string, updates: { body?: string | null; recordedAt?: string }) => void;
  deleteEntry: (id: string) => void;
  addAnswer: (questionId: string, answerText: string) => void;
  addBotMessage: (conversationId: string, content: string) => BotMessage[];
  createConversation: () => BotConversation;
}

const generateId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase().padStart(10, "0");
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 36)
      .toString(36)
      .toUpperCase(),
  ).join("");
  return timestamp + random;
};

const botResponses = [
  "そうですね、お気持ちよくわかります。もう少し詳しく聞かせてもらえますか？",
  "なるほど。太郎さんらしい考え方ですね。家族を大切にされている気持ちが伝わってきます。",
  "素敵なお話ですね。そういった日常の中にこそ、大切なものがあるのかもしれませんね。",
  "ありがとうございます。太郎さんがこうして思いを言葉にしてくれること、とても嬉しいです。",
  "それは大変でしたね。でも、太郎さんなら乗り越えられると思います。いつも穏やかに、一歩ずつ進まれる方ですから。",
];

const generateBotResponse = (conversationId: string): BotMessage => {
  const randomIndex = Math.floor(Math.random() * botResponses.length);
  return {
    id: generateId(),
    conversationId,
    role: "assistant",
    content: botResponses[randomIndex],
    profileVersion: 1,
    createdAt: new Date().toISOString(),
  };
};

const StoreContext = createContext<AppStore | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [entries, setEntries] = useState<Entry[]>(dummyEntries);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [botConversations, setBotConversations] = useState<BotConversation[]>(dummyConversations);
  const [botMessages, setBotMessages] = useState<BotMessage[]>(dummyMessages);

  const login = useCallback(() => setIsAuthenticated(true), []);
  const completeOnboarding = useCallback(() => setIsOnboarded(true), []);

  const addEntry = useCallback((entry: { body: string | null; recordedAt: string }) => {
    const now = new Date().toISOString();
    const newEntry: Entry = {
      id: generateId(),
      body: entry.body,
      recordedAt: entry.recordedAt,
      createdAt: now,
      updatedAt: now,
    };
    setEntries((prev) => [newEntry, ...prev]);
  }, []);

  const updateEntry = useCallback(
    (id: string, updates: { body?: string | null; recordedAt?: string }) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e,
        ),
      );
    },
    [],
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addAnswer = useCallback((questionId: string, answerText: string) => {
    const newAnswer: Answer = {
      id: generateId(),
      questionId,
      answerText,
      answeredAt: new Date().toISOString(),
    };
    setAnswers((prev) => [...prev, newAnswer]);
  }, []);

  const addBotMessage = useCallback((conversationId: string, content: string): BotMessage[] => {
    const userMessage: BotMessage = {
      id: generateId(),
      conversationId,
      role: "user",
      content,
      profileVersion: 1,
      createdAt: new Date().toISOString(),
    };
    const botResponse = generateBotResponse(conversationId);
    setBotMessages((prev) => [...prev, userMessage, botResponse]);
    return [userMessage, botResponse];
  }, []);

  const createConversation = useCallback((): BotConversation => {
    const newConversation: BotConversation = {
      id: generateId(),
      participant: "self",
      startedAt: new Date().toISOString(),
      endedAt: null,
    };
    setBotConversations((prev) => [newConversation, ...prev]);
    return newConversation;
  }, []);

  const setupQuestions = [...dummyQuestions]
    .filter((q) => q.category === "setup")
    .sort((a, b) => a.priority - b.priority);

  const todaysDailyQuestion = (() => {
    const answeredIds = new Set(answers.map((a) => a.questionId));
    const candidates = dummyQuestions.filter(
      (q) => q.category === "daily" && !answeredIds.has(q.id),
    );
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => a.priority - b.priority)[0];
  })();

  const store: AppStore = {
    isAuthenticated,
    isOnboarded,
    login,
    completeOnboarding,
    user: dummyUser,
    entries,
    personTags: dummyPersonTags,
    questions: dummyQuestions,
    answers,
    profile: dummyProfile,
    botConversations,
    botMessages,
    setupQuestions,
    todaysDailyQuestion,
    addEntry,
    updateEntry,
    deleteEntry,
    addAnswer,
    addBotMessage,
    createConversation,
  };

  return React.createElement(StoreContext.Provider, { value: store }, children);
};

export const useStore = (): AppStore => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
