import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../data/store";
import { borderRadius, colors, fontSize, spacing } from "../theme";

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setupQuestions, addAnswer, completeOnboarding } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardWillHide", () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const question = setupQuestions[currentIndex];
  const isLast = currentIndex === setupQuestions.length - 1;
  const progress = setupQuestions.length > 0 ? (currentIndex + 1) / setupQuestions.length : 1;

  // セットアップ質問がない場合はスキップ
  useEffect(() => {
    if (setupQuestions.length === 0) {
      completeOnboarding();
      router.replace("/(drawer)");
    }
  }, [setupQuestions.length, completeOnboarding, router]);

  if (setupQuestions.length === 0 || !question) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (!answerText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addAnswer(question.id, answerText.trim());
      setAnswerText("");

      if (isLast) {
        completeOnboarding();
        router.replace("/(drawer)");
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch {
      // フォールバック: エラーでも進める
      setAnswerText("");
      if (isLast) {
        completeOnboarding();
        router.replace("/(drawer)");
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + spacing.xl }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.step}>
          {currentIndex + 1} / {setupQuestions.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.subtitle}>あなたのことを教えてください</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.questionText}>{question.questionText}</Text>
        <TextInput
          style={styles.input}
          value={answerText}
          onChangeText={setAnswerText}
          placeholder="回答を入力..."
          placeholderTextColor={colors.textTertiary}
          multiline
          textAlignVertical="top"
          autoFocus
        />
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: keyboardVisible ? spacing.sm : insets.bottom + spacing.lg },
        ]}
      >
        <Pressable
          style={[styles.button, !answerText.trim() && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!answerText.trim()}
        >
          <Text style={styles.buttonText}>{isLast ? "はじめる" : "次へ"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  step: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.full,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  body: {
    flex: 1,
  },
  questionText: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    color: colors.primaryDark,
    lineHeight: 32,
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 120,
    lineHeight: 24,
  },
  footer: {
    paddingTop: spacing.md,
  },
  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: fontSize.md,
    color: colors.surface,
    fontWeight: "600",
  },
});
