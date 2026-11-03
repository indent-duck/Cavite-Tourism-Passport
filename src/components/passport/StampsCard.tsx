import { Category, Event, Site, Stamp } from '@/data/types';
import {
    PASSPORT_STAMPS_HEADER,
    PASSPORT_STAMPS_TITLE,
} from '@/lib/constants';
import { colors, radii, spacing, typography } from '@/theme';
import { StyleSheet, Text, View } from 'react-native';
import { StampSlot } from './StampSlot';

interface StampsCardProps {
  stamps: Stamp[];
  sites: Site[];
  events: Event[];
}

/**
 * Group sites by category in the specified order
 */
function groupSitesByCategory(sites: Site[]): Record<Category, Site[]> {
  const groups: Record<Category, Site[]> = {
    Dining: [],
    Staycation: [],
    Adventure: [],
    Heritage: [],
    Festival: [],
  };

  sites.forEach((site) => {
    if (site.category !== 'Festival') {
      groups[site.category].push(site);
    }
  });

  return groups;
}

/**
 * Get festival events that offer stamps
 */
function getFestivalEvents(events: Event[]): Event[] {
  return events.filter(
    (event) => event.festivalStamp && event.festivalStamp.available
  );
}

/**
 * Find stamp for a given site ID
 */
function findStampForSite(stamps: Stamp[], siteId: string): Stamp | undefined {
  return stamps.find((stamp) => stamp.siteId === siteId);
}

export function StampsCard({ stamps, sites, events }: StampsCardProps) {
  const siteGroups = groupSitesByCategory(sites);
  const festivalEvents = getFestivalEvents(events);
  const categoryOrder: Category[] = [
    'Dining',
    'Staycation',
    'Adventure',
    'Heritage',
    'Festival',
  ];

  // Build flat list of slots in category order
  const slots: {
    site: Site | Event;
    stamp: Stamp | undefined;
    category: Category;
    siteId: string;
  }[] = [];

  // Add sites by category
  categoryOrder.forEach((category) => {
    if (category !== 'Festival') {
      siteGroups[category].forEach((site) => {
        slots.push({
          site,
          stamp: findStampForSite(stamps, site.id),
          category,
          siteId: site.id,
        });
      });
    }
  });

  // Add festival events
  festivalEvents.forEach((event) => {
    slots.push({
      site: event,
      stamp: findStampForSite(stamps, event.id),
      category: 'Festival',
      siteId: event.id,
    });
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{PASSPORT_STAMPS_TITLE}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{stamps.length} STAMPED</Text>
        </View>
      </View>

      {/* Body - Stamp slots in 2-column grid */}
      <View style={styles.body}>
        <View style={styles.grid}>
          {slots.map((slot, index) => (
            <StampSlot
              key={`${slot.siteId}-${index}`}
              site={slot.site}
              stamp={slot.stamp}
              category={slot.category}
              siteId={slot.siteId}
            />
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{PASSPORT_STAMPS_HEADER}</Text>
        <Text style={styles.footerPageNumber}>PAGE 02</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.primary,
    borderBottomWidth: 3,
    borderBottomColor: colors.passportHeaderBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.titleMedium,
    color: colors.background,
  },
  badge: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.background,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typography.labelSmall,
    color: colors.background,
  },
  body: {
    backgroundColor: colors.passportCream,
    padding: spacing.base,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  footer: {
    backgroundColor: '#F5E6D3',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    ...typography.labelSmall,
    color: colors.text,
  },
  footerPageNumber: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
});
