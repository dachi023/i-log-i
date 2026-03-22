import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useStore } from "../../data/store";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import { NAV_BAR_CONTENT_HEIGHT, NavBar } from "../../ui/NavBar";

type MediaAttachment = {
  type: "image" | "video" | "audio";
  name: string;
};

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

export default function CreateEntryScreen() {
  const router = useRouter();
  const { addEntry } = useStore();
  const headerHeight = spacing.md + NAV_BAR_CONTENT_HEIGHT;

  const [body, setBody] = useState("");
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString());
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await addEntry({
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

  const handleAttach = (type: "image" | "video" | "audio") => {
    const labels = { image: "写真", video: "動画", audio: "音声" };
    const name = `${labels[type]}_${attachments.length + 1}`;
    setAttachments((prev) => [...prev, { type, name }]);
    Alert.alert("添付", `${labels[type]}を添付しました（モック）`);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const attachmentIcon = (type: MediaAttachment["type"]): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "image":
        return "image-outline";
      case "video":
        return "videocam-outline";
      case "audio":
        return "mic-outline";
    }
  };

  return (
    <View style={styles.container}>
      <NavBar title="新しい記録" modal />
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

        <View style={styles.mediaSection}>
          <View style={styles.mediaButtons}>
            <Pressable style={styles.mediaButton} onPress={() => handleAttach("image")}>
              <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.mediaButtonText}>写真</Text>
            </Pressable>
            <Pressable style={styles.mediaButton} onPress={() => handleAttach("video")}>
              <Ionicons name="videocam-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.mediaButtonText}>動画</Text>
            </Pressable>
            <Pressable style={styles.mediaButton} onPress={() => handleAttach("audio")}>
              <Ionicons name="mic-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.mediaButtonText}>音声</Text>
            </Pressable>
          </View>

          {attachments.length > 0 && (
            <View style={styles.attachmentList}>
              {attachments.map((att, index) => (
                <View key={`${att.name}-${index}`} style={styles.attachmentItem}>
                  <Ionicons name={attachmentIcon(att.type)} size={16} color={colors.primary} />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {att.name}
                  </Text>
                  <Pressable onPress={() => removeAttachment(index)} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable
          style={[styles.saveButton, (!body.trim() || isSaving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!body.trim() || isSaving}
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
  mediaSection: {
    marginBottom: spacing.xl,
  },
  mediaButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  mediaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  mediaButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  attachmentList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  attachmentName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
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
});
