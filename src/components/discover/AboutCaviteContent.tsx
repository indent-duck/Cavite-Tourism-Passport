import { ExpresswayCard } from "@/components/discover/ExpresswayCard";
import { CaviteMap } from "@/components/map/CaviteMap";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  ABOUT_HERO,
  HISTORY_TIMELINE,
  PROVINCE_HIGHLIGHTS,
  SIGNATURE_DISHES,
  type ProvinceHighlight,
} from "@/data/about-cavite-content";
import type { Event, Expressway } from "@/data/types";
import { TAB_BAR_HEIGHT } from "@/lib/constants";
import { getEventStatus } from "@/lib/event-utils";
import { colors, radii, shadows, spacing, typography } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HighlightCategory = ProvinceHighlight["category"];

/** Same category colors and icons as passport stamps and site cards */
const CATEGORY_STYLE: Record<
  HighlightCategory,
  { color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  Heritage: { color: colors.categoryHeritage, icon: "library" },
  Staycation: { color: colors.categoryStaycation, icon: "bed" },
  Adventure: { color: colors.categoryAdventure, icon: "trail-sign" },
  Dining: { color: colors.categoryDining, icon: "restaurant" },
};

const HIGHLIGHT_CARD_WIDTH = 248;
const MAP_HEIGHT = 260;

interface AboutCaviteContentProps {
  expressways: Expressway[];
  /** Upcoming events to preview, already filtered and sorted */
  events: Event[];
  /** Site IDs present in the catalog; timeline items only link to these */
  knownSiteIds: ReadonlySet<string>;
  onEventPress: (id: string) => void;
  onViewAllEvents: () => void;
  onSitePress: (id: string) => void;
  onExploreCategory: (category: HighlightCategory) => void;
}

