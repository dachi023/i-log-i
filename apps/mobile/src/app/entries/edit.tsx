import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useStore } from "../../data/store";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import { NAV_BAR_CONTENT_HEIGHT, NavBar } from "../../ui/NavBar";

const formatDateLabel = (iso: string): string => {
  const d = new Date(iso);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
};

const shiftDate = (iso: string, days: number): string => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { entries, updateEntry } = useStore();
  const headerHeight = spacing.md + NAV_BAR_CONTENT_HEIGHT;

  const entry = entries.find((e) => e.id === id);
  const [body, setBody] = useState(entry?.body ?? "");
  const [recordedAt, setRecordedAt] = useState(entry?.recordedAt ?? new Date().toISOString());

  if (!entry) {
    return (
      <View style={styles.container}>
        <NavBar title="編集" modal />
        <View style={[styles.notFound, { paddingTop: headerHeight }]}>
          <Text style={styles.notFoundText}>エントリーが見つかりません</Text>
        </View>
      </View>
    );
  }

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateEntry(id, {
        body: body.trim() || null,
        recordedAt,
      });
      router.back();
    } catch {
      Alert.alert("エラー", "保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  const isChanged = body.trim() !== (entry.body ?? "") || recordedAt !== entry.recordedAt;

  return (
    <View style={styles.container}>
      <NavBar title="編集" modal />
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: headerHeight + spacing.md }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
          <Pressable onPress={() => setRecordedAt(shiftDate(recordedAt, -1))} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={colors.primaryDark} />
          </Pressable>
          <Text style={styles.dateText}>{formatDateLabel(recordedAt)}</Text>
          <Pressable
            onPress={() => {
              const tomorrow = shiftDate(recordedAt, 1);
              if (new Date(tomorrow) <= new Date()) {
                setRecordedAt(tomorrow);
              }
            }}
            hitSlop={8}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={
                new Date(shiftDate(recordedAt, 1)) <= new Date()
                  ? colors.primaryDark
                  : colors.borderLight
              }
            />
          </Pressable>
        </View>

        <TextInput
          style={styles.bodyInput}
          value={body}
          onChangeText={setBody}
          placeholder="今日あったことを書く..."
          placeholderTextColor={colors.textTertiary}
          multiline
          textAlignVertical="top"
          autoFocus
        />

        <Pressable
          style={[styles.saveButton, (!isChanged || isSaving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isChanged || isSaving}
        >
          <Text style={styles.saveText}>{isSaving ? "保存中..." : "保存"}</Text>
        </Pressable>
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
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: "center",
  },
  bodyInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 200,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  saveButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveText: {
    fontSize: fontSize.md,
    color: colors.surface,
    fontWeight: "600",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
