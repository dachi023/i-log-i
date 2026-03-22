import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../../data/store";
import { colors, fontSize, spacing } from "../../theme";
import { FloatingFab } from "../../ui/FloatingFab";

export default function BotScreen() {
  const router = useRouter();
  const store = useStore();
  const conversations = store.botConversations;
  const botMessages = store.botMessages;
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 44;

  const handleNewConversation = async () => {
    try {
      const conversation = await store.createConversation();
      router.push(`/bot/${conversation.id}`);
    } catch {
      // ignore - UI remains on bot list
    }
  };

  const getLastMessage = (conversationId: string) => {
    const messages = botMessages.filter(
      (m: { conversationId: string }) => m.conversationId === conversationId,
    );
    return messages.length > 0 ? messages[messages.length - 1] : null;
  };

  const { active, ended } = useMemo(() => {
    const a = conversations.filter((c) => c.endedAt === null);
    const e = conversations.filter((c) => c.endedAt !== null);
    return { active: a, ended: e };
  }, [conversations]);

  const renderItem = (item: { id: string; startedAt: string }) => {
    const lastMessage = getLastMessage(item.id);

    return (
      <Pressable key={item.id} style={styles.row} onPress={() => router.push(`/bot/${item.id}`)}>
        <Text style={styles.preview} numberOfLines={2}>
          {lastMessage?.content ?? "メッセージなし"}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.list, { paddingTop: headerHeight + spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {active.length === 0 && ended.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>まだ会話がありません</Text>
          </View>
        )}

        {active.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>進行中</Text>
            {active.map(renderItem)}
          </>
        )}

        {ended.length > 0 && (
          <>
            <Text style={[styles.sectionHeader, active.length > 0 && styles.sectionHeaderSpacing]}>
              終了
            </Text>
            {ended.map(renderItem)}
          </>
        )}
      </ScrollView>
      <FloatingFab onPress={handleNewConversation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  sectionHeader: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  sectionHeaderSpacing: {
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  preview: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textTertiary,
  },
});
