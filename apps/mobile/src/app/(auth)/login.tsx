import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../../data/store";
import { borderRadius, colors, fontSize, spacing } from "../../theme";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useStore();

  const handleLogin = () => {
    login();
    router.replace("/onboarding");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.hero}>
        <Text style={styles.logo}>i-log-i</Text>
        <Text style={styles.tagline}>あなたの記録を、未来へ届ける</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.googleButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleLogin}
        >
          <Ionicons name="logo-google" size={20} color={colors.text} />
          <Text style={styles.buttonText}>Googleでログイン</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.appleButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleLogin}
        >
          <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
          <Text style={[styles.buttonText, styles.appleButtonText]}>Appleでログイン</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        ログインすることで利用規約とプライバシーポリシーに同意します
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.xxl * 2,
  },
  logo: {
    fontSize: fontSize.title + 8,
    fontWeight: "300",
    letterSpacing: 4,
    color: colors.primaryDark,
    marginBottom: spacing.md,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  buttons: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  googleButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appleButton: {
    backgroundColor: colors.primaryDark,
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
  },
  appleButtonText: {
    color: "#FFFFFF",
  },
  footer: {
    textAlign: "center",
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    paddingHorizontal: spacing.xl,
  },
});
