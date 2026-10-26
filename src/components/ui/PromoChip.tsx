import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme';
import { usePromoPeriod } from '@/hooks/usePromoPeriod';

/**
 * PromoChip Component
 * 
 * Displays the current promo period with a green active indicator dot.
 * Fetches promo data dynamically using the usePromoPeriod hook.
 * 
 * Validates: Requirements 1.2.8 (PromoChip Component)
 */

export interface PromoChipProps {
  /**
   * Test identifier for automated testing
   */
  testID?: string;
}

export function PromoChip({ testID }: PromoChipProps) {
  const { data: promoPeriod, isLoading } = usePromoPeriod();

  if (isLoading) {
    return (
      <View style={styles.container} testID={testID}>
        <ActivityIndicator size="small" color={colors.success} />
      </View>
    );
  }

  if (!promoPeriod) {
    return null;
  }

  // Format dates as "MMM D" (e.g., "Jan 1")
  const formatDate = (dateInput: Date | string) => {
    // Convert to Date object if it's a string (happens after serialization)
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const startDate = formatDate(promoPeriod.startDate);
  const endDate = formatDate(promoPeriod.endDate);
  
  // Get year from end date
  const endDateObj = typeof promoPeriod.endDate === 'string' 
    ? new Date(promoPeriod.endDate) 
    : promoPeriod.endDate;
  const year = endDateObj.getFullYear();
  
  const promoText = `Promo: ${startDate} - ${endDate}, ${year}`;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.dot} />
      <Text style={styles.text}>{promoText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.chip,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  text: {
    ...typography.bodySmall,
    color: colors.text,
  },
});
