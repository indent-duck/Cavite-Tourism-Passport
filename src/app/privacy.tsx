import { AccordionRow } from '@/components/ui/AccordionRow';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fragment, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

/**
 * Privacy Policy & Terms Screen
 *
 * Official policy document laid out as:
 * - Navy hero banner (registration, effective date, compliance)
 * - "Jump to" chips that scroll to each section
 * - Four numbered policy sections in cards
 * - Single-open FAQ accordion
 * - Certification footer
 *
 * Opened from:
 * - Account screen "Privacy Policy & Terms" navigation row
 * - Sign up email screen terms link (if present)
 */

type IconName = keyof typeof Ionicons.glyphMap;
type Tone = 'primary' | 'accent' | 'success' | 'neutral';
type SectionId = 'data' | 'location' | 'stamps' | 'rights' | 'faqs';

const TONES: Record<Tone, { background: string; icon: string }> = {
  primary: { background: colors.primaryTint, icon: colors.primary },
  accent: { background: colors.accentTint, icon: colors.accent },
  success: { background: colors.successLight, icon: colors.success },
  neutral: { background: colors.surface, icon: colors.textSecondary },
};

const JUMP_LINKS: { id: SectionId; label: string }[] = [
  { id: 'data', label: 'Data privacy' },
  { id: 'location', label: 'Location' },
  { id: 'stamps', label: 'Stamps & rewards' },
  { id: 'rights', label: 'Your rights' },
  { id: 'faqs', label: 'FAQs' },
];

const PRIVACY_EMAIL = 'privacy@tourism.cavite.gov.ph';
const HOTLINE_PRIMARY = '(046) 419-1997';
const HOTLINE_SECONDARY = '(046) 419-0244';

const POLICY_FAQS = [
  {
    id: 'offline',
    question: 'Can I use my stamp rewards offline?',
    answer:
      'Stamps already verified and minted in your passport ledger remain visible offline. However, collecting new stamps and generating reward redemption tokens require active internet connectivity to ensure instantaneous geofence validation.',
  },
  {
    id: 'third-parties',
    question: 'Are stamps shared with commercial third parties?',
    answer:
      'Never. Tourism visit statistics are strictly aggregated and anonymized for provincial infrastructure planning. No individual visit profile is sold, leased, or transmitted to commercial marketing vendors.',
  },
  {
    id: 'delete-account',
    question: 'How do I permanently delete my account?',
    answer:
      'You may initiate full profile dissolution under Account > Settings > Request Data Purge, or by emailing the Data Protection Officer with your passport credential number.',
  },
];

