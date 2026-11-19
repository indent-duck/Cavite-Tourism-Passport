import { PASSPORT_ISSUER_LINE } from '@/lib/constants';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useId } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

interface PassportCoverProps {
  title: string;
  tagline: string;
  /** Height of the page that overlaps the bottom of the cover */
  overlap?: number;
}

/**
 * PassportCover
 *
 * Full-bleed "leather passport cover" hero for the login screen. Uses the
 * same leather, foil and guilloche treatment as the Passport tab so the
 * booklet the user sees after signing in matches their first impression.
 * Draws under the status bar, so the screen must render a light status bar.
 */
export function PassportCover({ title, tagline, overlap = 0 }: PassportCoverProps) {
  const insets = useSafeAreaInsets();
  // SVG ids must be unique per instance and contain only safe characters
  const patternId = `cover-guilloche-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View
      style={[
        styles.cover,
        { paddingTop: insets.top + spacing.xl, paddingBottom: spacing.xxl + overlap },
      ]}
    >
      {/* Foil security pattern */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <Pattern id={patternId} x={0} y={0} width={32} height={32} patternUnits="userSpaceOnUse">
            <Circle cx={0} cy={0} r={16} stroke={colors.passportFoil} strokeWidth={0.6} fill="none" />
            <Circle cx={32} cy={0} r={16} stroke={colors.passportFoil} strokeWidth={0.6} fill="none" />
            <Circle cx={0} cy={32} r={16} stroke={colors.passportFoil} strokeWidth={0.6} fill="none" />
            <Circle cx={32} cy={32} r={16} stroke={colors.passportFoil} strokeWidth={0.6} fill="none" />
            <Circle cx={16} cy={16} r={16} stroke={colors.passportFoil} strokeWidth={0.6} fill="none" />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${patternId})`} opacity={0.12} />
      </Svg>

      <Text style={styles.issuer}>{PASSPORT_ISSUER_LINE}</Text>

      {/* Foil seal */}
      <View style={styles.sealOuter} accessible={false}>
        <View style={styles.sealInner}>
          <Ionicons name="compass-outline" size={34} color={colors.passportFoil} />
          <Text style={styles.sealYear}>1898</Text>
        </View>
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.foilRule} />
      <Text style={styles.tagline}>{tagline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    backgroundColor: colors.passportLeather,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
  },
  issuer: {
    ...typography.labelSmall,
    fontFamily: 'Inter_600SemiBold',
    color: colors.passportFoil,
    textTransform: 'uppercase',
    letterSpacing: 2.4,
    marginBottom: spacing.lg,
  },
  sealOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: colors.passportFoil,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  sealInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.passportFoil,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealYear: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.passportFoil,
    letterSpacing: 2,
    marginTop: 2,
  },
  title: {
    ...typography.headlineLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.passportFoil,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  foilRule: {
    width: 48,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.passportFoil,
    marginVertical: spacing.md,
  },
  tagline: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.background,
    opacity: 0.85,
    textAlign: 'center',
  },
});
