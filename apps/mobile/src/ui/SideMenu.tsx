import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useRef } from "react";
import { Animated, Image, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../data/store";
import { borderRadius, colors, fontSize, spacing } from "../theme";
import { DRAWER_WIDTH, useDrawer } from "./DrawerContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const menuItems: { href: string; title: string; icon: IconName; iconOutline: IconName }[] = [
  { href: "/(drawer)", title: "日々の記録", icon: "book", iconOutline: "book-outline" },
  {
    href: "/(drawer)/bot",
    title: "ボット",
    icon: "chatbubbles",
    iconOutline: "chatbubbles-outline",
  },
  {
    href: "/(drawer)/profile",
    title: "パーソナリティ",
    icon: "sparkles",
    iconOutline: "sparkles-outline",
  },
];

const SWIPE_THRESHOLD = 60;

export function SideMenu() {
  const { visible, setVisible, closeDrawer, slideAnim, overlayAnim } = useDrawer();
  const { user } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const avatarUri = `https://api.dicebear.com/9.x/glass/png?seed=${encodeURIComponent(user.id)}&size=80`;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gs) => {
        return Math.abs(gs.dx) > Math.abs(gs.dy) && gs.dx > 10;
      },
      onPanResponderGrant: () => {
        slideAnim.stopAnimation();
        overlayAnim.stopAnimation();
      },
      onPanResponderMove: (_evt, gs) => {
        const val = Math.max(0, Math.min(DRAWER_WIDTH, gs.dx));
        slideAnim.setValue(val);
        overlayAnim.setValue(1 - val / DRAWER_WIDTH);
      },
      onPanResponderRelease: (_evt, gs) => {
        const shouldClose = gs.dx > SWIPE_THRESHOLD || gs.vx > 0.5;
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: shouldClose ? DRAWER_WIDTH : 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(overlayAnim, {
            toValue: shouldClose ? 0 : 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (shouldClose) setVisible(false);
        });
      },
    }),
  ).current;

  const isActive = (href: string) => {
    if (href === "/(drawer)") return pathname === "/" || pathname === "";
    return pathname === href.replace("/(drawer)", "");
  };

  if (!visible) return null;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Pressable style={styles.overlayTouch} onPress={closeDrawer}>
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
      </Pressable>
      <Animated.View
        style={[
          styles.drawerWrapper,
          { width: DRAWER_WIDTH, right: 0, transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View
          style={[
            styles.drawer,
            { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.md },
          ]}
        >
          <Text style={styles.drawerTitle}>i-log-i</Text>

          <View style={styles.menuList}>
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Pressable
                  key={item.href}
                  style={[styles.menuItem, active && styles.menuItemActive]}
                  onPress={() => {
                    closeDrawer();
                    router.push(item.href as never);
                  }}
                >
                  <Ionicons
                    name={active ? item.icon : item.iconOutline}
                    size={20}
                    color={active ? colors.primaryDark : colors.textSecondary}
                  />
                  <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
                    {item.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.userButton}
            onPress={() => {
              closeDrawer();
              router.push("/settings" as never);
            }}
          >
            <View style={styles.userGlass}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
              <Text style={styles.userName} numberOfLines={1}>
                {user.displayName}
              </Text>
            </View>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  overlayTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  drawerWrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 201,
  },
  drawer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(243,244,246,0.97)",
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: "rgba(0,0,0,0.08)",
  },
  drawerTitle: {
    fontSize: fontSize.xl,
    fontWeight: "300",
    letterSpacing: 2,
    color: colors.primaryDark,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  menuItemActive: {
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  menuLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  menuLabelActive: {
    color: colors.primaryDark,
    fontWeight: "600",
  },
  userButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  userGlass: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 24,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  userName: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.primaryDark,
  },
});
