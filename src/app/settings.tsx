import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { mockFaqs } from '@/data/mock-data';
import { useSettings } from '@/hooks';
import { APP_VERSION, SOCIAL_LINKS } from '@/lib/constants';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Settings Screen
 * 
 * Displays four sections:
 * 1. Device & Alerts (push notifications toggle, location services status)
 * 2. FAQs & Help (expandable accordion with 4 FAQs)
 * 3. Official Tourism Links (4 external links)
 * 4. Footer (app version, contact button)
 */
export default function SettingsScreen() {
  const { settings, isLoading, updateSetting } = useSettings();
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const handleLinkPress = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Alert.alert('Error', 'Cannot open this link.');
    }
  };

  const toggleFaq = (faqId: string) => {
    setExpandedFaqId(expandedFaqId === faqId ? null : faqId);
  };

  const togglePushNotifications = () => {
    if (settings) {
      updateSetting('pushNotificationsEnabled', !settings.pushNotificationsEnabled);
    }
  };

  if (isLoading || !settings) {
    return (
      <ScreenContainer
        scrollable={false}
        showHeader={true}
        headerTitle="Settings & Help"
        onBackPress={() => router.back()}
        testID="settings-screen"
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable={true}
      showHeader={true}
      headerTitle="Settings & Help"
      onBackPress={() => router.back()}
      testID="settings-screen"
    >
      <View style={styles.container}>
        {/* Device & Alerts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>DEVICE & ALERTS</Text>
          </View>

          <View style={styles.card}>
            {/* Push Notifications Row */}
            <Pressable
              style={styles.notificationRow}
              onPress={togglePushNotifications}
            >
              <View style={styles.notificationLeft}>
                <View style={[styles.iconContainer, styles.notificationIconBg]}>
                  <Ionicons name="notifications" size={20} color={colors.primary} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.notificationTitle}>Push Notifications</Text>
                  <Text style={styles.notificationSubtitle}>
                    Get alerts for new stamp locations, events, and promo deadlines.
                  </Text>
                </View>
              </View>
              <View style={styles.toggleContainer}>
                <Pressable
                  style={[
                    styles.toggle,
                    settings.pushNotificationsEnabled && styles.toggleActive,
                  ]}
                  onPress={togglePushNotifications}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      settings.pushNotificationsEnabled && styles.toggleKnobActive,
                    ]}
                  />
                </Pressable>
              </View>
            </Pressable>

            <View style={styles.divider} />

            {/* Location Services Row (read-only) */}
            <View style={styles.locationRow}>
              <View style={styles.locationLeft}>
                <View style={[styles.iconContainer, styles.locationIconBg]}>
                  <Ionicons name="location" size={20} color="#047857" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.locationTitle}>Location Services</Text>
                  <Text style={styles.locationSubtitle}>
                    Used for geo-verifying site stamps
                  </Text>
                </View>
              </View>
              <View style={styles.activeBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* FAQs & Help Section */}
        <View style={styles.section}>
          <View style={styles.faqHeader}>
            <View style={styles.faqHeaderLeft}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>FAQS & HELP</Text>
            </View>
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Tap to read</Text>
            </View>
          </View>

          <View style={styles.faqList}>
            {mockFaqs.map((faq, index) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                index={index}
                isOpen={expandedFaqId === faq.id}
                onToggle={() => toggleFaq(faq.id)}
              />
            ))}
          </View>
        </View>

        {/* Official Tourism Links Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>OFFICIAL TOURISM LINKS</Text>
          </View>

          <View style={styles.linksList}>
            <LinkCard
              icon="compass-outline"
              title="Biyaheng South"
              subtitle="Official South Luzon Tourism guide"
              iconBg="#FEF3C7"
              iconColor="#D97706"
              verified={true}
              onPress={() => handleLinkPress(SOCIAL_LINKS.BIYAHENG_SOUTH)}
            />
            <LinkCard
              icon="business-outline"
              title="Cavite Provincial Tourism"
              subtitle="Cavite Provincial Capitol, Trece Martires"
              iconBg="rgba(0, 73, 135, 0.1)"
              iconColor={colors.primary}
              verified={true}
              onPress={() => handleLinkPress(SOCIAL_LINKS.CAVITE_TOURISM)}
            />
            <LinkCard
              icon="earth-outline"
              title="DOT IV-A"
              subtitle="Department of Tourism CALABARZON"
              iconBg="#D1FAE5"
              iconColor="#047857"
              verified={false}
              onPress={() => handleLinkPress(SOCIAL_LINKS.DOT_4A)}
            />
            <LinkCard
              icon="shield-checkmark-outline"
              title="DILG IV-A"
              subtitle="Dept. of the Interior & Local Government"
              iconBg="#DBEAFE"
              iconColor="#1D4ED8"
              verified={false}
              onPress={() => handleLinkPress(SOCIAL_LINKS.DILG_4A)}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.appIcon}>
            <Ionicons name="medal" size={26} color={colors.accent} />
          </View>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Cavite Tourism Passport</Text>
            <Text style={styles.appVersion}>
              v{APP_VERSION} (Official Provincial Android Build)
            </Text>
          </View>
          <Pressable style={styles.helpdeskButton}>
            <Ionicons name="headset-outline" size={17} color={colors.primary} />
            <Text style={styles.helpdeskText}>Contact Tourism Helpdesk</Text>
          </Pressable>
          <View style={styles.footerNote}>
            <View style={styles.footerDot} />
            <Text style={styles.footerNoteText}>
              Official Digital System • Province of Cavite
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

/**
 * FAQ Item Component
 */
interface FAQItemProps {
  faq: { id: string; question: string; answer: string; icon?: string };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ faq, index, isOpen, onToggle }: FAQItemProps) {
  const iconBackgrounds = [
    'rgba(0, 73, 135, 0.1)', // primary-fixed for FAQ 1
    'rgba(244, 123, 32, 0.1)', // secondary-fixed for FAQ 2
    '#F4F6FA', // surface-variant for FAQ 3
    'rgba(46, 158, 91, 0.1)', // tertiary-fixed for FAQ 4
  ];

  const iconColors = [
    colors.primary, // FAQ 1
    colors.accent, // FAQ 2
    colors.textSecondary, // FAQ 3
    colors.success, // FAQ 4
  ];

  return (
    <View style={styles.faqCard}>
      <Pressable style={styles.faqCardHeader} onPress={onToggle}>
        <View style={styles.faqCardHeaderLeft}>
          <View
            style={[
              styles.faqIconContainer,
              { backgroundColor: iconBackgrounds[index] },
            ]}
          >
            <Ionicons
              name={faq.icon as any || 'help-circle-outline'}
              size={17}
              color={iconColors[index]}
            />
          </View>
          <Text style={styles.faqQuestion}>{faq.question}</Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.primary}
          style={{
            transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
          }}
        />
      </Pressable>
      {isOpen && (
        <View style={styles.faqAnswerContainer}>
          <View style={styles.faqAnswerBox}>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Link Card Component
 */
interface LinkCardProps {
  icon: string;
  title: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  verified: boolean;
  onPress: () => void;
}

function LinkCard({
  icon,
  title,
  subtitle,
  iconBg,
  iconColor,
  verified,
  onPress,
}: LinkCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.linkCard,
        pressed && styles.linkCardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.linkCardLeft}>
        <View style={[styles.linkIconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View style={styles.linkTextContainer}>
          <View style={styles.linkTitleRow}>
            <Text style={styles.linkTitle}>{title}</Text>
            {verified && (
              <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
            )}
          </View>
          <Text style={styles.linkSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>
      <View style={styles.externalLinkIndicator}>
        <Ionicons name="open-outline" size={18} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },

  // Section styles
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  // Card styles
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: `${colors.border}99`,
    ...shadows.card,
  },

  // Push Notifications row
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconBg: {
    backgroundColor: 'rgba(0, 73, 135, 0.1)',
  },
  textContainer: {
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  notificationSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Toggle switch
  toggleContainer: {
    justifyContent: 'center',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: '#C2C6D2',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    backgroundColor: colors.background,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: `${colors.border}80`,
    marginVertical: spacing.base,
  },

  // Location Services row
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  locationIconBg: {
    backgroundColor: '#A7F3D0',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  locationSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#D1FAE5',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: '#10B981',
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
    letterSpacing: 0.5,
  },

  // FAQ section
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  faqHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tapHint: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tapHintText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  faqList: {
    gap: 10,
  },

  // FAQ Card
  faqCard: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: `${colors.border}99`,
    overflow: 'hidden',
    ...shadows.card,
  },
  faqCardHeader: {
    padding: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  faqCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  faqIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  faqAnswerContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
    paddingTop: 0,
  },
  faqAnswerBox: {
    backgroundColor: '#F4F7FC',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E3EAF4',
  },
  faqAnswer: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Links section
  linksList: {
    gap: 10,
  },
  linkCard: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    padding: 14,
    borderWidth: 1,
    borderColor: `${colors.border}99`,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  linkCardPressed: {
    transform: [{ scale: 0.99 }],
  },
  linkCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  linkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTextContainer: {
    flexDirection: 'column',
    gap: 2,
    flex: 1,
  },
  linkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  linkSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  externalLinkIndicator: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: {
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: `${colors.border}99`,
    alignItems: 'center',
    gap: spacing.md,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.card,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    alignItems: 'center',
    gap: 4,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  appVersion: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  helpdeskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
  },
  helpdeskText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: '#10B981',
  },
  footerNoteText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