export default function PrivacyScreen() {
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);
  // Y offset of each section inside the content column, filled by onLayout
  const sectionOffsets = useRef<Partial<Record<SectionId, number>>>({});

  const recordOffset = (id: SectionId, event: LayoutChangeEvent) => {
    sectionOffsets.current[id] = event.nativeEvent.layout.y;
  };

  const jumpTo = (id: SectionId) => {
    const y = sectionOffsets.current[id];
    if (y !== undefined) {
      scrollViewRef.current?.scrollTo({ y, animated: true });
    }
  };

  const openUrl = async (url: string, fallback: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open', fallback);
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'PDF copy coming soon',
      'A downloadable copy of this policy will be available in a future update.',
    );
  };

  return (
    <ScreenContainer
      scrollable={true}
      showHeader={true}
      headerTitle="Privacy & Terms"
      onBackPress={() => router.back()}
      scrollViewRef={scrollViewRef}
      testID="privacy-screen"
    >
      <StatusBar style="dark" />

      <View style={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadges}>
            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark" size={12} color={colors.background} />
              <Text style={styles.heroBadgeText}>Official policy</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>NPC Reg. No. PIC-2027-0482</Text>
            </View>
          </View>
          <Text style={styles.heroTitle} accessibilityRole="header">
            Cavite Tourism Registry & Digital Passport Terms
          </Text>
          <Text style={styles.heroSubtitle}>
            Governed under Republic Act No. 10173 (Data Privacy Act of 2012) and
            Provincial Ordinance No. 2026-089.
          </Text>
          <View style={styles.heroDivider} />
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="time-outline" size={15} color={colors.passportFoil} />
              <Text style={styles.heroMetaText}>Effective Jan 1, 2027 · v2.4</Text>
            </View>
            <View style={styles.compliantPill}>
              <Ionicons name="checkmark-circle" size={13} color={colors.success} />
              <Text style={styles.compliantText}>DOJ-compliant</Text>
            </View>
          </View>
        </View>

        {/* Jump to section */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.jumpScroll}
          contentContainerStyle={styles.jumpRow}
        >
          {JUMP_LINKS.map((link) => (
            <Pressable
              key={link.id}
              style={({ pressed }) => [styles.jumpChip, pressed && styles.jumpChipPressed]}
              onPress={() => jumpTo(link.id)}
              accessibilityRole="button"
              accessibilityLabel={`Jump to ${link.label}`}
            >
              <Text style={styles.jumpChipText}>{link.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Section 1: Data Privacy & Collection */}
        <PolicySection
          number="01"
          icon="id-card-outline"
          tone="primary"
          title="Data Privacy & Collection"
          onLayout={(event) => recordOffset('data', event)}
        >
          <Text style={styles.body}>
            In accordance with RA 10173, the Provincial Government of Cavite collects
            minimal identity markers exclusively to issue and link your authenticated
            provincial digital traveler credentials.
          </Text>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>What we collect</Text>
            <CheckItem>Full legal name & permanent Philippine municipality / city</CheckItem>
            <CheckItem>Verified mobile number (via one-time SMS OTP verification)</CheckItem>
            <CheckItem>Issued passport identifier (e.g., CVT-2027-xxxxxx)</CheckItem>
          </View>
          <Callout icon="close-circle" tone="error" title="Strictly excluded">
            No biometric identifiers, iris scans, facial recognition templates, or raw
            financial instruments are ever recorded or retained by this platform.
          </Callout>
        </PolicySection>

        {/* Section 2: Geofencing & GPS */}
        <PolicySection
          number="02"
          icon="navigate-outline"
          tone="accent"
          title="Geofencing & Spot GPS"
          onLayout={(event) => recordOffset('location', event)}
        >
          <Text style={styles.body}>
            Authenticity stamps require proximity proof. When you open the camera to
            scan an authorized site QR code, one instantaneous GPS query is triggered.
          </Text>
          <View style={styles.statsGrid}>
            <StatTile
              icon="radio-outline"
              tone="accent"
              label="Boundary gate"
              value="±150 m"
              description="Tolerance radius around site landmark markers."
            />
            <StatTile
              icon="eye-off-outline"
              tone="success"
              label="Zero tracking"
              value="0 sec"
              description="Background coordinates are never polled or logged."
            />
          </View>
          <Callout icon="information-circle" tone="info">
            Coordinates are discarded immediately after cryptographic hash generation.
            No trajectory trails or user routes are retained on municipal database
            servers.
          </Callout>
        </PolicySection>

        {/* Section 3: Stamp Collection & Rewards */}
        <PolicySection
          number="03"
          icon="medal-outline"
          tone="success"
          title="Stamp Collection & Rewards"
          onLayout={(event) => recordOffset('stamps', event)}
        >
          <Text style={styles.body}>
            Digital stamps acquired inside the booklet are official tokens issued under
            tourism promotional campaigns. Fair participation guidelines apply:
          </Text>
          <View style={styles.rules}>
            <RuleItem number={1} title="Campaign eligibility period">
              Current promotional cycle runs through{' '}
              <Text style={styles.bold}>March 31, 2027</Text>. Unredeemed badge points
              roll over to secondary cultural incentives.
            </RuleItem>
            <RuleItem number={2} title="Single-use 15-minute token">
              Reward counter claims generate a dynamic, self-invalidating 15-minute
              verification token presented exclusively to Provincial Tourism desks.
            </RuleItem>
            <RuleItem number={3} title="Anti-tampering enforcement" danger>
              Virtual machine spoofing, simulated mock GPS coordinates, and duplicate
              credential transfers invoke permanent passport revocation.
            </RuleItem>
          </View>
        </PolicySection>

        {/* Section 4: Retention & Rights */}
        <PolicySection
          number="04"
          icon="business-outline"
          tone="neutral"
          title="Retention & Tourist Rights"
          onLayout={(event) => recordOffset('rights', event)}
        >
          <Text style={styles.body}>
            Under Section 16 of the Data Privacy Act, travelers retain full rights to
            inspect, amend, or purge registered tourist entries upon identity
            confirmation.
          </Text>
          <View style={styles.panel}>
            <View style={styles.retentionHeader}>
              <Text style={styles.panelTitle}>Retention period</Text>
              <View style={styles.retentionPill}>
                <Text style={styles.retentionPillText}>36 months</Text>
              </View>
            </View>
            <Text style={styles.panelBody}>
              Records are securely purged automatically after 36 months of profile
              inactivity, or within 7 business days following a formal
              right-to-be-forgotten request.
            </Text>
          </View>

          {/* Data Protection Office contact */}
          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Ionicons name="business" size={16} color={colors.passportFoil} />
              <Text style={styles.contactTitle}>
                Provincial Tourism & Cultural Affairs Office
              </Text>
            </View>
            <ContactRow
              icon="location-outline"
              title="Provincial Capitol Compound"
              subtitle="Trece Martires City, Cavite 4109"
            />
            <ContactRow
              icon="mail-outline"
              title={PRIVACY_EMAIL}
              subtitle="Data Protection Officer"
              onPress={() =>
                openUrl(`mailto:${PRIVACY_EMAIL}`, `Email us at ${PRIVACY_EMAIL}.`)
              }
              accessibilityLabel={`Email the Data Protection Officer at ${PRIVACY_EMAIL}`}
            />
            <ContactRow
              icon="call-outline"
              title={HOTLINE_PRIMARY}
              subtitle={`Alternate: ${HOTLINE_SECONDARY}`}
              onPress={() =>
                openUrl(`tel:${HOTLINE_PRIMARY.replace(/\D/g, '')}`, `Call ${HOTLINE_PRIMARY}.`)
              }
              accessibilityLabel={`Call the hotline at ${HOTLINE_PRIMARY}`}
            />
          </View>
        </PolicySection>

        {/* FAQs */}
        <View style={styles.faqSection} onLayout={(event) => recordOffset('faqs', event)}>
          <Text style={styles.groupTitle} accessibilityRole="header">
            Frequently asked
          </Text>
          <View style={styles.card}>
            {POLICY_FAQS.map((faq, index) => (
              <Fragment key={faq.id}>
                {index > 0 && <View style={styles.faqDivider} />}
                <AccordionRow
                  title={faq.question}
                  body={faq.answer}
                  isOpen={expandedFaqId === faq.id}
                  onToggle={() =>
                    setExpandedFaqId((current) => (current === faq.id ? null : faq.id))
                  }
                />
              </Fragment>
            ))}
          </View>
        </View>

        {/* Certification */}
        <View style={styles.certification}>
          <View style={styles.certificationIcon}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          </View>
          <Text style={styles.certificationTitle}>Certified Provincial Registry</Text>
          <Text style={styles.certificationText}>
            This digital portal adheres to the ISO/IEC 27001 baseline privacy framework
            and the National Privacy Commission of the Philippines.
          </Text>
          <Button
            title="Download PDF copy"
            variant="outline"
            size="compact"
            fullWidth
            icon={<Ionicons name="download-outline" size={18} color={colors.primary} />}
            onPress={handleDownload}
            testID="privacy-download-pdf"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

// ============================================================================
// Building blocks
// ============================================================================

function IconChip({ icon, tone }: { icon: IconName; tone: Tone }) {
  const palette = TONES[tone];
  return (
    <View style={[styles.iconChip, { backgroundColor: palette.background }]}>
      <Ionicons name={icon} size={20} color={palette.icon} />
    </View>
  );
}

function PolicySection({
  number,
  icon,
  tone,
  title,
  onLayout,
  children,
}: {
  number: string;
  icon: IconName;
  tone: Tone;
  title: string;
  onLayout: (event: LayoutChangeEvent) => void;
  children: ReactNode;
}) {
  return (
    <View style={[styles.card, styles.sectionCard]} onLayout={onLayout}>
      <View style={styles.sectionHeader}>
        <IconChip icon={icon} tone={tone} />
        <View style={styles.flex}>
          <Text style={styles.sectionNumber}>Section {number}</Text>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            {title}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <View style={styles.checkItem}>
      <Ionicons name="checkmark-circle" size={16} color={colors.success} style={styles.lineIcon} />
      <Text style={[styles.panelBody, styles.flex]}>{children}</Text>
    </View>
  );
}

function Callout({
  icon,
  tone,
  title,
  children,
}: {
  icon: IconName;
  tone: 'info' | 'error';
  title?: string;
  children: ReactNode;
}) {
  const isError = tone === 'error';
  return (
    <View style={[styles.callout, isError ? styles.calloutError : styles.calloutInfo]}>
      <Ionicons
        name={icon}
        size={18}
        color={isError ? colors.error : colors.primary}
        style={styles.lineIcon}
      />
      <Text style={styles.calloutText}>
        {title && <Text style={styles.bold}>{title}: </Text>}
        {children}
      </Text>
    </View>
  );
}

function StatTile({
  icon,
  tone,
  label,
  value,
  description,
}: {
  icon: IconName;
  tone: Tone;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={15} color={TONES[tone].icon} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statDescription}>{description}</Text>
    </View>
  );
}

function RuleItem({
  number,
  title,
  danger,
  children,
}: {
  number: number;
  title: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.rule}>
      <View style={[styles.ruleNumber, danger && styles.ruleNumberDanger]}>
        <Text style={[styles.ruleNumberText, danger && styles.ruleNumberTextDanger]}>
          {number}
        </Text>
      </View>
      <View style={styles.flex}>
        <Text style={[styles.ruleTitle, danger && styles.ruleTitleDanger]}>{title}</Text>
        <Text style={styles.panelBody}>{children}</Text>
      </View>
    </View>
  );
}

function ContactRow({
  icon,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const content = (
    <>
      <View style={styles.contactIcon}>
        <Ionicons name={icon} size={16} color={colors.background} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.contactRowTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.contactRowSubtitle}>{subtitle}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={colors.onPrimaryBorder} />}
    </>
  );

  if (!onPress) {
    return <View style={styles.contactRow}>{content}</View>;
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.contactRow, pressed && styles.contactRowPressed]}
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </Pressable>
  );
}

