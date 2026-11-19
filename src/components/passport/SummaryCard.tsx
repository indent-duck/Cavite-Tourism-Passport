import type { Category, Event, Site, Stamp, User } from "@/data/types";
import type { RewardWithEligibility } from "@/hooks/useRewardsWithEligibility";
import { colors, radii, spacing, typography } from "@/theme";
import { CATEGORY_COLORS, CATEGORY_ICONS, categoryTint } from "@/theme/categories";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/** Display order for the collection chips */
const CATEGORY_ORDER: Category[] = [
  "Dining",
  "Staycation",
  "Adventure",
  "Heritage",
  "Festival",
];

/** Festival stamps are bonus-only; these four are required to claim a reward */
const REQUIRED_CATEGORIES: Category[] = [
  "Dining",
  "Staycation",
  "Adventure",
  "Heritage",
];

type Goal =
  | { kind: "claimed"; title: string; rewardId?: string }
  | { kind: "ready"; count: number }
  | {
      kind: "next";
      title: string;
      pointsNeeded: number;
      missingCount: number;
      currentPoints: number;
    };

/**
 * Picks what the card should push the user toward:
 * the reward already claimed this season, rewards ready to claim,
 * or the closest reward still locked (fewest points missing, then cheapest).
 */
function pickGoal(user: User, rewards?: RewardWithEligibility[]): Goal | null {
  if (!rewards) return null;

  if (user.hasClaimedThisPeriod) {
    const claimed = rewards.find((r) => r.reward.id === user.claimedRewardId);
    return {
      kind: "claimed",
      title: claimed?.reward.title ?? "Your reward",
      rewardId: user.claimedRewardId,
    };
  }

  const ready = rewards.filter((r) => r.eligibility.eligible);
  if (ready.length > 0) return { kind: "ready", count: ready.length };

  const open = rewards.filter(
    ({ reward }) =>
      reward.available && !(reward.limited && (reward.remainingClaims ?? 0) <= 0),
  );
  if (open.length === 0) return null;

  const next = open.reduce((best, cur) => {
    const diff = cur.eligibility.pointsNeeded - best.eligibility.pointsNeeded;
    if (diff !== 0) return diff < 0 ? cur : best;
    return cur.reward.pointsCost < best.reward.pointsCost ? cur : best;
  });

  return {
    kind: "next",
    title: next.reward.title,
    pointsNeeded: next.eligibility.pointsNeeded,
    missingCount: next.eligibility.missingCategories.length,
    currentPoints: next.eligibility.currentPoints,
  };
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

function nextGoalHeadline(pointsNeeded: number, missingCount: number) {
  const categories = plural(missingCount, "category", "categories");
  if (pointsNeeded > 0 && missingCount > 0) {
    return `${pointsNeeded} pts + ${categories} to go`;
  }
  if (pointsNeeded > 0) return `${pointsNeeded} more pts to go`;
  return `${categories} to go`;
}

interface SummaryCardProps {
  user: User;
  stamps: Stamp[];
  sites: Site[];
  events: Event[];
  /** Undefined while loading or when rewards failed to load; the goal section is hidden then */
  rewards?: RewardWithEligibility[];
}

/**
 * Passport progress card
 *
 * Top: the next thing to work toward — the closest locked reward with a
 * points progress bar, rewards ready to claim, or the reward already claimed.
 * Bottom: stamps collected per category, with required categories that are
 * still empty drawn as dashed outlines.
 *
 * Validates: Requirements 2.1, 2.2
 */
export function SummaryCard({ user, stamps, sites, events, rewards }: SummaryCardProps) {
  const goal = pickGoal(user, rewards);

  const collectedByCategory = new Map<Category, number>();
  for (const stamp of stamps) {
    collectedByCategory.set(
      stamp.siteCategory,
      (collectedByCategory.get(stamp.siteCategory) ?? 0) + 1,
    );
  }

  const totalByCategory = new Map<Category, number>();
  for (const site of sites) {
    totalByCategory.set(site.category, (totalByCategory.get(site.category) ?? 0) + 1);
  }
  const festivalStamps = events.filter((e) => e.festivalStamp?.available).length;
  totalByCategory.set("Festival", (totalByCategory.get("Festival") ?? 0) + festivalStamps);

  const totalSlots = sites.length + festivalStamps;

  return (
    <View style={styles.card} testID="passport-summary-card">
      {goal && <GoalSection goal={goal} />}

      {goal && <View style={styles.divider} />}

      {/* Collection by category */}
      <View style={styles.sectionHeader}>
        <Text style={styles.eyebrow}>Stamp Collection</Text>
        <Text style={styles.collectionCount}>
          {stamps.length} of {totalSlots}
        </Text>
      </View>

      <View style={styles.chips}>
        {CATEGORY_ORDER.map((category) => {
          const collected = collectedByCategory.get(category) ?? 0;
          const total = Math.max(totalByCategory.get(category) ?? 0, collected);
          if (total === 0) return null;

          const required = REQUIRED_CATEGORIES.includes(category);
          return (
            <CategoryChip
              key={category}
              category={category}
              collected={collected}
              total={total}
              required={required}
            />
          );
        })}
      </View>
    </View>
  );
}

function GoalSection({ goal }: { goal: Goal }) {
  let eyebrow = "Next Reward";
  let icon: keyof typeof Ionicons.glyphMap = "gift";
  let headline: string;
  let subline: string;
  let progress: number;
  let progressLabel: string;
  let fillColor: string = colors.accent;
  let ctaLabel = "All rewards";
  let onCta = () => router.push("/rewards");

  switch (goal.kind) {
    case "claimed":
      eyebrow = "Season Reward";
      icon = "checkmark-done";
      headline = "Reward claimed";
      subline = goal.title;
      progress = 1;
      progressLabel = "Claimed";
      fillColor = colors.success;
      ctaLabel = "View";
      if (goal.rewardId) {
        const rewardId = goal.rewardId;
        onCta = () => router.push(`/rewards/${rewardId}`);
      }
      break;
    case "ready":
      headline = "Reward unlocked!";
      subline = `${plural(goal.count, "reward", "rewards")} ready to claim`;
      progress = 1;
      progressLabel = "Ready";
      fillColor = colors.success;
      ctaLabel = "Claim";
      break;
    case "next": {
      headline = nextGoalHeadline(goal.pointsNeeded, goal.missingCount);
      subline = `to unlock ${goal.title}`;
      const target = goal.currentPoints + goal.pointsNeeded;
      progress = target > 0 ? goal.currentPoints / target : 1;
      progressLabel =
        goal.pointsNeeded > 0 ? `${goal.currentPoints} / ${target} PTS` : "Points ✓";
      break;
    }
  }

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.eyebrowRow}>
          <View style={styles.emblem}>
            <Ionicons name={icon} size={13} color={colors.passportFoil} />
          </View>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        </View>
        <Pressable
          onPress={onCta}
          hitSlop={spacing.md}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          accessibilityRole="link"
          testID="passport-summary-cta"
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.accent} />
        </Pressable>
      </View>

      <Text style={styles.headline} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
        {headline}
      </Text>
      <Text style={styles.subline} numberOfLines={1}>
        {subline}
      </Text>

      <View style={styles.progressRow}>
        <ProgressBar progress={progress} color={fillColor} />
        <Text style={styles.progressLabel}>{progressLabel}</Text>
      </View>
    </View>
  );
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const fillWidth = useSharedValue(0);
  const clamped = Math.min(Math.max(progress, 0), 1);

  useEffect(() => {
    fillWidth.value = withTiming(trackWidth * clamped, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, trackWidth, fillWidth]);

  const fillStyle = useAnimatedStyle(() => ({ width: fillWidth.value }));

  return (
    <View
      style={styles.track}
      onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
    </View>
  );
}

