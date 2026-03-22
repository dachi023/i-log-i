import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { GlassContainer, GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  InputAccessoryView,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInput as TextInputType,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../../data/store";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import { BottomBar } from "../../ui/BottomBar";
import { FAB_SIZE } from "../../ui/FloatingFab";

const hasLiquidGlass = isGlassEffectAPIAvailable();

const formatDate = (date: string): { month: string; day: string; weekday: string } => {
  const d = new Date(date);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return {
    month: `${d.getMonth() + 1}月`,
    day: `${d.getDate()}`,
    weekday: weekdays[d.getDay()],
  };
};

const SEARCH_ACCESSORY_ID = "search-keyboard-bar";

function FloatingBar({
  searchQuery,
  onChangeQuery,
  onPressAdd,
}: {
  searchQuery: string;
  onChangeQuery: (q: string) => void;
  onPressAdd: () => void;
}) {
  const inputRef = useRef<TextInputType>(null);

  const searchInput = (
    <View style={styles.searchInputRow}>
      <Ionicons name="search" size={18} color={colors.textSecondary} />
      <TextInput
        ref={inputRef}
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={onChangeQuery}
        placeholder="あなたの記録から検索する"
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        inputAccessoryViewID={SEARCH_ACCESSORY_ID}
      />
      {searchQuery.length > 0 && (
        <Pressable onPress={() => onChangeQuery("")} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );

  if (hasLiquidGlass) {
    return (
      <>
        <BottomBar keyboardAware style={styles.floatingBarGap}>
          <GlassContainer style={styles.glassRow} spacing={16}>
            <GlassView style={styles.searchBarGlass} glassEffectStyle="regular" colorScheme="light">
              {searchInput}
            </GlassView>
            <GlassView
              style={styles.addFabGlass}
              glassEffectStyle="regular"
              colorScheme="light"
              isInteractive
            >
              <Pressable style={styles.fabInner} onPress={onPressAdd}>
                <Ionicons name="add" size={26} color={colors.primaryDark} />
              </Pressable>
            </GlassView>
          </GlassContainer>
        </BottomBar>
        <InputAccessoryView nativeID={SEARCH_ACCESSORY_ID}>
          <View style={styles.accessoryBar}>
            <View style={styles.accessorySpacer} />
            <Pressable style={styles.accessoryButton} onPress={() => Keyboard.dismiss()}>
              <Ionicons name="chevron-down" size={20} color={colors.primaryDark} />
            </Pressable>
          </View>
        </InputAccessoryView>
      </>
    );
  }

  return (
    <>
      <BottomBar keyboardAware style={styles.floatingBarGap}>
        <View style={styles.searchBarLegacyShadow}>
          <View style={styles.searchBarLegacy}>
            <BlurView
              intensity={60}
              tint="systemChromeMaterialLight"
              style={StyleSheet.absoluteFill}
            />
            {searchInput}
          </View>
        </View>
        <View style={styles.addFabLegacyShadow}>
          <View style={styles.addFabLegacy}>
            <BlurView
              intensity={60}
              tint="systemChromeMaterialLight"
              style={StyleSheet.absoluteFill}
            />
            <Pressable style={styles.fabInner} onPress={onPressAdd}>
              <Ionicons name="add" size={26} color={colors.primaryDark} />
            </Pressable>
          </View>
        </View>
      </BottomBar>
      <InputAccessoryView nativeID={SEARCH_ACCESSORY_ID}>
        <View style={styles.accessoryBar}>
          <View style={styles.accessorySpacer} />
          <Pressable style={styles.accessoryButton} onPress={() => Keyboard.dismiss()}>
            <Ionicons name="chevron-down" size={20} color={colors.primaryDark} />
          </Pressable>
        </View>
      </InputAccessoryView>
    </>
  );
}

export default function EntriesListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  const headerHeight = insets.top + 44;

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.trim().toLowerCase();
    return entries.filter((e) => e.body?.toLowerCase().includes(q));
  }, [entries, searchQuery]);

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingTop: headerHeight + spacing.md }]}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => {
          const date = formatDate(item.recordedAt);
          const prev = index > 0 ? filteredEntries[index - 1] : null;
          const prevDate = prev ? formatDate(prev.recordedAt) : null;
          const showMonth = !prevDate || prevDate.month !== date.month;

          return (
            <View>
              {showMonth && (
                <Text style={[styles.monthHeader, index > 0 && styles.monthHeaderSpacing]}>
                  {date.month}
                </Text>
              )}
              <Pressable style={styles.entry} onPress={() => router.push(`/entries/${item.id}`)}>
                <View style={styles.dateColumn}>
                  <Text style={styles.dateDay}>{date.day}</Text>
                  <Text style={styles.dateWeekday}>{date.weekday}</Text>
                </View>
                <View style={styles.bodyColumn}>
                  <Text style={styles.bodyText} numberOfLines={3}>
                    {item.body}
                  </Text>
                </View>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {searchQuery ? "検索結果がありません" : "まだ記録がありません"}
            </Text>
          </View>
        }
      />

      <FloatingBar
        searchQuery={searchQuery}
        onChangeQuery={setSearchQuery}
        onPressAdd={() => router.push("/entries/create")}
      />
    </View>
  );
}

const BAR_HEIGHT = FAB_SIZE;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  monthHeader: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  monthHeaderSpacing: {
    marginTop: spacing.xl,
  },
  entry: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  dateColumn: {
    width: 44,
    alignItems: "center",
    marginRight: spacing.md,
  },
  dateDay: {
    fontSize: fontSize.xl,
    fontWeight: "300",
    color: colors.text,
    lineHeight: 28,
  },
  dateWeekday: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  bodyColumn: {
    flex: 1,
    justifyContent: "center",
  },
  bodyText: {
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

  floatingBarGap: {
    gap: spacing.sm,
  },
  glassRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  // Search input row (shared)
  searchInputRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    height: "100%",
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: 0,
  },

  // Liquid Glass (iOS 26+)
  searchBarGlass: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
  },
  addFabGlass: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  fabInner: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // Legacy (BlurView fallback)
  searchBarLegacyShadow: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBarLegacy: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    overflow: "hidden",
  },
  addFabLegacyShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  addFabLegacy: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    overflow: "hidden",
  },
  accessoryBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  accessorySpacer: {
    flex: 1,
  },
  accessoryButton: {
    padding: spacing.sm,
  },
});
