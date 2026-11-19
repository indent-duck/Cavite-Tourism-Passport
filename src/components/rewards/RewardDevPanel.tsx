import { Button } from '@/components/ui/Button';
import { setMockScenario } from '@/data/api';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const SCENARIOS = [
  { id: 'default', label: 'Default', hint: '450 pts, missing Adventure' },
  { id: 'eligible', label: 'Eligible', hint: '900 pts, all categories' },
  { id: 'claimed', label: 'Claimed', hint: 'Already claimed' },
] as const;

export interface RewardDevPanelProps {
  /** Key/value lines describing the current state */
  info: [string, string][];
  /** Shown while a claim QR is active */
  onSimulateScan?: () => void;
  simulating?: boolean;
}

/**
 * Dev-only tools for the reward detail screen, collapsed by default so the
 * real layout can be judged as users will see it. Render only under __DEV__.
 */
export function RewardDevPanel({ info, onSimulateScan, simulating }: RewardDevPanelProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  return (
    <View style={styles.panel}>
      <Pressable
        style={styles.toggle}
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        testID="dev-panel-toggle"
      >
        <Ionicons name="construct" size={14} color={colors.textSecondary} />
        <Text style={styles.toggleText}>Dev tools</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.textSecondary}
        />
      </Pressable>

      {open && (
        <View style={styles.body}>
          <View style={styles.scenarios}>
            {SCENARIOS.map((scenario) => (
              <Pressable
                key={scenario.id}
                style={styles.scenario}
                onPress={() => {
                  setMockScenario(scenario.id);
                  queryClient.invalidateQueries();
                }}
                testID={`dev-scenario-${scenario.id}`}
              >
                <Text style={styles.scenarioLabel}>{scenario.label}</Text>
                <Text style={styles.scenarioHint}>{scenario.hint}</Text>
              </Pressable>
            ))}
          </View>

          {onSimulateScan && (
            <Button
              title="Simulate officer scan"
              onPress={onSimulateScan}
              variant="primary"
              size="compact"
              loading={simulating}
              fullWidth
              testID="dev-simulate-claim-button"
            />
          )}

          <View>
            {info.map(([label, value]) => (
              <Text key={label} style={styles.info}>
                {label}: <Text style={styles.infoValue}>{value}</Text>
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.xl,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  toggleText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  body: {
    gap: spacing.md,
    padding: spacing.md,
    paddingTop: 0,
  },
  scenarios: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scenario: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  scenarioLabel: {
    ...typography.labelMedium,
    color: colors.text,
  },
  scenarioHint: {
    ...typography.labelSmall,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  info: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoValue: {
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
});
