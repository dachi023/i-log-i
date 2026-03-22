import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../../data/store";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import { NAV_BAR_CONTENT_HEIGHT, NavBar } from "../../ui/NavBar";

const formatDate = (date: string): string => {
  const d = new Date(date);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
};

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries, deleteEntry } = useStore();
  const headerHeight = insets.top + NAV_BAR_CONTENT_HEIGHT;

  const entry = entries.find((e) => e.id === id);

  const handleDelete = () => {
    Alert.alert("記録の削除", "この記録を削除しますか？この操作は取り消せません。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEntry(id);
            router.back();
          } catch {
            Alert.alert("エラー", "削除に失敗しました。");
          }
        },
      },
    ]);
  };

  if (!entry) {
    return (
      <View style={styles.container}>
        <NavBar title="" showBack />
        <View style={[styles.notFound, { paddingTop: headerHeight }]}>
          <Text style={styles.notFoundText}>エントリーが見つかりません</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>戻る</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavBar title="" showBack />
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: headerHeight + spacing.md }]}
      >
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate(entry.recordedAt)}</Text>
          <View style={styles.actions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push(`/entries/edit?id=${id}`)}
              hitSlop={8}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleDelete} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </Pressable>
          </View>
        </View>

        {entry.body && <Text style={styles.body}>{entry.body}</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 26,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  backButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    fontSize: fontSize.md,
    color: colors.surface,
    fontWeight: "600",
  },
});
