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
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import React from "react";
import * as api from "../api/client";

export interface AppStore {
  // Auth
  isAuthenticated: boolean;
  isOnboarded: boolean;
  login: () => void;
  completeOnboarding: () => void;

  // Loading
  isInitializing: boolean;
  isLoadingEntries: boolean;
  isSubmitting: boolean;
  initError: string | null;

  // Data
  user: User | null;
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

  // Entry actions
  addEntry: (entry: { body: string | null; recordedAt: string }) => Promise<void>;
  updateEntry: (
    id: string,
    updates: { body?: string | null; recordedAt?: string },
  ) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  refreshEntries: () => Promise<void>;
  loadMoreEntries: () => Promise<void>;
  hasMoreEntries: boolean;

  // Question actions
  addAnswer: (questionId: string, answerText: string) => Promise<void>;

  // Bot actions
  addBotMessage: (conversationId: string, content: string) => Promise<BotMessage[]>;
  createConversation: () => Promise<BotConversation>;
  loadMessages: (conversationId: string) => Promise<void>;
}

const StoreContext = createContext<AppStore | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [personTags, setPersonTags] = useState<PersonTag[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [botConversations, setBotConversations] = useState<BotConversation[]>([]);
  const [botMessages, setBotMessages] = useState<BotMessage[]>([]);

  const [entriesCursor, setEntriesCursor] = useState<string | null>(null);
  const [hasMoreEntries, setHasMoreEntries] = useState(false);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      try {
        const [entriesRes, userRes, questionsRes, answersRes, profileRes, conversationsRes] =
          await Promise.all([
            api.getEntries(),
            api.getMe(),
            api.getQuestions(),
            api.getAnswers(),
            api.getProfile(),
            api.getConversations(),
          ]);

        setEntries(entriesRes.data);
        setEntriesCursor(entriesRes.cursor);
        setHasMoreEntries(entriesRes.hasMore);
        setUser(userRes.data);
        setQuestions(questionsRes.data);
        setAnswers(answersRes.data);
        setProfile(profileRes.data);
        setBotConversations(conversationsRes.data);
      } catch (err) {
        console.error("[store] initialize failed:", err);
        setInitError(err instanceof Error ? err.message : "初期化に失敗しました");
      } finally {
        setIsInitializing(false);
      }
    })();
  }, []);

  const login = useCallback(() => setIsAuthenticated(true), []);
  const completeOnboarding = useCallback(() => setIsOnboarded(true), []);

  // --- Entries ---

  const addEntry = useCallback(async (entry: { body: string | null; recordedAt: string }) => {
    setIsSubmitting(true);
    try {
      const res = await api.createEntry(entry);
      setEntries((prev) => [res.data, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateEntry = useCallback(
    async (id: string, updates: { body?: string | null; recordedAt?: string }) => {
      // Optimistic update
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e,
        ),
      );
      try {
        const res = await api.updateEntry(id, updates);
        setEntries((prev) => prev.map((e) => (e.id === id ? res.data : e)));
      } catch (err) {
        console.error("[store] updateEntry failed:", err);
        // Revert: re-fetch the original entry
        try {
          const res = await api.getEntry(id);
          setEntries((prev) => prev.map((e) => (e.id === id ? res.data : e)));
        } catch (revertErr) {
          console.error("[store] updateEntry revert failed:", revertErr);
        }
        throw err;
      }
    },
    [],
  );

  const deleteEntry = useCallback(async (id: string) => {
    let deleted: Entry | undefined;
    setEntries((prev) => {
      deleted = prev.find((e) => e.id === id);
      return prev.filter((e) => e.id !== id);
    });
    try {
      await api.deleteEntry(id);
    } catch (err) {
      console.error("[store] deleteEntry failed:", err);
      if (deleted) {
        setEntries((prev) => [deleted as Entry, ...prev]);
      }
      throw err;
    }
  }, []);

  const refreshEntries = useCallback(async () => {
    setIsLoadingEntries(true);
    try {
      const res = await api.getEntries();
      setEntries(res.data);
      setEntriesCursor(res.cursor);
      setHasMoreEntries(res.hasMore);
    } catch (err) {
      console.error("[store] refreshEntries failed:", err);
      throw err;
    } finally {
      setIsLoadingEntries(false);
    }
  }, []);

  const loadMoreEntries = useCallback(async () => {
    if (!hasMoreEntries || !entriesCursor || isLoadingEntries) return;
    setIsLoadingEntries(true);
    try {
      const res = await api.getEntries(entriesCursor);
      setEntries((prev) => [...prev, ...res.data]);
      setEntriesCursor(res.cursor);
      setHasMoreEntries(res.hasMore);
    } catch (err) {
      console.error("[store] loadMoreEntries failed:", err);
      throw err;
    } finally {
      setIsLoadingEntries(false);
    }
  }, [hasMoreEntries, entriesCursor, isLoadingEntries]);

  // --- Questions & Answers ---

  const addAnswer = useCallback(async (questionId: string, answerText: string) => {
    setIsSubmitting(true);
    try {
      const res = await api.answerQuestion(questionId, answerText);
      setAnswers((prev) => [...prev, res.data]);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // --- Bot ---

  const addBotMessage = useCallback(
    async (conversationId: string, content: string): Promise<BotMessage[]> => {
      const now = new Date().toISOString();

      const tempUserMsg: BotMessage = {
        id: `temp-${Date.now()}`,
        conversationId,
        role: "user",
        content,
        profileVersion: null,
        createdAt: now,
      };
      setBotMessages((prev) => [...prev, tempUserMsg]);

      try {
        const res = await api.sendMessage(conversationId, content);
        const { userMessage, assistantMessage } = res.data;
        setBotMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          userMessage,
          assistantMessage,
        ]);
        return [userMessage, assistantMessage];
      } catch (err) {
        console.error("[store] addBotMessage failed:", err);
        setBotMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        throw err;
      }
    },
    [],
  );

  const createConversation = useCallback(async (): Promise<BotConversation> => {
    const res = await api.createConversation();
    setBotConversations((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await api.getMessages(conversationId);
      setBotMessages((prev) => {
        const other = prev.filter((m) => m.conversationId !== conversationId);
        return [...other, ...res.data];
      });
    } catch (err) {
      console.error("[store] loadMessages failed:", err);
      throw err;
    }
  }, []);

  // --- Derived ---

  const setupQuestions = [...questions]
    .filter((q) => q.category === "setup")
    .sort((a, b) => a.priority - b.priority);

  const todaysDailyQuestion = (() => {
    const answeredIds = new Set(answers.map((a) => a.questionId));
    const candidates = questions.filter((q) => q.category === "daily" && !answeredIds.has(q.id));
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => a.priority - b.priority)[0];
  })();

  const store: AppStore = {
    isAuthenticated,
    isOnboarded,
    login,
    completeOnboarding,
    isInitializing,
    isLoadingEntries,
    isSubmitting,
    initError,
    user,
    entries,
    personTags,
    questions,
    answers,
    profile,
    botConversations,
    botMessages,
    setupQuestions,
    todaysDailyQuestion,
    addEntry,
    updateEntry,
    deleteEntry,
    refreshEntries,
    loadMoreEntries,
    hasMoreEntries,
    addAnswer,
    addBotMessage,
    createConversation,
    loadMessages,
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