interface CategoryChipProps {
  category: Category;
  collected: number;
  total: number;
  required: boolean;
}

function CategoryChip({ category, collected, total, required }: CategoryChipProps) {
  const color = CATEGORY_COLORS[category];
  const hasAny = collected > 0;
  const missingRequired = required && !hasAny;

  return (
    <View
      style={[
        styles.chip,
        hasAny
          ? { backgroundColor: categoryTint(category, "1A"), borderColor: categoryTint(category, "33") }
          : [styles.chipEmpty, { borderColor: missingRequired ? color : colors.passportPaperBorder }],
      ]}
      accessible
      accessibilityLabel={`${category}: ${collected} of ${total} collected${
        missingRequired ? ", needed for rewards" : ""
      }${required ? "" : ", bonus"}`}
    >
      <Ionicons
        name={CATEGORY_ICONS[category]}
        size={13}
        color={hasAny || missingRequired ? color : colors.textSecondary}
      />
      <Text
        style={[styles.chipLabel, { color: hasAny || missingRequired ? color : colors.textSecondary }]}
      >
        {category}
      </Text>
      <Text style={styles.chipCount}>
        {collected}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.passportCream,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.passportPaperBorder,
    padding: spacing.base,
    shadowColor: colors.passportLeather,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },

  // Section header (shared by goal + collection)
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  emblem: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.passportLeather,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    ...typography.labelSmall,
    fontFamily: "Inter_700Bold",
    color: colors.passportLeather,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ctaText: {
    ...typography.labelMedium,
    fontFamily: "Inter_700Bold",
    color: colors.accent,
  },
  pressed: {
    opacity: 0.6,
  },

  // Goal
  headline: {
    ...typography.headlineSmall,
    fontFamily: "Inter_700Bold",
    color: colors.text,
  },
  subline: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.passportFooter,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabel: {
    ...typography.labelSmall,
    fontFamily: "Inter_700Bold",
    color: colors.passportLeather,
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: colors.passportPaperBorder,
    marginVertical: spacing.base,
  },

  // Collection
  collectionCount: {
    ...typography.labelSmall,
    fontFamily: "Inter_700Bold",
    color: colors.textSecondary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radii.chip,
    borderWidth: 1,
  },
  chipEmpty: {
    backgroundColor: "transparent",
    borderStyle: "dashed",
  },
  chipLabel: {
    ...typography.labelSmall,
    fontFamily: "Inter_600SemiBold",
  },
  chipCount: {
    ...typography.labelSmall,
    fontFamily: "Inter_700Bold",
    color: colors.text,
  },
});
