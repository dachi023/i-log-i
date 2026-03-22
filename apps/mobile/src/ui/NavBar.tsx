import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fontSize, spacing } from "../theme";
import { useDrawer } from "./DrawerContext";
import { GlassBackground } from "./GlassBackground";

type NavBarProps = {
  title: string;
  showBack?: boolean;
  modal?: boolean;
};

export function NavBar({ title, showBack = false, modal = false }: NavBarProps) {
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawer();
  const router = useRouter();

  return (
    <GlassBackground style={[styles.header, { paddingTop: modal ? spacing.md : insets.top }]}>
      <View style={styles.side}>
        {!modal && showBack && (
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={colors.primaryDark} />
          </Pressable>
        )}
      </View>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>
        {modal ? (
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={26} color={colors.primaryDark} />
          </Pressable>
        ) : (
          <Pressable onPress={openDrawer} hitSlop={8}>
            <Ionicons name="menu" size={26} color={colors.primaryDark} />
          </Pressable>
        )}
      </View>
    </GlassBackground>
  );
}

export const NAV_BAR_CONTENT_HEIGHT = 44;

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    zIndex: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.3)",
  },
  side: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.primaryDark,
    textAlign: "center",
  },
});
