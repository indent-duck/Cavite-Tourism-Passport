import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface PassportIdCardProps {
  userName: string;
  municipality: string;
  passportId: string;
}

// Muted light-blue used for secondary text on the dark card
const CARD_MUTED_TEXT = 'rgba(212, 227, 255, 0.8)';
const CARD_HAIRLINE = 'rgba(255, 255, 255, 0.1)';

/**
 * Extracts the issue year from a passport ID (format: CVT-YYYY-NNNNNN).
 */
function getIssueYear(passportId: string): string | null {
  const match = passportId.match(/^[A-Z]+-(\d{4})-/);
  return match ? match[1] : null;
}

/**
 * PassportIdCard Component
 *
 * Displays the user's digital Cavite Tourism Passport ID card with:
 * - Official header with shield icon and title
 * - Active status badge
 * - Passport ID number
 * - Holder information (name and municipality)
 * - Security decorative elements
 */
export function PassportIdCard({ userName, municipality, passportId }: PassportIdCardProps) {
  const issueYear = getIssueYear(passportId);

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={`Cavite Tourism Passport, active. ID ${passportId}. Holder ${userName}, ${municipality}`}
    >
      {/* Decorative backdrop circles */}
      <Svg style={styles.backdropCircle1} width={160} height={160} viewBox="0 0 160 160">
        <Defs>
          <RadialGradient id="orangeGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor={colors.passportFoil} stopOpacity="0.1" />
            <Stop offset="100%" stopColor={colors.passportFoil} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={80} cy={80} r={80} fill="url(#orangeGradient)" />
      </Svg>

      <Svg style={styles.backdropCircle2} width={128} height={128} viewBox="0 0 128 128">
        <Circle cx={64} cy={64} r={64} fill="rgba(255, 255, 255, 0.05)" />
      </Svg>

      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.shieldContainer}>
            <Ionicons name="shield-checkmark" size={20} color={colors.passportFoil} />
          </View>
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerSubtitle}>Republic of the Philippines</Text>
            <Text style={styles.headerTitle}>Cavite Tourism Passport</Text>
          </View>
        </View>

        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeBadgeText}>Active</Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.body}>
        <Text style={styles.fieldLabel}>Passport ID number</Text>
        <Text style={styles.idValue} selectable>
          {passportId}
        </Text>

        <View style={styles.holderGroup}>
          <Text style={styles.fieldLabel}>Holder name</Text>
          <Text style={styles.holderName} numberOfLines={1}>
            {userName}
          </Text>
          <View style={styles.municipalityRow}>
            <Ionicons name="location" size={14} color={colors.passportFoil} />
            <Text style={styles.municipalityText} numberOfLines={2}>
              {municipality}
            </Text>
          </View>
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLeft}>Provincial Tourism Board</Text>
        <Text style={styles.footerRight}>
          {issueYear ? `Official Pass ${issueYear}` : 'Official Pass'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.card,
    backgroundColor: colors.passportLeather,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: '#1E4875',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },

  // Backdrop decorative circles
  backdropCircle1: {
    position: 'absolute',
    bottom: -32,
    right: -32,
  },
  backdropCircle2: {
    position: 'absolute',
    top: -24,
    left: -24,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: CARD_HAIRLINE,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  shieldContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: CARD_HAIRLINE,
    borderWidth: 1,
    borderColor: 'rgba(248, 156, 72, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextGroup: {
    flex: 1,
  },
  headerSubtitle: {
    ...typography.labelSmall,
    fontFamily: 'Inter_500Medium',
    color: CARD_MUTED_TEXT,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    ...typography.labelLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.background,
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  activeBadgeText: {
    ...typography.labelSmall,
    fontFamily: 'Inter_600SemiBold',
    color: '#6EE7B7',
  },

  // Body
  body: {
    paddingVertical: spacing.md,
  },
  fieldLabel: {
    ...typography.labelSmall,
    fontFamily: 'Inter_500Medium',
    color: CARD_MUTED_TEXT,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  idValue: {
    fontFamily: 'monospace',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.passportFoil,
    letterSpacing: 1.6,
  },
  holderGroup: {
    marginTop: spacing.md,
  },
  holderName: {
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.background,
  },
  municipalityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  municipalityText: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: CARD_MUTED_TEXT,
    flexShrink: 1,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: CARD_HAIRLINE,
    paddingTop: spacing.sm,
  },
  footerLeft: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: CARD_MUTED_TEXT,
  },
  footerRight: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.passportFoil,
  },
});
