import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../../data/store";
import { borderRadius, colors, fontSize, spacing } from "../../theme";

interface SpeechStyle {
  tone: string;
  formality: string;
  characteristics: string[];
  fillerWords: string[];
}

interface Values {
  core: string[];
  secondary: string[];
  beliefs: string[];
}

interface BigFive {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface PersonalityTraits {
  bigFive: BigFive;
  summary: string;
}

interface HumorStyle {
  type: string;
  examples: string[];
  frequency: string;
}

interface EmotionalPatterns {
  stressResponse: string;
  joyTriggers: string[];
  comfortActions: string[];
}

interface Relationships {
  familyImportance: string;
  communicationStyle: string;
  conflictResolution: string;
}

interface LifeStory {
  childhood: string;
  turning_points: string[];
  currentChapter: string;
}

interface ConfidenceScores {
  speechStyle: number;
  values: number;
  personalityTraits: number;
  humorStyle: number;
  emotionalPatterns: number;
  relationships: number;
  lifeStory: number;
}

const bigFiveLabels: Record<string, string> = {
  openness: "開放性",
  conscientiousness: "誠実性",
  extraversion: "外向性",
  agreeableness: "協調性",
  neuroticism: "神経症傾向",
};

const bigFiveColors: Record<string, string> = {
  openness: colors.info,
  conscientiousness: colors.success,
  extraversion: colors.warning,
  agreeableness: "#9F7AEA",
  neuroticism: "#F56565",
};

function ConfidenceBar({ value }: { value: number }) {
  return (
    <View style={styles.confidenceBarContainer}>
      <View style={styles.confidenceBarBackground}>
        <View style={[styles.confidenceBarFill, { width: `${Math.round(value * 100)}%` }]} />
      </View>
      <Text style={styles.confidenceBarText}>{Math.round(value * 100)}%</Text>
    </View>
  );
}

function SectionCard({
  title,
  confidence,
  children,
}: {
  title: string;
  confidence?: number;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {confidence !== undefined && <ConfidenceBar value={confidence} />}
      </View>
      {children}
    </View>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function BigFiveBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.bigFiveRow}>
      <Text style={styles.bigFiveLabel}>{label}</Text>
      <View style={styles.bigFiveBarBackground}>
        <View
          style={[
            styles.bigFiveBarFill,
            { width: `${Math.round(value * 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.bigFiveValue}>{value.toFixed(1)}</Text>
    </View>
  );
}

const formatProfileDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

export default function ProfileScreen() {
  const { profile } = useStore();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 44;

  if (!profile) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.md }]}
        >
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>&#9711;</Text>
            <Text style={styles.emptyText}>プロファイルがまだ生成されていません</Text>
            <Text style={styles.emptySubtext}>質問に回答するとプロファイルが生成されます</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const speechStyle = profile.speechStyle as SpeechStyle | undefined;
  const values = profile.values as Values | undefined;
  const personalityTraits = profile.personalityTraits as PersonalityTraits | undefined;
  const humorStyle = profile.humorStyle as HumorStyle | undefined;
  const emotionalPatterns = profile.emotionalPatterns as EmotionalPatterns | undefined;
  const relationships = profile.relationships as Relationships | undefined;
  const lifeStory = profile.lifeStory as LifeStory | undefined;
  const confidenceScores = profile.confidenceScores as ConfidenceScores | undefined;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.md }]}
      >
        <View style={styles.profileMeta}>
          <View style={styles.metaLeft}>
            <Text style={styles.updatedAtText}>
              最終更新: {formatProfileDate(profile.createdAt)}
            </Text>
            {profile.sourceSummary && (
              <Text style={styles.sourceText}>{profile.sourceSummary}</Text>
            )}
          </View>
          <Pressable
            style={styles.regenerateButton}
            onPress={() =>
              Alert.alert("再生成", "プロファイルを再生成しますか？", [
                { text: "キャンセル", style: "cancel" },
                { text: "再生成", onPress: () => Alert.alert("お知らせ", "この機能は開発中です") },
              ])
            }
          >
            <Ionicons name="refresh-outline" size={16} color={colors.primaryDark} />
            <Text style={styles.regenerateText}>再生成</Text>
          </Pressable>
        </View>

        {/* 話し方 */}
        {speechStyle && (
          <SectionCard title="話し方" confidence={confidenceScores?.speechStyle}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>トーン</Text>
              <Text style={styles.detailValue}>{speechStyle.tone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>フォーマリティ</Text>
              <Text style={styles.detailValue}>{speechStyle.formality}</Text>
            </View>
            {speechStyle.characteristics.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listLabel}>特徴</Text>
                {speechStyle.characteristics.map((c) => (
                  <Text key={c} style={styles.listItem}>
                    {c}
                  </Text>
                ))}
              </View>
            )}
          </SectionCard>
        )}

        {/* 価値観 */}
        {values && (
          <SectionCard title="価値観" confidence={confidenceScores?.values}>
            {values.core.length > 0 && (
              <View style={styles.chipContainer}>
                {values.core.map((v) => (
                  <Chip key={v} label={v} />
                ))}
              </View>
            )}
            {values.beliefs.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listLabel}>信念</Text>
                {values.beliefs.map((b) => (
                  <Text key={b} style={styles.listItem}>
                    {b}
                  </Text>
                ))}
              </View>
            )}
          </SectionCard>
        )}

        {/* 性格 */}
        {personalityTraits && (
          <SectionCard title="性格" confidence={confidenceScores?.personalityTraits}>
            <Text style={styles.summaryText}>{personalityTraits.summary}</Text>
            <View style={styles.bigFiveContainer}>
              {Object.entries(personalityTraits.bigFive).map(([key, value]) => (
                <BigFiveBar
                  key={key}
                  label={bigFiveLabels[key] ?? key}
                  value={value}
                  color={bigFiveColors[key] ?? colors.primaryDark}
                />
              ))}
            </View>
          </SectionCard>
        )}

        {/* ユーモア */}
        {humorStyle && (
          <SectionCard title="ユーモア" confidence={confidenceScores?.humorStyle}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>タイプ</Text>
              <Text style={styles.detailValue}>{humorStyle.type}</Text>
            </View>
            {humorStyle.examples.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listLabel}>例</Text>
                {humorStyle.examples.map((e) => (
                  <Text key={e} style={styles.quoteItem}>
                    &ldquo;{e}&rdquo;
                  </Text>
                ))}
              </View>
            )}
          </SectionCard>
        )}

        {/* 感情パターン */}
        {emotionalPatterns && (
          <SectionCard title="感情パターン" confidence={confidenceScores?.emotionalPatterns}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ストレス反応</Text>
              <Text style={styles.detailValue}>{emotionalPatterns.stressResponse}</Text>
            </View>
            {emotionalPatterns.joyTriggers.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listLabel}>喜びのトリガー</Text>
                {emotionalPatterns.joyTriggers.map((t) => (
                  <Text key={t} style={styles.listItem}>
                    {t}
                  </Text>
                ))}
              </View>
            )}
            {emotionalPatterns.comfortActions.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listLabel}>安心する行動</Text>
                {emotionalPatterns.comfortActions.map((a) => (
                  <Text key={a} style={styles.listItem}>
                    {a}
                  </Text>
                ))}
              </View>
            )}
          </SectionCard>
        )}

        {/* 人間関係 */}
        {relationships && (
          <SectionCard title="人間関係" confidence={confidenceScores?.relationships}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>コミュニケーション</Text>
              <Text style={styles.detailValue}>{relationships.communicationStyle}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>対立解決</Text>
              <Text style={styles.detailValue}>{relationships.conflictResolution}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>家族の重要性</Text>
              <Text style={styles.detailValue}>{relationships.familyImportance}</Text>
            </View>
          </SectionCard>
        )}

        {/* ライフストーリー */}
        {lifeStory && (
          <SectionCard title="ライフストーリー" confidence={confidenceScores?.lifeStory}>
            <View style={styles.listSection}>
              <Text style={styles.listLabel}>幼少期</Text>
              <Text style={styles.bodyText}>{lifeStory.childhood}</Text>
            </View>
            {lifeStory.turning_points.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listLabel}>転機</Text>
                <View style={styles.timeline}>
                  {lifeStory.turning_points.map((tp, i) => (
                    <View key={tp} style={styles.timelineItem}>
                      <View style={styles.timelineDot} />
                      {i < lifeStory.turning_points.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                      <Text style={styles.timelineText}>{tp}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            <View style={styles.listSection}>
              <Text style={styles.listLabel}>現在</Text>
              <Text style={styles.bodyText}>{lifeStory.currentChapter}</Text>
            </View>
          </SectionCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  metaLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  updatedAtText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  sourceText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regenerateText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.primaryDark,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  confidenceBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  confidenceBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  confidenceBarFill: {
    height: "100%",
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.full,
  },
  confidenceBarText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    width: 36,
    textAlign: "right",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  listSection: {
    marginTop: spacing.md,
  },
  listLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  listItem: {
    fontSize: fontSize.sm,
    color: colors.text,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.md,
    lineHeight: 20,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    backgroundColor: `${colors.primaryDark}1A`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  summaryText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  bigFiveContainer: {
    gap: spacing.md,
  },
  bigFiveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  bigFiveLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    width: 80,
  },
  bigFiveBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  bigFiveBarFill: {
    height: "100%",
    borderRadius: borderRadius.full,
  },
  bigFiveValue: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    width: 28,
    textAlign: "right",
  },
  quoteItem: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontStyle: "italic",
    paddingVertical: spacing.xs,
    paddingLeft: spacing.md,
    lineHeight: 20,
  },
  bodyText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
  },
  timeline: {
    paddingLeft: spacing.sm,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 36,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryDark,
    marginTop: 4,
    marginRight: spacing.md,
  },
  timelineLine: {
    position: "absolute",
    left: 4,
    top: 14,
    bottom: -8,
    width: 2,
    backgroundColor: colors.border,
  },
  timelineText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 48,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