export function AboutCaviteContent({
  expressways,
  events,
  knownSiteIds,
  onEventPress,
  onViewAllEvents,
  onSitePress,
  onExploreCategory,
}: AboutCaviteContentProps) {
  const insets = useSafeAreaInsets();
  const [selectedExpresswayId, setSelectedExpresswayId] = useState<
    string | null
  >(null);
  const [isMapInteracting, setIsMapInteracting] = useState(false);

  const selectedExpressway = expressways.find(
    (expressway) => expressway.id === selectedExpresswayId,
  );

  const toggleExpressway = (id: string) =>
    setSelectedExpresswayId((current) => (current === id ? null : id));

  const stats = [
    { value: "1898", label: "Independence" },
    { value: String(ABOUT_HERO.citiesAndTowns), label: "Cities & towns" },
    { value: String(expressways.length), label: "Expressways" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.base },
      ]}
      showsVerticalScrollIndicator={false}
      // Locked while the user drags the map
      scrollEnabled={!isMapInteracting}
      nestedScrollEnabled={false}
      testID="about-cavite-scroll"
    >
      {/* Hero */}
      <View style={[styles.padded, styles.section]}>
        <View style={styles.heroCard}>
          <MaterialCommunityIcons
            name="flag-variant"
            size={160}
            color={colors.background}
            style={styles.heroWatermark}
          />

          <View style={styles.heroBadge}>
            <Ionicons name="book" size={14} color={colors.passportFoil} />
            <Text style={styles.heroBadgeText}>{ABOUT_HERO.eyebrow}</Text>
          </View>
          <Text style={styles.heroTitle} accessibilityRole="header">
            {ABOUT_HERO.title}
          </Text>
          <Text style={styles.heroDescription}>{ABOUT_HERO.description}</Text>

          <View style={styles.statsRow}>
            {stats.map((stat, index) => (
              <View
                key={stat.label}
                style={[styles.statItem, index > 0 && styles.statDivider]}
              >
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Province Highlights */}
      <View style={styles.section}>
        <SectionHeader
          eyebrow="ESSENCE OF CAVITE"
          title="Province Highlights"
          style={styles.padded}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={HIGHLIGHT_CARD_WIDTH + spacing.md}
          snapToAlignment="start"
          contentContainerStyle={styles.carouselContent}
        >
          {PROVINCE_HIGHLIGHTS.map((highlight) => (
            <HighlightCard
              key={highlight.id}
              highlight={highlight}
              onPress={() => onExploreCategory(highlight.category)}
            />
          ))}
        </ScrollView>
      </View>

      {/* History timeline */}
      <View style={[styles.padded, styles.section]}>
        <SectionHeader eyebrow="ROAD TO 1898" title="A Revolutionary Past" />
        <View style={styles.timelineCard}>
          {HISTORY_TIMELINE.map((milestone, index) => {
            const isLast = index === HISTORY_TIMELINE.length - 1;
            const siteId =
              milestone.siteId && knownSiteIds.has(milestone.siteId)
                ? milestone.siteId
                : undefined;

            return (
              <View key={milestone.year} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={styles.timelineDot} />
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                <View
                  style={[
                    styles.timelineBody,
                    !isLast && styles.timelineBodySpaced,
                  ]}
                >
                  <Text style={styles.timelineYear}>{milestone.year}</Text>
                  <Text style={styles.timelineTitle}>{milestone.title}</Text>
                  <Text style={styles.timelineDescription}>
                    {milestone.description}
                  </Text>
                  {siteId && (
                    <Pressable
                      onPress={() => onSitePress(siteId)}
                      hitSlop={spacing.sm}
                      accessibilityRole="link"
                      accessibilityLabel={`Visit the ${milestone.title} site`}
                      style={({ pressed }) => [
                        styles.inlineLink,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.inlineLinkText}>Visit the site</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color={colors.primary}
                      />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Signature dishes */}
      <View style={[styles.padded, styles.section]}>
        <SectionHeader
          eyebrow="TASTE OF THE PROVINCE"
          title="Culinary Delights"
          actionLabel="Places to eat"
          onAction={() => onExploreCategory("Dining")}
        />
        <View style={styles.dishGrid}>
          {SIGNATURE_DISHES.map((dish) => (
            <View key={dish.id} style={styles.dishCard}>
              <View style={styles.dishIcon}>
                <MaterialCommunityIcons
                  name={dish.icon}
                  size={20}
                  color={colors.accent}
                />
              </View>
              <Text style={styles.dishName}>{dish.name}</Text>
              <Text style={styles.dishOrigin}>{dish.origin}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Getting there: map + expressways */}
      <View style={styles.section}>
        <SectionHeader
          eyebrow="GETTING THERE"
          title="Expressways"
          style={styles.padded}
        />
        <View style={styles.padded}>
          <CaviteMap
            height={MAP_HEIGHT}
            selectedLabel={selectedExpressway?.name}
            onMapInteractionChange={setIsMapInteracting}
          />
        </View>

        {expressways.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.carouselContent,
              styles.expresswayRow,
            ]}
          >
            {expressways.map((expressway) => (
              <ExpresswayCard
                key={expressway.id}
                expressway={expressway}
                selected={expressway.id === selectedExpresswayId}
                onPress={toggleExpressway}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Upcoming festivals */}
      {events.length > 0 && (
        <View style={[styles.padded, styles.section]}>
          <SectionHeader
            eyebrow="MARK YOUR CALENDAR"
            title="Upcoming Festivals"
            actionLabel="View all"
            onAction={onViewAllEvents}
          />
          <View style={styles.eventList}>
            {events.map((event) => (
              <EventRow key={event.id} event={event} onPress={onEventPress} />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function HighlightCard({
  highlight,
  onPress,
}: {
  highlight: ProvinceHighlight;
  onPress: () => void;
}) {
  const { color, icon } = CATEGORY_STYLE[highlight.category];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${highlight.title}. Explore ${highlight.cta}`}
      style={({ pressed }) => [
        styles.highlightCard,
        // 8% tint of the category color
        { backgroundColor: `${color}14` },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.highlightTop}>
        <View style={[styles.highlightIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={18} color={colors.background} />
        </View>
        <Text style={[styles.highlightTag, { color }]}>
          {highlight.category.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.highlightTitle}>{highlight.title}</Text>
      <Text style={styles.highlightDescription}>{highlight.description}</Text>

      <View style={styles.highlightCta}>
        <Text style={[styles.highlightCtaText, { color }]}>
          {highlight.cta}
        </Text>
        <Ionicons name="arrow-forward" size={14} color={color} />
      </View>
    </Pressable>
  );
}

function EventRow({
  event,
  onPress,
}: {
  event: Event;
  onPress: (id: string) => void;
}) {
  const start = new Date(event.startDate);
  const month = start
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const isHappening = getEventStatus(event) === "happening";

  return (
    <Pressable
      onPress={() => onPress(event.id)}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${start.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })}, ${event.municipality}`}
      style={({ pressed }) => [styles.eventRow, pressed && styles.pressed]}
    >
      <View style={styles.dateBlock}>
        <Text style={styles.dateMonth}>{month}</Text>
        <Text style={styles.dateDay}>{start.getDate()}</Text>
      </View>

      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.eventMeta}>
          <Ionicons name="location" size={12} color={colors.textSecondary} />
          <Text style={styles.eventMunicipality} numberOfLines={1}>
            {event.municipality}
          </Text>
          {isHappening && (
            <View style={styles.happeningTag}>
              <Text style={styles.happeningTagText}>Happening now</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Bleeds past ScreenContainer's horizontal padding so carousels scroll edge
  // to edge; `padded` re-applies it to everything else.
  container: {
    flex: 1,
    marginHorizontal: -spacing.base,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: spacing.xs,
  },
  padded: {
    paddingHorizontal: spacing.base,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  pressed: {
    opacity: 0.7,
  },
  carouselContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },

  // Hero
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: "hidden",
  },
  heroWatermark: {
    position: "absolute",
    right: -spacing.xxl,
    top: -spacing.lg,
    opacity: 0.06,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  heroBadgeText: {
    ...typography.labelSmall,
    color: colors.passportFoil,
    letterSpacing: 1.2,
  },
  heroTitle: {
    ...typography.displayLargeMobile,
    fontFamily: "Inter_700Bold",
    color: colors.background,
  },
  heroDescription: {
    ...typography.bodyMedium,
    color: colors.background,
    opacity: 0.85,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${colors.background}40`,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: `${colors.background}40`,
  },
  statValue: {
    ...typography.headlineLarge,
    fontFamily: "Inter_700Bold",
    color: colors.passportFoil,
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.background,
    opacity: 0.85,
    textTransform: "uppercase",
  },

  // Highlights carousel
  highlightCard: {
    width: HIGHLIGHT_CARD_WIDTH,
    borderRadius: radii.card,
    padding: spacing.base,
    gap: spacing.sm,
  },
  highlightTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  highlightIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  highlightTag: {
    ...typography.labelSmall,
    letterSpacing: 1,
  },
  highlightTitle: {
    ...typography.headlineSmall,
    fontFamily: "Inter_700Bold",
    color: colors.text,
  },
  highlightDescription: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    flexGrow: 1,
  },
  highlightCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  highlightCtaText: {
    ...typography.labelLarge,
  },

  // Timeline
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
  },
  timelineRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timelineRail: {
    width: 12,
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.accentTint,
    marginTop: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
  },
  timelineBody: {
    flex: 1,
    gap: 2,
  },
  timelineBodySpaced: {
    paddingBottom: spacing.lg,
  },
  timelineYear: {
    ...typography.labelLarge,
    fontFamily: "Inter_700Bold",
    color: colors.accent,
  },
  timelineTitle: {
    ...typography.titleMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.text,
  },
  timelineDescription: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  inlineLink: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 2,
    marginTop: spacing.xs,
  },
  inlineLinkText: {
    ...typography.labelLarge,
    color: colors.primary,
  },

  // Dishes
  dishGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  dishCard: {
    // Two columns: grow to fill, wrap once a third wouldn't fit
    flexGrow: 1,
    flexBasis: "40%",
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    gap: 2,
  },
  dishIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  dishName: {
    ...typography.titleMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.textTertiary,
  },
  dishOrigin: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Expressways
  expresswayRow: {
    paddingTop: spacing.md,
  },

  // Upcoming festivals
  eventList: {
    gap: spacing.md,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radii.card,
    padding: spacing.md,
    ...shadows.card,
  },
  dateBlock: {
    width: 52,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  dateMonth: {
    ...typography.labelSmall,
    color: colors.accent,
  },
  dateDay: {
    ...typography.headlineMedium,
    fontFamily: "Inter_700Bold",
    color: colors.text,
  },
  eventInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  eventTitle: {
    ...typography.titleMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.text,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  eventMunicipality: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  happeningTag: {
    backgroundColor: colors.successLight,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.xs,
  },
  happeningTagText: {
    ...typography.labelSmall,
    color: colors.successDark,
  },
});
