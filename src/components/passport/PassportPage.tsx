import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useId } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

interface PassportPageProps {
  /** Ionicons glyph shown in the foil emblem on the header */
  icon: keyof typeof Ionicons.glyphMap;
  /** Foil-colored headline (e.g. issuer line) */
  title: string;
  /** Smaller line under the title */
  subtitle: string;
  /** Text inside the outlined foil badge on the right of the header */
  badge: string;
  /** Left side of the footer strip */
  footerText: string;
  /** Page number shown on the right of the footer strip (e.g. "01") */
  pageNumber: string;
  children: ReactNode;
  testID?: string;
}

/**
 * PassportPage
 *
 * Shared booklet-page shell for the passport screen. Renders the
 * leather header with foil accents, a cream page with a guilloche
 * security pattern and crest watermark, and the page footer strip.
 */
export function PassportPage({
  icon,
  title,
  subtitle,
  badge,
  footerText,
  pageNumber,
  children,
  testID,
}: PassportPageProps) {
  // SVG ids must be unique per instance and contain only safe characters
  const patternId = `guilloche-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View style={styles.shadow} testID={testID}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.emblem}>
            <Ionicons name={icon} size={18} color={colors.passportFoil} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {badge}
            </Text>
          </View>
        </View>
        <View style={styles.foilRule} />

        {/* Page body */}
        <View style={styles.body}>
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <Pattern
                id={patternId}
                x={0}
                y={0}
                width={28}
                height={28}
                patternUnits="userSpaceOnUse"
              >
                <Circle cx={0} cy={0} r={14} stroke={colors.passportGuilloche} strokeWidth={0.6} fill="none" />
                <Circle cx={28} cy={0} r={14} stroke={colors.passportGuilloche} strokeWidth={0.6} fill="none" />
                <Circle cx={0} cy={28} r={14} stroke={colors.passportGuilloche} strokeWidth={0.6} fill="none" />
                <Circle cx={28} cy={28} r={14} stroke={colors.passportGuilloche} strokeWidth={0.6} fill="none" />
                <Circle cx={14} cy={14} r={14} stroke={colors.passportGuilloche} strokeWidth={0.6} fill="none" />
              </Pattern>
            </Defs>
            <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${patternId})`} opacity={0.35} />
          </Svg>

          {/* Crest watermark */}
          <View style={styles.watermark}>
            <Ionicons name="shield" size={180} color={colors.primary} />
          </View>

          {children}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText} numberOfLines={1}>
            {footerText}
          </Text>
          <Text style={styles.footerPage}>PAGE {pageNumber}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Outer wrapper carries the shadow so the inner card can clip its children
  shadow: {
    borderRadius: radii.card,
    backgroundColor: colors.passportCream,
    shadowColor: colors.passportLeather,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.passportLeather,
    overflow: 'hidden',
  },

  // Header
  header: {
    backgroundColor: colors.passportLeather,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emblem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.passportFoil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.passportFoil,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    ...typography.labelSmall,
    fontFamily: 'Inter_600SemiBold',
    color: colors.background,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.passportFoil,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.passportFoil,
    letterSpacing: 1.5,
  },
  foilRule: {
    height: 3,
    backgroundColor: colors.passportHeaderBorder,
  },

  // Body
  body: {
    backgroundColor: colors.passportCream,
    padding: spacing.base,
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    right: -40,
    bottom: -30,
    opacity: 0.04,
    pointerEvents: 'none',
  },

  // Footer
  footer: {
    backgroundColor: colors.passportFooter,
    borderTopWidth: 1,
    borderTopColor: colors.passportPaperBorder,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    ...typography.labelSmall,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
  },
  footerPage: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    letterSpacing: 1,
  },
});
