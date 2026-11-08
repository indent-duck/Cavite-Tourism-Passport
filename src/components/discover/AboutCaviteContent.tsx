import { CaviteMap } from '@/components/map/CaviteMap';
import type { Event, Expressway } from '@/data/types';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface AboutCaviteContentProps {
  onEventPress: (id: string) => void;
  expressways: Expressway[];
  events: Event[];
}

const EXPRESSWAY_DISTANCES: Record<string, string> = {
  'exp-1': '54 km',
  'exp-2': '7.2 km',
  'exp-3': '45 km',
};

export function AboutCaviteContent({
  expressways,
  events,
  onEventPress,
}: AboutCaviteContentProps) {
  const [selectedExpressway, setSelectedExpressway] = useState<string | null>(null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Hero Card with Stats */}
      <View style={styles.heroCard}>
        {/* Badge at top */}
        <View style={styles.heroBadge}>
          <Ionicons name="book" size={16} color="#FFB800" />
          <Text style={styles.heroBadgeText}>HISTORIC HEARTLAND</Text>
        </View>
        
        <Text style={styles.heroTitle}>Land of the Brave & Historic Horizons</Text>
        <Text style={styles.heroDescription}>
          Welcome to Cavite—the undisputed Cradle of Philippine Independence. This province pulses with historic valor, scenic bayshore coasts along Manila Bay, and a lush tapestry of inland Tagaytay ridges flanked by temperate volcanic cliffs of the Tagaytay Ridge. As the storied bastion of Caviteño patriots dueling Manila&apos;s imperial gatekeepers in the late Spanish era, and the revered birthplace of our nation&apos;s historic, maritime history, and agricultural tapestry.
        </Text>
        
        {/* Stats row - no boxes, inline layout */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValueYellow}>1898</Text>
            <Text style={styles.statLabel}>INDEPENDENCE</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statLabel}>MUNICIPALITIES</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValueYellow}>7</Text>
            <Text style={styles.statLabel}>EXPRESSWAYS</Text>
          </View>
        </View>
      </View>

      {/* 2. Province Highlights */}
      <View style={styles.section}>
        <View style={styles.provinceHighlightsHeader}>
          <Text style={styles.provinceHighlightsTitle}>Province Highlights</Text>
          <Text style={styles.essenceBadge}>ESSENCE OF CAVITE</Text>
        </View>
        <View style={styles.highlightCard}>
          <View style={styles.highlightImagePlaceholder}>
            <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
          </View>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>Heritage & Landscape</Text>
          </View>
          <Text style={styles.highlightTitle}>Gateway to Philippine Independence</Text>
          <Text style={styles.highlightDescription}>
            Cavite played a pivotal role in Philippine history as the birthplace of independence
            and home to numerous historical landmarks.
          </Text>
        </View>
      </View>

      {/* 3. Historical & Topographical Riches */}
      <View style={styles.section}>
        <View style={styles.contentCard}>
          <View style={styles.cardImagePlaceholder}>
            <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Historical and Topographical Riches</Text>
            <Text style={styles.cardDescription}>
              From the temperate volcanic cliffs of the Tagaytay Ridge to the storied bastion of Caviteño patriots dueling Manila&apos;s imperial gatekeepers, the island bastion of Corregidor guarding Manila Bay, and the revered birthplace of our nation&apos;s historic, maritime history, and agricultural tapestry.
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Culinary Delights */}
      <View style={styles.section}>
        <View style={styles.contentCard}>
          <View style={styles.cardImagePlaceholder}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Culinary Delights</Text>
            <Text style={styles.cardDescription}>
              Cavite&apos;s distinct coastal flavors with hearty upland cuisines:
            </Text>
            
            {/* Culinary items grid - simple text cards */}
            <View style={styles.culinaryGrid}>
              <View style={styles.culinaryTextCard}>
                <Text style={styles.culinaryItemName}>Kaweng Barako</Text>
                <Text style={styles.culinaryItemDescription}>Liberato style</Text>
              </View>
              <View style={styles.culinaryTextCard}>
                <Text style={styles.culinaryItemName}>Pancit Puso</Text>
                <Text style={styles.culinaryItemDescription}>Cavite City tradition</Text>
              </View>
              <View style={styles.culinaryTextCard}>
                <Text style={styles.culinaryItemName}>Tambalang Burong</Text>
                <Text style={styles.culinaryItemDescription}>Gen-tri rich coconut</Text>
              </View>
              <View style={styles.culinaryTextCard}>
                <Text style={styles.culinaryItemName}>Panutsa</Text>
                <Text style={styles.culinaryItemDescription}>Silang sweet treat</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 6. Expressways & Province Map */}
      <View style={styles.section}>
        <View style={styles.mapSectionHeader}>
          <Text style={styles.mapSectionTitle}>Expressways & Province Map</Text>
          <View style={styles.interactiveBadge}>
            <Text style={styles.interactiveBadgeText}>Interactive</Text>
          </View>
        </View>
        
        {/* Map */}
        <View style={styles.mapContainer}>
          <CaviteMap
            height={300}
            selectedLabel={
              selectedExpressway && expressways.find((e) => e.id === selectedExpressway)
                ? `Selected: ${expressways.find((e) => e.id === selectedExpressway)?.name}`
                : undefined
            }
          />
        </View>
        
        <Text style={styles.mapInstruction}>
          Tap expressway cards below or town pins on map
        </Text>
        
        {/* Expressway Gateways Section */}
        <Text style={styles.gatewaysHeading}>EXPRESSWAY GATEWAYS</Text>
        <View style={styles.expresswaysContainer}>
          {expressways.map((expressway) => (
            <Pressable
              key={expressway.id}
              style={({ pressed }) => [
                styles.expresswayCard,
                selectedExpressway === expressway.id && styles.expresswayCardSelected,
                pressed && styles.expresswayCardPressed,
              ]}
              onPress={() =>
                setSelectedExpressway(
                  selectedExpressway === expressway.id ? null : expressway.id
                )
              }
            >
              <View style={styles.expresswayHeader}>
                <Ionicons name="git-network-outline" size={24} color={colors.textSecondary} />
                {EXPRESSWAY_DISTANCES[expressway.id] && (
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceBadgeText}>
                      {EXPRESSWAY_DISTANCES[expressway.id]}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.expresswayName}>{expressway.name}</Text>
              <Text style={styles.expresswayLocationSpan}>{expressway.locationSpan}</Text>
              <Text style={styles.expresswayDescription} numberOfLines={2}>
                {expressway.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 7. Festival Calendar */}
      {events.length > 0 && (
        <View style={styles.section}>
          <View style={styles.festivalCalendarHeader}>
            <Text style={styles.sectionTitle}>Quick Festival Calendar</Text>
            <Text style={styles.viewAllLink}>View all →</Text>
          </View>
          {events.map((event) => (
            <Pressable
              key={event.id}
              style={({ pressed }) => [styles.eventCard, pressed && styles.eventCardPressed]}
              onPress={() => onEventPress(event.id)}
            >
              <View style={styles.eventImagePlaceholder}>
                <Ionicons name="calendar-outline" size={32} color={colors.textSecondary} />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.municipality}</Text>
                <Text style={styles.eventDescription} numberOfLines={2}>
                  {event.description}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: 0,
    paddingBottom: 100, // Account for tab bar
  },

  // Hero Card
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.card,
    padding: spacing.lg,
    marginBottom: spacing.base,
    gap: spacing.md,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  heroBadgeText: {
    ...typography.labelMedium,
    color: '#FFB800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  heroTitle: {
    ...typography.headlineLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.background,
  },
  heroDescription: {
    ...typography.bodyMedium,
    color: colors.background,
    lineHeight: 20,
    opacity: 0.9,
    textAlign: 'justify' as const,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700' as const,
    color: colors.background,
  },
  statValueYellow: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700' as const,
    color: '#FFB800',
  },
  statLabel: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '600' as const,
    color: colors.background,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Sections
  section: {
    marginBottom: spacing.base,
  },
  
  // Province Highlights Header
  provinceHighlightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
    marginTop: spacing.md,
  },
  provinceHighlightsTitle: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    letterSpacing: 1,
    fontSize: 13,
  },
  essenceBadge: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.textSecondary,
    letterSpacing: 1,
    fontSize: 9,
  },
  
  // Content Cards (Historical & Culinary)
  contentCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  cardImagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.headlineMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.primary, // Blue color
  },
  cardDescription: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Province Highlights
  highlightCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  highlightImagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.success,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    margin: spacing.base,
  },
  categoryTagText: {
    ...typography.bodySmall,
    color: colors.background,
    fontWeight: '600',
    fontSize: 12,
  },
  highlightTitle: {
    ...typography.headlineMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.primary, // Blue color
    marginHorizontal: spacing.base,
    marginBottom: spacing.xs,
  },
  highlightDescription: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    margin: spacing.base,
    marginTop: 0,
  },

  // Culinary Grid
  culinaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  culinaryTextCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  culinaryItemName: {
    ...typography.titleMedium,
    fontFamily: 'Inter_600SemiBold',
    color: '#8B4513', // Brown color from reference
    marginBottom: spacing.xs,
  },
  culinaryItemDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  
  // Map Section
  mapSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  mapSectionTitle: {
    ...typography.headlineLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    flex: 1,
    flexShrink: 1,
  },
  interactiveBadge: {
    backgroundColor: colors.accent,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexShrink: 0,
  },
  interactiveBadgeText: {
    ...typography.bodySmall,
    fontFamily: 'Inter_600SemiBold',
    color: colors.background,
    fontSize: 10,
  },
  mapContainer: {
    height: 300,
    borderRadius: radii.card,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  mapInstruction: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  gatewaysHeading: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },

  // Expressways
  expresswaysContainer: {
    gap: spacing.base,
    marginBottom: spacing.base,
  },
  expresswayCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.base,
    gap: spacing.sm,
  },
  expresswayCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0D`,
  },
  expresswayCardPressed: {
    opacity: 0.7,
  },
  expresswayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  distanceBadgeText: {
    ...typography.bodySmall,
    color: colors.background,
    fontWeight: '600',
    fontSize: 12,
  },
  expresswayName: {
    ...typography.headlineMedium,
    color: colors.text,
  },
  expresswayLocationSpan: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  expresswayDescription: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },

  // Festival Calendar
  sectionTitle: {
    ...typography.headlineLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  festivalCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viewAllLink: {
    ...typography.bodyMedium,
    color: colors.accent,
    fontFamily: 'Inter_600SemiBold',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    marginBottom: spacing.base,
    gap: spacing.base,
  },
  eventCardPressed: {
    opacity: 0.7,
  },
  eventImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.border,
    borderRadius: radii.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  eventTitle: {
    ...typography.headlineSmall,
    color: colors.text,
  },
  eventDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  eventDescription: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
});
