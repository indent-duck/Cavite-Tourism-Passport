import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '@/theme';
import {
  PASSPORT_ISSUER_LINE,
  PASSPORT_SUBTITLE,
  PASSPORT_HEADER_LABEL,
  PASSPORT_FOOTER,
} from '@/lib/constants';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePromoPeriod } from '@/hooks/usePromoPeriod';

/**
 * Format date as "01 JAN 2027"
 */
function formatPassportDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(date)
    .toUpperCase();
}

/**
 * Identity Page card component
 * 
 * Displays passport identity information including holder details,
 * passport ID, and validity dates from promo period.
 * 
 * Validates: Requirements 2.4, 2.5
 */
export function IdentityCard() {
  const { data: currentUser } = useCurrentUser();
  const { data: promoPeriod } = usePromoPeriod();

  if (!currentUser || !promoPeriod) {
    return null;
  }

  const issuedDate = formatPassportDate(promoPeriod.startDate);
  const validThroughDate = formatPassportDate(promoPeriod.endDate);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield" size={24} color={colors.background} />
          <View style={styles.headerText}>
            <Text style={styles.issuerLine}>{PASSPORT_ISSUER_LINE}</Text>
            <Text style={styles.subtitle}>{PASSPORT_SUBTITLE}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{PASSPORT_HEADER_LABEL}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Holder Icon and Passport ID */}
        <View style={styles.holderSection}>
          <Ionicons
            name="person-circle"
            size={80}
            color={colors.primary}
            style={styles.personIcon}
          />
          <View style={styles.passportIdSection}>
            <Text style={styles.passportId}>{currentUser.passportId}</Text>
            <Text style={styles.fieldLabel}>Passport ID</Text>
          </View>
        </View>

        {/* Full Name */}
        <View style={styles.field}>
          <Text style={styles.fieldValue}>{currentUser.name}</Text>
          <Text style={styles.fieldLabel}>Full Name</Text>
        </View>

        {/* Address */}
        <View style={styles.field}>
          <Text style={styles.fieldValue}>{currentUser.address}</Text>
          <Text style={styles.fieldLabel}>Address</Text>
        </View>

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Issued:</Text>
            <Text style={styles.dateValue}>{issuedDate}</Text>
          </View>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Valid Through:</Text>
            <Text style={styles.dateValue}>{validThroughDate}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{PASSPORT_FOOTER}</Text>
        <Text style={styles.footerPage}>PAGE 01</Text>
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
  
  // Header styles
  header: {
    backgroundColor: colors.primary,
    borderBottomWidth: 3,
    borderBottomColor: colors.passportHeaderBorder,
    paddingVertical: 12, // py-3
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerText: {
    gap: 2,
  },
  issuerLine: {
    ...typography.labelMedium,
    color: colors.background,
    textTransform: 'uppercase',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.background,
    opacity: 0.9,
  },
  badge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    ...typography.labelSmall,
    color: colors.primary,
  },
  
  // Body styles
  body: {
    backgroundColor: colors.passportCream,
    padding: spacing.base, // p-4
    gap: spacing.md,
  },
  holderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginBottom: spacing.sm,
  },
  personIcon: {
    width: 80,
    height: 80,
  },
  passportIdSection: {
    flex: 1,
    gap: 4,
  },
  passportId: {
    fontFamily: 'monospace',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.text,
  },
  
  // Field styles
  field: {
    gap: 4,
  },
  fieldValue: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  fieldLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  
  // Dates row
  datesRow: {
    flexDirection: 'row',
    gap: spacing.base,
    marginTop: spacing.sm,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateValue: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  
  // Footer styles
  footer: {
    backgroundColor: '#F5E6D3', // Beige footer
    paddingVertical: 6, // py-1.5
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  footerPage: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
});
