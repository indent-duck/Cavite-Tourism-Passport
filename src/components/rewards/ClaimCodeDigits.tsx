import { colors, radii } from '@/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface ClaimCodeDigitsProps {
  /** 6 digits, e.g. "482917" */
  code: string;
  /**
   * ticket: large white tiles on the code screen's paper ticket
   * banner: orange-tinted tiles in the Rewards hub banner
   */
  variant?: 'ticket' | 'banner';
  /** Fade the digits (an expired code) */
  dimmed?: boolean;
}

/**
 * A claim code as two groups of three digit tiles ("482 917"), so it reads
 * out in two chunks at the desk.
 *
 * Each digit sits centered in its own box instead of one long line of text:
 * a single selectable Text could end up taller than its frame on Android and
 * scroll inside it. Tiles keep their shape and shrink with the width on small
 * phones. Hidden from screen readers; the parent's label spells the code
 * (spellClaimCode).
 */
export function ClaimCodeDigits({ code, variant = 'ticket', dimmed = false }: ClaimCodeDigitsProps) {
  const digits = code.split('');
  const groups = digits.length === 6 ? [digits.slice(0, 3), digits.slice(3)] : [digits];
  const v = VARIANTS[variant];

  return (
    <View
      style={[styles.row, { gap: v.groupGap }, dimmed && styles.dimmed]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {groups.map((group, g) => (
        <View
          key={g}
          style={[
            styles.group,
            { gap: v.tileGap, maxWidth: group.length * v.tileMaxWidth + (group.length - 1) * v.tileGap },
          ]}
        >
          {group.map((digit, i) => (
            <View key={i} style={[styles.tile, v.tile]}>
              <Text style={[styles.digit, v.digit]} maxFontSizeMultiplier={1.2}>
                {digit}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const VARIANTS = {
  ticket: {
    tileMaxWidth: 48,
    tileGap: 6,
    groupGap: 14,
    tile: {
      maxWidth: 48,
      aspectRatio: 0.8,
      borderRadius: radii.md,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.passportPaperBorder,
    },
    digit: { fontSize: 32, lineHeight: 40, color: colors.text },
  },
  banner: {
    tileMaxWidth: 30,
    tileGap: 4,
    groupGap: 10,
    tile: {
      maxWidth: 30,
      aspectRatio: 0.85,
      borderRadius: radii.sm,
      backgroundColor: colors.accentTint,
      borderWidth: 1,
      borderColor: colors.accentBorder,
    },
    digit: { fontSize: 20, lineHeight: 24, color: colors.text },
  },
} as const;

const styles = StyleSheet.create({
  row: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.2,
  },
  group: {
    flex: 1,
    flexDirection: 'row',
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    // Android adds font padding above the glyphs; without it the digit
    // centers in its tile
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
