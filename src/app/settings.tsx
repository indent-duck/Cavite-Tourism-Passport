import { AccordionRow } from '@/components/ui/AccordionRow';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusPill } from '@/components/ui/StatusPill';
import { mockFaqs } from '@/data/mock-data';
import { useCurrentUser, useOnAppFocus, useSettings } from '@/hooks';
import { parseAddress } from '@/lib/address';
import { APP_VERSION, HELPDESK_EMAIL, SOCIAL_LINKS, type SocialPlatform } from '@/lib/constants';
import { getFullName } from '@/lib/names';
import {
  getPushPermission,
  openNotificationSettings,
  type PushPermission,
} from '@/lib/push-notifications';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import {
  Alert,
  AppState,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

/**
 * Settings & Help Screen
 *
 * Opened from the Account tab's "Settings & Preferences" row.
 *
 * 1. Account – personal details, change password, and delete account
 *    (destructive, last)
 * 2. Device & alerts – push notification toggle (optimistic) and the real
 *    foreground location permission status, with a shortcut to enable it
 * 3. Help & FAQs – single-open accordion
 * 4. Official tourism links – each office's social accounts (from the physical
 *    passport's "Follow us" page); opens the platform's app, or the browser
 * 5. Helpdesk card – compose an email to the tourism helpdesk
 * 6. Footer – app name, version, platform
 *
 * The layout renders immediately (no full-screen loading state) so the push
 * transition never swaps content mid-slide; only the switch waits for data.
 */

type IconName = keyof typeof Ionicons.glyphMap;
type Tone = 'primary' | 'accent' | 'success' | 'neutral' | 'danger';

const TONES: Record<Tone, { background: string; icon: string }> = {
  primary: { background: colors.primaryTint, icon: colors.primary },
  accent: { background: colors.accentTint, icon: colors.accent },
  success: { background: colors.successLight, icon: colors.success },
  // colors.border, not surface, so the chip still shows on the off-white cards
  neutral: { background: colors.border, icon: colors.textSecondary },
  danger: { background: colors.errorTint, icon: colors.error },
};

const FAQ_TONES: Tone[] = ['primary', 'accent', 'neutral', 'success'];

type SocialLinks = Partial<Record<SocialPlatform, string | null>>;

const OFFICIAL_LINKS: {
  id: string;
  title: string;
  subtitle: string;
  socials: SocialLinks;
  verified: boolean;
}[] = [
  {
    id: 'cavite-tourism',
    title: 'Cavite Tourism',
    subtitle: 'Provincial Capitol, Trece Martires',
    socials: SOCIAL_LINKS.CAVITE_TOURISM,
    verified: true,
  },
  {
    id: 'biyaheng-south',
    title: 'Biyaheng South',
    subtitle: 'Official South Luzon tourism guide',
    socials: SOCIAL_LINKS.BIYAHENG_SOUTH,
    verified: true,
  },
  {
    id: 'dot-4a',
    title: 'DOT Region IV-A',
    subtitle: 'Department of Tourism CALABARZON',
    socials: SOCIAL_LINKS.DOT_4A,
    verified: false,
  },
  {
    id: 'dilg-4a',
    title: 'DILG IV-A',
    subtitle: 'Dept. of the Interior & Local Government',
    socials: SOCIAL_LINKS.DILG_4A,
    verified: false,
  },
];

/** Same order on every row, whatever order the passport lists them in */
const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string; icon: IconName; color: string }[] = [
  { id: 'facebook', label: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
  { id: 'tiktok', label: 'TikTok', icon: 'logo-tiktok', color: '#000000' },
];

export default function SettingsScreen() {
  const { settings, updateSetting } = useSettings();
  const { data: user } = useCurrentUser();
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const municipality = user ? (parseAddress(user.address).municipality ?? user.address) : null;

  // Linking (not the in-app browser) so Android opens the Facebook,
  // Instagram or TikTok app when it's installed
  const handleSocialPress = async (url: string | null | undefined) => {
    if (!url) {
      Alert.alert('Link coming soon', 'This account will be linked here soon.');
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open link', 'Please try again in a moment.');
    }
  };

  const handleContactPress = async () => {
    const url = `mailto:${HELPDESK_EMAIL}?subject=${encodeURIComponent('Cavite Tourism Passport inquiry')}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('No email app found', `You can reach the helpdesk at ${HELPDESK_EMAIL}.`);
    }
  };

  return (
    <ScreenContainer
      scrollable={true}
      showHeader={true}
      headerTitle="Settings & Help"
      onBackPress={() => router.back()}
      testID="settings-screen"
    >
      <StatusBar style="dark" />

      <View style={styles.container}>
        {/* Account */}
        <Section title="Account">
          <View style={styles.card}>
            <NavRow
              icon="person-outline"
              tone="primary"
              title="Personal details"
              subtitle={user ? `${getFullName(user)} · ${municipality}` : 'Name and city or municipality'}
              onPress={() => router.push('/edit-profile')}
              testID="settings-personal-details"
            />
            <View style={styles.rowDivider} />
            <NavRow
              icon="lock-closed-outline"
              tone="primary"
              title="Change password"
              subtitle="Update the password you log in with"
              onPress={() => router.push('/change-password')}
              testID="settings-change-password"
            />
            <View style={styles.rowDivider} />
            <NavRow
              icon="trash-outline"
              tone="danger"
              title="Delete account"
              subtitle="Permanently remove your passport and data"
              onPress={() => router.push('/delete-account')}
              destructive
              testID="settings-delete-account"
            />
          </View>
        </Section>

        {/* Device & Alerts */}
        <Section title="Device & alerts">
          <View style={styles.card}>
            <PushNotificationsRow
              enabled={settings?.pushNotificationsEnabled ?? false}
              ready={!!settings}
              onChange={(value) => updateSetting('pushNotificationsEnabled', value)}
            />
            <View style={styles.rowDivider} />
            <LocationRow />
          </View>
        </Section>

        {/* FAQs */}
        <Section title="Help & FAQs">
          <View style={styles.card}>
            {mockFaqs.map((faq, index) => (
              <Fragment key={faq.id}>
                {index > 0 && <View style={styles.rowDivider} />}
                <AccordionRow
                  title={faq.question}
                  body={faq.answer}
                  leading={
                    <IconChip
                      icon={(faq.icon as IconName | undefined) ?? 'help-circle-outline'}
                      tone={FAQ_TONES[index % FAQ_TONES.length]}
                      size="small"
                    />
                  }
                  bodyInset={TEXT_COLUMN_INSET}
                  isOpen={expandedFaqId === faq.id}
                  onToggle={() =>
                    setExpandedFaqId((current) => (current === faq.id ? null : faq.id))
                  }
                />
              </Fragment>
            ))}
          </View>
        </Section>

        {/* Official Tourism Links */}
        <Section title="Official tourism links">
          <FollowUsCard onSocialPress={handleSocialPress} />
        </Section>

        {/* Helpdesk */}
        <View style={styles.helpCard}>
          <View style={styles.helpHeader}>
            <View style={styles.helpIcon}>
              <Ionicons name="headset" size={22} color={colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.helpTitle}>Still need help?</Text>
              <Text style={styles.helpSubtitle}>
                The Cavite Tourism helpdesk can answer questions about stamps, points,
                and rewards.
              </Text>
            </View>
          </View>
          <Button
            title="Contact helpdesk"
            variant="primary"
            size="compact"
            fullWidth
            icon={<Ionicons name="mail-outline" size={18} color={colors.background} />}
            onPress={handleContactPress}
            testID="settings-contact-helpdesk"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.appIcon}>
            <Ionicons name="medal" size={22} color={colors.accent} />
          </View>
          <Text style={styles.appName}>Cavite Tourism Passport</Text>
          <Text style={styles.appVersion}>
            Version {APP_VERSION} · {Platform.OS === 'ios' ? 'iOS' : 'Android'}
          </Text>
          <View style={styles.footerNote}>
            <View style={styles.footerDot} />
            <Text style={styles.footerNoteText}>
              Official digital system · Province of Cavite
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

// ============================================================================
// Building blocks
// ============================================================================

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {title}
        </Text>
        {caption && <Text style={styles.sectionCaption}>{caption}</Text>}
      </View>
      {children}
    </View>
  );
}

function IconChip({ icon, tone, size = 'default' }: { icon: IconName; tone: Tone; size?: 'default' | 'small' }) {
  const palette = TONES[tone];
  const small = size === 'small';
  return (
    <View
      style={[
        styles.iconChip,
        small && styles.iconChipSmall,
        { backgroundColor: palette.background },
      ]}
    >
      <Ionicons name={icon} size={small ? 16 : 20} color={palette.icon} />
    </View>
  );
}

/**
 * The account's notification setting (the server only sends while it's on).
 * Turning it on asks for Android's permission (usePushNotifications in the
 * tabs layout); if the phone has blocked notifications for the app, the row
 * says so and opens system settings instead, rechecking on return.
 */
function PushNotificationsRow({
  enabled,
  ready,
  onChange,
}: {
  enabled: boolean;
  ready: boolean;
  onChange: (value: boolean) => void;
}) {
  const [permission, setPermission] = useState<PushPermission | null>(null);
  const refreshPermission = () => {
    getPushPermission().then(setPermission, () => setPermission(null));
  };
  useEffect(refreshPermission, []);
  useOnAppFocus(refreshPermission);

  const blocked = permission === 'denied';

  const handleChange = (value: boolean) => {
    if (value && blocked) openNotificationSettings();
    onChange(value);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => (enabled && blocked ? openNotificationSettings() : handleChange(!enabled))}
      disabled={!ready}
      accessibilityRole="switch"
      accessibilityLabel="Push notifications"
      accessibilityHint={
        enabled && blocked
          ? 'Opens phone settings to allow notifications'
          : 'Alerts for new stamp sites, events, and promo deadlines'
      }
      accessibilityState={{ checked: enabled, disabled: !ready }}
      testID="settings-push-row"
    >
      <IconChip icon="notifications-outline" tone="primary" />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>Push notifications</Text>
        <Text style={styles.rowSubtitle}>
          {enabled && blocked
            ? 'Blocked in your phone settings. Tap to allow.'
            : 'New stamp sites, events, and promo deadlines'}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={handleChange}
        disabled={!ready}
        trackColor={{ false: SWITCH_TRACK_OFF, true: colors.primary }}
        thumbColor={colors.background}
        ios_backgroundColor={SWITCH_TRACK_OFF}
        // The whole row is the accessible switch; avoid a duplicate focus stop
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        testID="settings-push-switch"
      />
    </Pressable>
  );
}

/**
 * Reflects the real foreground location permission (used to geo-verify
 * stamps) and refreshes it when the user comes back from system settings.
 */
function LocationRow() {
  const [permission, requestPermission, getPermission] = Location.useForegroundPermissions();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') getPermission();
    });
    return () => subscription.remove();
  }, [getPermission]);

  const granted = permission?.granted ?? false;

  const handleEnable = async () => {
    if (permission && !permission.canAskAgain) {
      Linking.openSettings();
      return;
    }
    const result = await requestPermission();
    if (!result.granted && !result.canAskAgain) {
      Linking.openSettings();
    }
  };

  let trailing: ReactNode;
  if (!permission) {
    trailing = <StatusPill label="Checking" tone="neutral" />;
  } else if (granted) {
    trailing = <StatusPill label="Allowed" tone="success" />;
  } else {
    trailing = (
      <Pressable
        style={({ pressed }) => [styles.smallButton, pressed && styles.smallButtonPressed]}
        onPress={handleEnable}
        hitSlop={spacing.sm}
        accessibilityRole="button"
        accessibilityLabel="Turn on location services"
        testID="settings-location-enable"
      >
        <Text style={styles.smallButtonText}>Turn on</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.row} testID="settings-location-row">
      <IconChip icon="location-outline" tone={granted ? 'success' : 'neutral'} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>Location services</Text>
        <Text style={styles.rowSubtitle}>
          {permission && !granted
            ? 'Required to verify stamps at partner sites'
            : 'Used to verify you’re at a site when scanning'}
        </Text>
      </View>
      {trailing}
    </View>
  );
}

/** Row that opens another screen or sheet; `destructive` paints the title red */
function NavRow({
  icon,
  tone,
  title,
  subtitle,
  onPress,
  trailing,
  destructive = false,
  testID,
}: {
  icon: IconName;
  tone: Tone;
  title: string;
  subtitle: string;
  onPress: () => void;
  trailing?: ReactNode;
  destructive?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && (destructive ? styles.rowPressedDestructive : styles.rowPressed),
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      testID={testID}
    >
      <IconChip icon={icon} tone={tone} />
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, destructive && styles.rowTitleDestructive]}>{title}</Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {trailing ?? <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
    </Pressable>
  );
}

/**
 * The official offices' social accounts, styled like the physical passport's
 * "Follow us" page: leather-navy card, foil heading, one line per office with
 * a brand-colored button for each account it has.
 */
function FollowUsCard({
  onSocialPress,
}: {
  onSocialPress: (url: string | null | undefined) => void;
}) {
  return (
    <View style={styles.followCard} testID="settings-follow-us">
      {/* Crest watermark, as on the passport pages */}
      <View style={styles.followWatermark}>
        <Ionicons name="shield" size={160} color={colors.background} />
      </View>

      <View style={styles.followHeader}>
        <View style={styles.followEmblem}>
          <Ionicons name="share-social-outline" size={18} color={colors.passportFoil} />
        </View>
        <Text style={styles.followHeading} accessibilityRole="header">
          Follow us
        </Text>
      </View>
      <View style={styles.followRule} />

      {OFFICIAL_LINKS.map((link, index) => (
        <Fragment key={link.id}>
          {index > 0 && <View style={styles.followDivider} />}
          <View style={styles.followRow} testID={`settings-link-${link.id}`}>
            <View style={styles.rowText}>
              <View style={styles.linkTitleRow}>
                <Text style={styles.followTitle} numberOfLines={1}>
                  {link.title}
                </Text>
                {link.verified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={colors.passportFoil}
                    accessibilityLabel="Official partner"
                  />
                )}
              </View>
              <Text style={styles.followSubtitle} numberOfLines={2}>
                {link.subtitle}
              </Text>
            </View>
            <View style={styles.socialRow}>
              {SOCIAL_PLATFORMS.filter((platform) => platform.id in link.socials).map(
                (platform) => (
                  <Pressable
                    key={platform.id}
                    style={({ pressed }) => [
                      styles.socialButton,
                      { backgroundColor: platform.color },
                      pressed && styles.socialButtonPressed,
                    ]}
                    onPress={() => onSocialPress(link.socials[platform.id])}
                    hitSlop={6}
                    accessibilityRole="link"
                    accessibilityLabel={`${link.title} on ${platform.label}`}
                    testID={`settings-link-${link.id}-${platform.id}`}
                  >
                    <Ionicons name={platform.icon} size={18} color={colors.background} />
                  </Pressable>
                )
              )}
            </View>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const ICON_CHIP_SIZE = 36;
const ICON_CHIP_SIZE_SMALL = 30;
const SWITCH_TRACK_OFF = `${colors.textSecondary}55`;
/** Row padding + icon chip + gap: where row titles start */
const TEXT_COLUMN_INSET = spacing.base + ICON_CHIP_SIZE + spacing.md;

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
  },

  // Sections
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionCaption: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },

  // Grouped card (rows separated by inset dividers): off-white on the white
  // screen, lifted by the card shadow (same look as the Account tab cards)
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    overflow: 'hidden',
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    minHeight: 64,
  },
  // A step darker than the card, so the press still shows
  rowPressed: {
    backgroundColor: colors.border,
  },
  rowPressedDestructive: {
    backgroundColor: colors.errorTint,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...typography.labelLarge,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    flexShrink: 1,
  },
  rowTitleDestructive: {
    color: colors.error,
  },
  rowSubtitle: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: TEXT_COLUMN_INSET,
  },
  iconChip: {
    width: ICON_CHIP_SIZE,
    height: ICON_CHIP_SIZE,
    borderRadius: radii.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChipSmall: {
    width: ICON_CHIP_SIZE_SMALL,
    height: ICON_CHIP_SIZE_SMALL,
    borderRadius: radii.md,
    // Keep the question text on the same column as the bigger chips
    marginHorizontal: (ICON_CHIP_SIZE - ICON_CHIP_SIZE_SMALL) / 2,
  },

  // Small pill button ("Turn on" location)
  smallButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.accent,
    borderRadius: radii.button,
  },
  smallButtonPressed: {
    opacity: 0.85,
  },
  smallButtonText: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.background,
  },

  // Follow us card (official tourism links)
  followCard: {
    backgroundColor: colors.passportLeather,
    borderRadius: radii.card,
    overflow: 'hidden',
    ...shadows.card,
  },
  followWatermark: {
    position: 'absolute',
    right: -36,
    bottom: -28,
    opacity: 0.05,
    pointerEvents: 'none',
  },
  followHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.base,
  },
  followEmblem: {
    width: ICON_CHIP_SIZE,
    height: ICON_CHIP_SIZE,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.passportFoil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followHeading: {
    ...typography.labelLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.passportFoil,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  followRule: {
    height: 2,
    marginHorizontal: spacing.base,
    backgroundColor: colors.passportFoil,
    opacity: 0.6,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  followDivider: {
    height: 1,
    marginHorizontal: spacing.base,
    backgroundColor: colors.onPrimaryBorder,
  },
  followTitle: {
    ...typography.labelLarge,
    fontFamily: 'Inter_600SemiBold',
    color: colors.background,
    flexShrink: 1,
  },
  followSubtitle: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.primaryTint,
    opacity: 0.85,
  },
  linkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  socialRow: {
    flexDirection: 'row',
    // Wide enough that the buttons' hitSlop areas don't overlap
    gap: spacing.md,
  },
  // Solid brand color (set per button); the hairline ring keeps the dark
  // TikTok button visible on the navy card
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.onPrimaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonPressed: {
    opacity: 0.75,
  },

  // Helpdesk
  helpCard: {
    backgroundColor: colors.primaryTint,
    borderRadius: radii.card,
    padding: spacing.base,
    gap: spacing.base,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: {
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
  helpSubtitle: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.text,
  },

  // Footer
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.input,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  appName: {
    ...typography.labelLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
  appVersion: {
    ...typography.bodySmall,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.success,
  },
  footerNoteText: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
});
