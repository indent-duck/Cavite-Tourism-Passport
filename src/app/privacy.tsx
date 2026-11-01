import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Privacy Policy & Terms Screen
 * 
 * Displays the app's privacy policy and terms of service in a structured,
 * official government document format with collapsible FAQ sections.
 * 
 * Opened from:
 * - Account screen "Privacy Policy & Terms" navigation row
 * - Sign up email screen terms link (if present)
 */
export default function PrivacyScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <ScreenContainer
      scrollable={true}
      showHeader={true}
      headerTitle="Settings & Help"
      onBackPress={() => router.back()}
      edges={['top', 'left', 'right', 'bottom']}
      testID="privacy-screen"
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        {/* Official Government Notice Banner */}
        <View style={styles.banner}>
          <View style={styles.badgeRow}>
            <View style={styles.officialBadge}>
              <Ionicons name="shield-checkmark" size={13} color={colors.background} />
              <Text style={styles.officialBadgeText}>Official Policy</Text>
            </View>
            <View style={styles.regBadge}>
              <Text style={styles.regBadgeText}>NPC Reg. No. PIC-2027-0482</Text>
            </View>
          </View>
          <Text style={styles.bannerTitle}>
            Cavite Tourism Registry & Digital Passport Terms
          </Text>
          <Text style={styles.bannerSubtitle}>
            Governed under Republic Act No. 10173 (Data Privacy Act of 2012) and Provincial Ordinance No. 2026-089.
          </Text>
          <View style={styles.metadataRow}>
            <View style={styles.updateInfo}>
              <Ionicons name="time-outline" size={16} color={colors.accent} />
              <Text style={styles.updateText}>Effective: Jan 1, 2027 • v2.4</Text>
            </View>
            <View style={styles.compliantBadge}>
              <Ionicons name="hammer" size={14} color={colors.success} />
              <Text style={styles.compliantText}>DOJ-Compliant</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Data Privacy & Collection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="id-card-outline" size={19} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.sectionLabel}>SECTION 01</Text>
                <Text style={styles.sectionTitle}>Data Privacy & Collection</Text>
              </View>
            </View>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text style={styles.sectionBody}>
            In accordance with RA 10173, the Provincial Government of Cavite collects minimal identity markers exclusively to issue and link your authenticated provincial digital traveler credentials.
          </Text>
          <View style={styles.detailBox}>
            <Text style={styles.detailBoxTitle}>Collected Attributes:</Text>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.listItemText}>
                Full Legal Name & Permanent Philippine Municipality / City
              </Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.listItemText}>
                Verified Mobile Number (via one-time SMS OTP verification)
              </Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.listItemText}>
                Issuance Passport Identifier (e.g., CVT-2027-xxxxxx)
              </Text>
            </View>
          </View>
          <View style={styles.exclusionBox}>
            <Ionicons name="close-circle-outline" size={18} color={colors.error} />
            <Text style={styles.exclusionText}>
              <Text style={styles.exclusionStrong}>Strictly Excluded:</Text> No biometric identifiers, iris scans, facial recognition templates, or raw financial instruments are ever recorded or retained by this platform.
            </Text>
          </View>
        </View>

        {/* Section 2: Geofencing & GPS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.accent}20` }]}>
                <Ionicons name="navigate-outline" size={19} color={colors.accent} />
              </View>
              <View>
                <Text style={styles.sectionLabel}>SECTION 02</Text>
                <Text style={styles.sectionTitle}>Geofencing & Spot GPS</Text>
              </View>
            </View>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text style={styles.sectionBody}>
            Authenticity stamps require proximity proof. When you open the digital camera to scan an authorized site QR code, one instantaneous GPS query is triggered.
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="radio-outline" size={16} color={colors.accent} />
                <Text style={styles.statLabel}>Boundary Gate</Text>
              </View>
              <Text style={styles.statValue}>±150m</Text>
              <Text style={styles.statDescription}>
                Tolerance radius around historical site landmark markers.
              </Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="close-circle-outline" size={16} color={colors.success} />
                <Text style={styles.statLabel}>Zero Tracking</Text>
              </View>
              <Text style={styles.statValue}>0 sec</Text>
              <Text style={styles.statDescription}>
                Background coordinates are never polled or logged.
              </Text>
            </View>
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.infoText}>
              Coordinates are discarded immediately after cryptographic hash generation. No trajectory trails or user routes are retained on municipal database servers.
            </Text>
          </View>
        </View>

        {/* Section 3: Stamp Collection & Rewards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.success}20` }]}>
                <Ionicons name="medal-outline" size={19} color={colors.success} />
              </View>
              <View>
                <Text style={styles.sectionLabel}>SECTION 03</Text>
                <Text style={styles.sectionTitle}>Stamp Collection & Rewards</Text>
              </View>
            </View>
            <Ionicons name="star-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text style={styles.sectionBody}>
            Digital stamps acquired inside the booklet are official tokens issued under tourism promotional campaigns. Fair participation guidelines apply:
          </Text>
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleNumber}>01</Text>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Campaign Eligibility Period</Text>
                <Text style={styles.ruleDescription}>
                  Current promotional cycle runs through <Text style={styles.ruleBold}>March 31, 2027</Text>. Unredeemed badge points roll over to secondary cultural incentives.
                </Text>
              </View>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleNumber}>02</Text>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Single-Use 15-Minute Token</Text>
                <Text style={styles.ruleDescription}>
                  Physical reward counter claims generate a dynamic, self-invalidating 15-minute verification token presented exclusively to Provincial Tourism desks.
                </Text>
              </View>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleNumber}>03</Text>
              <View style={styles.ruleContent}>
                <Text style={[styles.ruleTitle, { color: colors.error }]}>Anti-Tampering Enforcement</Text>
                <Text style={styles.ruleDescription}>
                  Virtual machine spoofing, simulated mock GPS coordinates, and duplicate credential transfers invoke permanent passport revocation.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 4: Retention & Rights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                <Ionicons name="business-outline" size={19} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.sectionLabel}>SECTION 04</Text>
                <Text style={styles.sectionTitle}>Retention & Tourist Rights</Text>
              </View>
            </View>
            <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text style={styles.sectionBody}>
            Under Section 16 of the Data Privacy Act, travelers retain full rights to inspect, amend, or purge registered tourist entries upon identity confirmation.
          </Text>
          <View style={styles.retentionBox}>
            <View style={styles.retentionHeader}>
              <Text style={styles.retentionTitle}>Retention Duration</Text>
              <View style={styles.retentionBadge}>
                <Text style={styles.retentionBadgeText}>36 Months</Text>
              </View>
            </View>
            <Text style={styles.retentionDescription}>
              Records are securely purged automatically after 36 months of profile inactivity, or within 7 business days following a formal right-to-be-forgotten request.
            </Text>
          </View>
          <View style={styles.contactBox}>
            <View style={styles.contactHeader}>
              <Ionicons name="business" size={18} color={colors.accent} />
              <Text style={styles.contactTitle}>Provincial Tourism & Cultural Affairs Office</Text>
            </View>
            <Text style={styles.contactBody}>
              Provincial Capitol Compound, Trece Martires City, Cavite 4109{'\n'}
              Email: <Text style={styles.contactLink}>privacy@tourism.cavite.gov.ph</Text>{'\n'}
              Hotline: (046) 419-1997 / 419-0244
            </Text>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <View style={styles.faqHeader}>
            <Ionicons name="help-circle" size={20} color={colors.accent} />
            <Text style={styles.faqHeaderTitle}>Frequently Addressed Inquiries</Text>
          </View>
          
          {/* FAQ 1 */}
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => toggleFaq(0)}
            activeOpacity={0.7}
          >
            <View style={styles.faqQuestion}>
              <Text style={styles.faqQuestionText}>
                Can I use my stamp rewards offline?
              </Text>
              <Ionicons
                name={expandedFaq === 0 ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </View>
            {expandedFaq === 0 && (
              <Text style={styles.faqAnswer}>
                Stamps already verified and minted in your passport ledger remain visible offline. However, collecting new stamps and generating reward redemption tokens require active internet connectivity to ensure instantaneous geofence validation.
              </Text>
            )}
          </TouchableOpacity>

          {/* FAQ 2 */}
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => toggleFaq(1)}
            activeOpacity={0.7}
          >
            <View style={styles.faqQuestion}>
              <Text style={styles.faqQuestionText}>
                Are stamps shared with commercial third parties?
              </Text>
              <Ionicons
                name={expandedFaq === 1 ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </View>
            {expandedFaq === 1 && (
              <Text style={styles.faqAnswer}>
                Never. Tourism visit statistics are strictly aggregated and anonymized for provincial infrastructure planning. No individual visit profile is sold, leased, or transmitted to commercial marketing vendors.
              </Text>
            )}
          </TouchableOpacity>

          {/* FAQ 3 */}
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => toggleFaq(2)}
            activeOpacity={0.7}
          >
            <View style={styles.faqQuestion}>
              <Text style={styles.faqQuestionText}>
                How do I permanently delete my account?
              </Text>
              <Ionicons
                name={expandedFaq === 2 ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </View>
            {expandedFaq === 2 && (
              <Text style={styles.faqAnswer}>
                You may initiate full profile dissolution under Account &gt; Settings &gt; Request Data Purge, or by emailing the Data Protection Officer with your passport credential number.
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Certification Card */}
        <View style={styles.certificationCard}>
          <View style={styles.certificationIcon}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          </View>
          <Text style={styles.certificationTitle}>Certified Provincial Registry</Text>
          <Text style={styles.certificationDescription}>
            This digital portal adheres to the ISO/IEC 27001 baseline privacy framework and the National Privacy Commission of the Philippines.
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => {
                // Mock download functionality
                console.log('Download PDF triggered');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="download-outline" size={18} color={colors.background} />
              <Text style={styles.downloadButtonText}>Download PDF Copy (382 KB)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color={colors.primary} />
              <Text style={styles.backButtonText}>Back to Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  // Banner Styles
  banner: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.base,
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  officialBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.background,
    letterSpacing: 0.5,
  },
  regBadge: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  regBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primary,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 24,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  updateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  compliantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.success}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  compliantText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },

  // Section Styles
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.base,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 22,
  },
  sectionBody: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Detail Box Styles
  detailBox: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  detailBoxTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  listItemText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },

  // Exclusion Box Styles
  exclusionBox: {
    backgroundColor: `${colors.error}10`,
    borderRadius: 12,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  exclusionText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  exclusionStrong: {
    fontWeight: '700',
    color: colors.text,
  },

  // Stats Grid Styles
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.sm,
    gap: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 28,
  },
  statDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },

  // Info Box Styles
  infoBox: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Rules List Styles
  rulesList: {
    gap: spacing.xs,
  },
  ruleItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  ruleNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  ruleContent: {
    flex: 1,
    gap: 4,
  },
  ruleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  ruleDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ruleBold: {
    fontWeight: '700',
  },

  // Retention Box Styles
  retentionBox: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  retentionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retentionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  retentionBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  retentionBadgeText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  retentionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Contact Box Styles
  contactBox: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.background,
  },
  contactBody: {
    fontSize: 13,
    color: `${colors.background}CC`,
    lineHeight: 20,
  },
  contactLink: {
    textDecorationLine: 'underline',
    color: colors.background,
  },

  // FAQ Styles
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  faqHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  faqItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 20,
  },
  faqAnswer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Certification Card Styles
  certificationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.base,
    alignItems: 'center',
    gap: spacing.sm,
  },
  certificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certificationTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  certificationDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
  actionButtons: {
    width: '100%',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  downloadButton: {
    height: 48,
    backgroundColor: colors.accent,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  backButton: {
    height: 48,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
