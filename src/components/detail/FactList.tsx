import { Card } from '@/components/ui/Card';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface Fact {
  icon: IconName;
  /** Small uppercase caption, e.g. "Hours" */
  label: string;
  value: string;
  /** Overrides the value color, e.g. green for "Open now" */
  valueColor?: string;
  /** Secondary line under the value */
  detail?: string;
}

export interface FactListProps {
  facts: readonly Fact[];
  testID?: string;
}

/**
 * Key facts card (hours, address, dates...) as icon rows separated by
 * hairlines. Used on site and event detail screens.
 */
export function FactList({ facts, testID }: FactListProps) {
  return (
    <Card testID={testID}>
      {facts.map((fact, index) => (
        <Fragment key={fact.label}>
          {index > 0 && <View style={styles.divider} />}
          <View
            style={styles.row}
            accessible
            accessibilityLabel={[fact.label, fact.value, fact.detail].filter(Boolean).join(', ')}
          >
            <View style={styles.icon}>
              <Ionicons name={fact.icon} size={18} color={colors.primary} />
            </View>
            <View style={styles.text}>
              <Text style={styles.label}>{fact.label}</Text>
              <Text style={[styles.value, fact.valueColor ? { color: fact.valueColor } : null]}>
                {fact.value}
              </Text>
              {fact.detail && <Text style={styles.detail}>{fact.detail}</Text>}
            </View>
          </View>
        </Fragment>
      ))}
    </Card>
  );
}

const ICON_SIZE = 36;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  text: {
    flex: 1,
  },
  label: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  value: {
    ...typography.labelLarge,
    color: colors.text,
  },
  detail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    // Line up with the text, not the icon
    marginLeft: spacing.md + ICON_SIZE + spacing.md,
  },
});
