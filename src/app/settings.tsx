import { AccordionRow } from '@/components/ui/AccordionRow';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusPill } from '@/components/ui/StatusPill';
import { mockFaqs } from '@/data/mock-data';
import { useSettings } from '@/hooks';
import { APP_VERSION, HELPDESK_EMAIL, SOCIAL_LINKS } from '@/lib/constants';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
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
 * 1. Device & alerts – push notification toggle (optimistic) and the real
 *    foreground location permission status, with a shortcut to enable it
 * 2. Help & FAQs – single-open accordion
 * 3. Official tourism links – open in the in-app browser
 * 4. Helpdesk card – compose an email to the tourism helpdesk
 * 5. Footer – app name, version, platform
 *
 * The layout renders immediately (no full-screen loading state) so the push
 * transition never swaps content mid-slide; only the switch waits for data.
 */

type IconName = keyof typeof Ionicons.glyphMap;
type Tone = 'primary' | 'accent' | 'success' | 'neutral';

const TONES: Record<Tone, { background: string; icon: string }> = {
  primary: { background: colors.primaryTint, icon: colors.primary },
  accent: { background: colors.accentTint, icon: colors.accent },
  success: { background: colors.successLight, icon: colors.success },
  neutral: { background: colors.surface, icon: colors.textSecondary },
};

const FAQ_TONES: Tone[] = ['primary', 'accent', 'neutral', 'success'];

const OFFICIAL_LINKS: {
  id: string;
  icon: IconName;
  tone: Tone;
  title: string;
  subtitle: string;
  url: string;
  verified: boolean;
}[] = [
  {
    id: 'biyaheng-south',
    icon: 'compass-outline',
    tone: 'accent',
    title: 'Biyaheng South',
    subtitle: 'Official South Luzon tourism guide',
    url: SOCIAL_LINKS.BIYAHENG_SOUTH,
    verified: true,
  },
  {
    id: 'cavite-tourism',
    icon: 'business-outline',
    tone: 'primary',
    title: 'Cavite Provincial Tourism',
    subtitle: 'Provincial Capitol, Trece Martires',
    url: SOCIAL_LINKS.CAVITE_TOURISM,
    verified: true,
  },
  {
    id: 'dot-4a',
    icon: 'earth-outline',
    tone: 'success',
    title: 'DOT IV-A',
    subtitle: 'Department of Tourism CALABARZON',
    url: SOCIAL_LINKS.DOT_4A,
    verified: false,
  },
  {
    id: 'dilg-4a',
    icon: 'shield-checkmark-outline',
    tone: 'primary',
    title: 'DILG IV-A',
    subtitle: 'Dept. of the Interior & Local Government',
    url: SOCIAL_LINKS.DILG_4A,
    verified: false,
  },
];

export default function SettingsScreen() {
  const { settings, updateSetting } = useSettings();
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const handleLinkPress = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
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
        <Section title="Official tourism links" caption="Opens in browser">
          <View style={styles.card}>
            {OFFICIAL_LINKS.map((link, index) => (
              <Fragment key={link.id}>
                {index > 0 && <View style={styles.rowDivider} />}
                <LinkRow
                  icon={link.icon}
                  tone={link.tone}
                  title={link.title}
                  subtitle={link.subtitle}
                  verified={link.verified}
                  onPress={() => handleLinkPress(link.url)}
                />
              </Fragment>
            ))}
          </View>
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

function PushNotificationsRow({
  enabled,
  ready,
  onChange,
}: {
  enabled: boolean;
  ready: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onChange(!enabled)}
      disabled={!ready}
      accessibilityRole="switch"
      accessibilityLabel="Push notifications"
      accessibilityHint="Alerts for new stamp sites, events, and promo deadlines"
      accessibilityState={{ checked: enabled, disabled: !ready }}
      testID="settings-push-row"
    >
      <IconChip icon="notifications-outline" tone="primary" />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>Push notifications</Text>
        <Text style={styles.rowSubtitle}>
          New stamp sites, events, and promo deadlines
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onChange}
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

function LinkRow({
  icon,
  tone,
  title,
  subtitle,
  verified,
  onPress,
}: {
  icon: IconName;
  tone: Tone;
  title: string;
  subtitle: string;
  verified: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={verified ? `${title}, official partner` : title}
      accessibilityHint={`${subtitle}. Opens in browser`}
    >
      <IconChip icon={icon} tone={tone} />
      <View style={styles.rowText}>
        <View style={styles.linkTitleRow}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {title}
          </Text>
          {verified && <Ionicons name="checkmark-circle" size={15} color={colors.primary} />}
        </View>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
    </Pressable>
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

  // Grouped card (rows separated by inset dividers)
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
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
  rowPressed: {
    backgroundColor: colors.surface,
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

  // Location "Turn on" button
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

  // Links
  linkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
