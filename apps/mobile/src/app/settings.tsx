import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useStore } from "../data/store";
import { borderRadius, colors, fontSize, spacing } from "../theme";
import { NavBar } from "../ui/NavBar";

type SettingsItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type SettingsSection = {
  title: string;
  items: SettingsItem[];
};

const sections: SettingsSection[] = [
  {
    title: "アカウント",
    items: [
      { label: "表示名の変更", icon: "person-outline" },
      { label: "連携アカウント", icon: "logo-google" },
    ],
  },
  {
    title: "遺産管理",
    items: [
      { label: "受取人の管理", icon: "people-outline" },
      { label: "第三者（Trustee）の管理", icon: "shield-checkmark-outline" },
      { label: "生存確認の設定", icon: "pulse-outline" },
      { label: "公開範囲の設定", icon: "eye-outline" },
    ],
  },
  {
    title: "アプリ",
    items: [
      { label: "通知設定", icon: "notifications-outline" },
      { label: "データエクスポート", icon: "download-outline" },
      { label: "バージョン", icon: "information-circle-outline" },
    ],
  },
  {
    title: "アカウント操作",
    items: [{ label: "アカウント削除", icon: "trash-outline" }],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const store = useStore();
  const user = store.user;
  const navBarHeight = spacing.md + 44;

  if (!user) return null;

  const avatarUri = `https://api.dicebear.com/9.x/glass/png?seed=${encodeURIComponent(user.id)}&size=112`;

  const handleItemPress = (label: string) => {
    if (label === "バージョン") {
      Alert.alert("バージョン", "1.0.0");
      return;
    }
    Alert.alert("お知らせ", "この機能は開発中です");
  };

  const handleLogout = () => {
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <NavBar title="設定" modal />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: navBarHeight + spacing.sm }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userCard}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user.role === "recorder"
                  ? "記録者"
                  : user.role === "receiver"
                    ? "受取人"
                    : "記録者・受取人"}
              </Text>
            </View>
          </View>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.settingsItem,
                    index < section.items.length - 1 && styles.settingsItemBorder,
                  ]}
                  onPress={() => handleItemPress(item.label)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemLeft}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={item.label === "アカウント削除" ? colors.error : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.itemLabel,
                        item.label === "アカウント削除" && styles.itemLabelDanger,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.borderLight,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  displayName: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: `${colors.primaryDark}1A`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  roleText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemLabel: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  itemLabelDanger: {
    color: colors.error,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.error,
  },
});