// ============================================================================
// Styles
// ============================================================================

const ICON_CHIP_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
  },
  flex: {
    flex: 1,
  },
  bold: {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  lineIcon: {
    marginTop: 1,
  },

  // Hero
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.onPrimaryOverlay,
    borderWidth: 1,
    borderColor: colors.onPrimaryBorder,
  },
  heroBadgeText: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.background,
  },
  heroTitle: {
    ...typography.headlineMedium,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: colors.background,
  },
  heroSubtitle: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.primaryTint,
  },
  heroDivider: {
    height: 1,
    backgroundColor: colors.onPrimaryBorder,
    marginVertical: spacing.xs,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetaText: {
    ...typography.bodySmall,
    fontFamily: 'Inter_500Medium',
    color: colors.background,
  },
  compliantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    backgroundColor: colors.successLight,
  },
  compliantText: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.successDark,
  },

  // Jump chips (bleed to the screen edges so they scroll edge-to-edge)
  jumpScroll: {
    marginHorizontal: -spacing.base,
  },
  jumpRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  jumpChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jumpChipPressed: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryTint,
  },
  jumpChipText: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },

  iconChip: {
    width: ICON_CHIP_SIZE,
    height: ICON_CHIP_SIZE,
    borderRadius: radii.input,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Cards / sections
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  sectionCard: {
    padding: spacing.base,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionNumber: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: colors.text,
  },

  // Inset panel
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    padding: spacing.md,
    gap: spacing.sm,
  },
  panelTitle: {
    ...typography.labelLarge,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
  panelBody: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.text,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  // Callouts
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.input,
  },
  calloutInfo: {
    backgroundColor: colors.primaryTint,
  },
  calloutError: {
    backgroundColor: colors.errorTint,
  },
  calloutText: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    flex: 1,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    padding: spacing.md,
    gap: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.headlineLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
  statDescription: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },

  // Rules
  rules: {
    gap: spacing.base,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  ruleNumber: {
    width: 26,
    height: 26,
    borderRadius: radii.full,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumberDanger: {
    backgroundColor: colors.errorTint,
  },
  ruleNumberText: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.accent,
  },
  ruleNumberTextDanger: {
    color: colors.error,
  },
  ruleTitle: {
    ...typography.labelLarge,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
    marginBottom: 2,
  },
  ruleTitleDanger: {
    color: colors.error,
  },

  // Retention
  retentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retentionPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retentionPillText: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
  },

  // Contact
  contactCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.input,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  contactTitle: {
    ...typography.labelLarge,
    fontFamily: 'Inter_600SemiBold',
    color: colors.background,
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  contactRowPressed: {
    backgroundColor: colors.onPrimaryOverlay,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.onPrimaryOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactRowTitle: {
    ...typography.labelLarge,
    fontFamily: 'Inter_600SemiBold',
    color: colors.background,
  },
  contactRowSubtitle: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.primaryTint,
  },

  // FAQs
  faqSection: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  groupTitle: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.xs,
  },
  faqDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.base,
  },

  // Certification
  certification: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.base,
    paddingHorizontal: spacing.sm,
  },
  certificationIcon: {
    width: ICON_CHIP_SIZE + 12,
    height: ICON_CHIP_SIZE + 12,
    borderRadius: radii.full,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certificationTitle: {
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  certificationText: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: spacing.sm,
  },
});
