import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
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

function TextAnswer({ value, onChangeText }: { value: string; onChangeText: (t: string) => void }) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder="あなたの答え..."
      placeholderTextColor={colors.textTertiary}
      multiline
      textAlignVertical="top"
    />
  );
}

function SelectAnswer({
  options,
  selected,
  onSelect,
}: { options: string[]; selected: string | null; onSelect: (o: string) => void }) {
  return (
    <View style={styles.optionsContainer}>
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <Pressable
            key={option}
            style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ScaleAnswer({
  min,
  max,
  labels,
  value,
  onSelect,
}: {
  min: number;
  max: number;
  labels: [string, string] | null;
  value: number | null;
  onSelect: (v: number) => void;
}) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <View style={styles.scaleContainer}>
      {labels && <Text style={styles.scaleLabel}>{labels[0]}</Text>}
      <View style={styles.scaleRow}>
        {steps.map((step) => {
          const isSelected = value === step;
          return (
            <Pressable
              key={step}
              style={[styles.scaleButton, isSelected && styles.scaleButtonSelected]}
              onPress={() => onSelect(step)}
            >
              <Text style={[styles.scaleNumber, isSelected && styles.scaleNumberSelected]}>
                {step}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {labels && <Text style={styles.scaleLabel}>{labels[1]}</Text>}
    </View>
  );
}

export function DailyQuestionModal() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isOnboarded, todaysDailyQuestion, addAnswer } = useStore();
  const [answerText, setAnswerText] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scaleValue, setScaleValue] = useState<number | null>(null);

  const questionId = todaysDailyQuestion?.id ?? null;
  useEffect(() => {
    setAnswerText("");
    setSelectedOption(null);
    setScaleValue(null);
  }, [questionId]);

  if (!isAuthenticated || !isOnboarded) return null;
  if (!todaysDailyQuestion) return null;

  const { answerType } = todaysDailyQuestion;

  const getAnswerValue = (): string | null => {
    switch (answerType) {
      case "text":
        return answerText.trim() || null;
      case "select":
        return selectedOption;
      case "scale":
        return scaleValue !== null ? String(scaleValue) : null;
      default:
        return null;
    }
  };

  const canSubmit = getAnswerValue() !== null;

  const handleAnswer = () => {
    const value = getAnswerValue();
    if (!value) return;
    addAnswer(todaysDailyQuestion.id, value);
  };

  return (
    <Modal transparent animationType="fade" statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.backdropFill} />
        <View style={[styles.card, { marginBottom: insets.bottom + spacing.lg }]}>
          <Text style={styles.label}>今日の質問</Text>
          <Text style={styles.question}>{todaysDailyQuestion.questionText}</Text>

          {answerType === "text" && <TextAnswer value={answerText} onChangeText={setAnswerText} />}

          {answerType === "select" && todaysDailyQuestion.options && (
            <SelectAnswer
              options={todaysDailyQuestion.options}
              selected={selectedOption}
              onSelect={setSelectedOption}
            />
          )}

          {answerType === "scale" && (
            <ScaleAnswer
              min={todaysDailyQuestion.scaleMin ?? 1}
              max={todaysDailyQuestion.scaleMax ?? 5}
              labels={todaysDailyQuestion.scaleLabels ?? null}
              value={scaleValue}
              onSelect={setScaleValue}
            />
          )}

          <Pressable
            style={[styles.answerButton, !canSubmit && styles.answerButtonDisabled]}
            onPress={handleAnswer}
            disabled={!canSubmit}
          >
            <Text style={styles.answerButtonText}>回答する</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backdropFill: {
    flex: 1,
  },
  card: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textTertiary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  question: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 30,
    marginBottom: spacing.lg,
  },
  // Text input
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 100,
    marginBottom: spacing.lg,
  },
  // Select options
  optionsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  optionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionButtonSelected: {
    borderColor: colors.primaryDark,
    backgroundColor: "rgba(37,99,235,0.08)",
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primaryDark,
    fontWeight: "600",
  },
  // Scale
  scaleContainer: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  scaleRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  scaleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  scaleButtonSelected: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.primaryDark,
  },
  scaleNumber: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
  },
  scaleNumberSelected: {
    color: "#FFFFFF",
  },
  scaleLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  // Submit
  answerButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
  },
  answerButtonDisabled: {
    opacity: 0.4,
  },
  answerButtonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
