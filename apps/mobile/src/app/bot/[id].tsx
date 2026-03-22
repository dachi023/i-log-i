import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../../data/store";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import { NAV_BAR_CONTENT_HEIGHT, NavBar } from "../../ui/NavBar";

export default function BotConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const store = useStore();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");

  const [isSending, setIsSending] = useState(false);

  const messages = store.botMessages.filter(
    (m: { conversationId: string }) => m.conversationId === id,
  );

  useEffect(() => {
    store.loadMessages(id);
  }, [id, store.loadMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;
    setInputText("");
    setIsSending(true);
    try {
      await store.addBotMessage(id, trimmed);
    } catch {
      // メッセージは optimistic revert される
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({
    item,
  }: {
    item: {
      id: string;
      conversationId: string;
      role: "user" | "assistant";
      content: string;
      profileVersion: number | null;
      createdAt: string;
    };
  }) => {
    const isUser = item.role === "user";

    return (
      <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowBot]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={styles.bubbleText}>{item.content}</Text>
        </View>
        <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampBot]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  const headerHeight = insets.top + NAV_BAR_CONTENT_HEIGHT;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <NavBar title="会話" showBack />
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[styles.messageList, { paddingTop: headerHeight + spacing.sm }]}
        showsVerticalScrollIndicator={false}
        inverted={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />
      <View style={[styles.inputArea, { paddingBottom: insets.bottom || spacing.md }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="メッセージを入力..."
            placeholderTextColor={colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? colors.surface : colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messageList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  bubbleRow: {
    marginBottom: spacing.sm,
    maxWidth: "80%",
  },
  bubbleRowUser: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  bubbleRowBot: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: "#F0FFF4",
    borderBottomRightRadius: borderRadius.sm,
  },
  botBubble: {
    backgroundColor: "#EBF4FF",
    borderBottomLeftRadius: borderRadius.sm,
  },
  bubbleText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  timestampUser: {
    textAlign: "right",
  },
  timestampBot: {
    textAlign: "left",
  },
  inputArea: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderLight,
  },
});
