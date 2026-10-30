import { AddContactSheet } from '@/components/account/AddContactSheet';
import { PassportIdCard } from '@/components/account/PassportIdCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { getStamps } from '@/data/api';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePromoPeriod } from '@/hooks/usePromoPeriod';
import { useSignOut } from '@/hooks/useSignOut';
import { colors, radii, shadows, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

/**
 * Account Tab Screen
 * 
 * Displays user profile information, digital passport ID card, activity stats,
 * account details with contact number management, navigation links, and logout.
 * 
 * Features:
 * - Digital Cavite Tourism Passport ID card
 * - Activity stats (stamps, points, promo period)
 * - Account details with add/verify contact number flow
 * - Navigation to Settings, Redemptions, Privacy Policy
 * - Sign out functionality
 */
export default function AccountScreen() {
  const [contactSheetVisible, setContactSheetVisible] = useState(false);
  
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: promoPeriod } = usePromoPeriod();
  const { data: stamps } = useQuery({
    queryKey: ['stamps'],
    queryFn: getStamps,
  });
  const { signOut, isLoading: signingOut } = useSignOut();

  const handleLogOut = () => {
    signOut();
  };

  const handleAddContactSuccess = () => {
    // Refetch user data to get updated contact number
    // React Query will automatically refetch when the sheet closes
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert('Coming Soon', `${feature} will be available in a future update.`);
  };

  if (userLoading || !user) {
    return (
      <ScreenContainer
        scrollable={false}
        edges={['left', 'right']}
        withTabBarPadding={true}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  // Format promo period date range
  const formatPromoDateRange = () => {
    if (!promoPeriod) return 'Loading...';
    
    const start = new Date(promoPeriod.startDate);
    const end = new Date(promoPeriod.endDate);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}`;
    }
    
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
  };

  const stampCount = stamps?.length || 0;
  const totalStamps = 20; // Total possible stamps (placeholder)
  const stampProgress = stampCount / totalStamps;

  return (
    <ScreenContainer
      scrollable={true}
      edges={['top', 'left', 'right']}
      withTabBarPadding={true}
      testID="account-screen"
    >
      <View style={styles.container}>
        {/* Account Header */}
        <View style={styles.accountHeader}>
          <View style={styles.accountHeaderLeft}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.accountName}>{user.name}</Text>
              <Text style={styles.accountSubtitle}>Active Passport ID</Text>
            </View>
          </View>
          <View style={styles.accountHeaderRight}>
            <Text style={styles.pointsLabel}>POINTS</Text>
            <Text style={styles.accountPoints}>{user.points} pts</Text>
          </View>
        </View>

        {/* Digital ID Card */}
        <PassportIdCard
          userName={user.name}
          municipality={user.address}
          passportId={user.passportId}
        />

        {/* Activity Stats Cards */}
        <View style={styles.statsGrid}>
          {/* Stamps Card */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>STAMPS</Text>
              <Ionicons name="ribbon" size={16} color={colors.primary} />
            </View>
            <View style={styles.statValue}>
              <Text style={styles.statCount}>{stampCount}</Text>
              <Text style={styles.statTotal}>/ {totalStamps}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stampProgress * 100}%` }]} />
            </View>
          </View>

          {/* Points Card */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>CREDITS</Text>
              <Ionicons name="star" size={16} color={colors.accent} />
            </View>
            <View style={styles.statValue}>
              <Text style={[styles.statCount, { color: colors.accent }]}>{user.points}</Text>
              <Text style={[styles.statTotal, { color: colors.accent }]}>pts</Text>
            </View>
            {user.points > 0 && (
              <View style={styles.pointsIndicator}>
                <Ionicons name="arrow-up" size={11} color="#059669" />
                <Text style={styles.pointsNew}>+{user.points} new</Text>
              </View>
            )}
          </View>

          {/* Promo Card */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>PROMO</Text>
              <Ionicons name="megaphone-outline" size={16} color="#994700" />
            </View>
            <View style={styles.promoValue}>
              <Text style={styles.promoTitle}>Q1 Season</Text>
              <Text style={styles.promoDate}>{formatPromoDateRange()}</Text>
            </View>
          </View>
        </View>

        {/* Account Details Section */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>ACCOUNT DETAILS</Text>
            <Pressable onPress={() => handleComingSoon('Edit Profile')}>
              <Text style={styles.editButton}>Edit</Text>
            </Pressable>
          </View>

          {/* Full Name */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="person-circle-outline" size={18} color={`${colors.primary}B3`} />
              <Text style={styles.detailLabel}>Full Name</Text>
            </View>
            <Text style={styles.detailValue}>{user.name}</Text>
          </View>

          {/* Address */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="location-outline" size={18} color={`${colors.primary}B3`} />
              <Text style={styles.detailLabel}>Address</Text>
            </View>
            <Text style={[styles.detailValue, styles.detailValueSmall]} numberOfLines={2}>
              {user.address}
            </Text>
          </View>

          {/* Email */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="mail-outline" size={18} color={`${colors.primary}B3`} />
              <Text style={styles.detailLabel}>Email</Text>
            </View>
            <Text style={[styles.detailValue, styles.detailValueSmall]}>{user.email}</Text>
          </View>

          {/* Contact Number */}
          <View style={[styles.detailRow, styles.contactRow]}>
            <View style={styles.detailLeft}>
              <Ionicons name="phone-portrait-outline" size={18} color={`${colors.primary}B3`} />
              <Text style={styles.detailLabel}>Contact Number</Text>
            </View>
            <Text style={[styles.detailValue, styles.contactValue]}>
              {user.contactNumber || '+63 •••••••••'}
            </Text>
          </View>
          {!user.contactVerified && (
            <View style={styles.contactButtonRow}>
              <Pressable
                style={styles.addContactButton}
                onPress={() => setContactSheetVisible(true)}
              >
                <Ionicons name="add" size={14} color={colors.background} />
                <Text style={styles.addContactText}>Add Contact Number</Text>
              </Pressable>
            </View>
          )}
          {user.contactVerified && (
            <View style={styles.contactButtonRow}>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#047857" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          )}
        </View>

        {/* Navigation Links Section */}
        <View style={styles.linksCard}>
          {/* Settings & Preferences */}
          <Pressable
            style={({ pressed }) => [
              styles.linkRow,
              pressed && styles.linkRowPressed,
            ]}
            onPress={handleSettingsPress}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIconContainer, styles.linkIconPrimary]}>
                <Ionicons name="settings-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.linkTextGroup}>
                <Text style={styles.linkTitle}>Settings & Preferences</Text>
                <Text style={styles.linkSubtitle}>Push Notifications, Language & Help FAQs</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.linkDivider} />

          {/* Redemptions & Vouchers */}
          <Pressable
            style={({ pressed }) => [
              styles.linkRow,
              pressed && styles.linkRowPressed,
            ]}
            onPress={() => handleComingSoon('Redemptions & Vouchers')}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIconContainer, styles.linkIconSecondary]}>
                <Ionicons name="qr-code-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.linkTextGroup}>
                <Text style={styles.linkTitle}>Redemptions & Vouchers</Text>
                <Text style={styles.linkSubtitle}>View claimed rewards & active QR passes</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.linkDivider} />

          {/* Privacy Policy & Terms */}
          <Pressable
            style={({ pressed }) => [
              styles.linkRow,
              pressed && styles.linkRowPressed,
            ]}
            onPress={() => handleComingSoon('Privacy Policy & Terms')}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIconContainer, styles.linkIconSurface]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.linkTextGroup}>
                <Text style={styles.linkTitle}>Privacy Policy & Terms</Text>
                <Text style={styles.linkSubtitle}>Cavite Tourism Registry guidelines & data privacy</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Log Out Button */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          onPress={handleLogOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color={colors.error} />
              <Text style={styles.logoutText}>Log out</Text>
            </>
          )}
        </Pressable>

        {/* Version Text */}
        <Text style={styles.versionText}>
          Cavite Tourism Passport App • v2.4.1 (Build 2027)
        </Text>
      </View>

      {/* Add Contact Number Bottom Sheet */}
      <AddContactSheet
        visible={contactSheetVisible}
        onDismiss={() => setContactSheetVisible(false)}
        onSuccess={handleAddContactSuccess}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Account Header
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    marginTop: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: `${colors.border}99`,
    ...shadows.card,
  },
  accountHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accountHeaderRight: {
    alignItems: 'flex-end',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 20,
  },
  accountSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  pointsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  accountPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },

  // Activity Stats Cards
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.border}99`,
    ...shadows.card,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  statCount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  statTotal: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  progressBar: {
    height: 4,
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  pointsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  pointsNew: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  promoValue: {
    gap: 2,
  },
  promoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 14,
  },
  promoDate: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 13,
  },

  // Account Details Card
  detailsCard: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: `${colors.border}99`,
    ...shadows.card,
    gap: spacing.md,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}80`,
    paddingBottom: spacing.sm,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  editButton: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  detailValueSmall: {
    fontSize: 12,
    maxWidth: '60%',
  },
  contactRow: {
    borderTopWidth: 1,
    borderTopColor: `${colors.border}80`,
    paddingTop: spacing.sm,
  },
  contactButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingRight: 0,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.accent,
    borderRadius: radii.full,
    ...{
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  addContactText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },

  // Navigation Links Card
  linksCard: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: `${colors.border}99`,
    overflow: 'hidden',
    ...shadows.card,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm + 2,
  },
  linkRowPressed: {
    backgroundColor: `${colors.surface}80`,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  linkIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkIconPrimary: {
    backgroundColor: '#D4E3FF',
  },
  linkIconSecondary: {
    backgroundColor: '#FFDBC8',
  },
  linkIconSurface: {
    backgroundColor: '#E9EDFF',
  },
  linkTextGroup: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  linkSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  linkDivider: {
    height: 1,
    backgroundColor: `${colors.border}99`,
    marginLeft: spacing.huge + spacing.md,
  },

  // Log Out Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.background,
    borderRadius: radii.input,
    borderWidth: 2,
    borderColor: colors.error,
    ...{
      shadowColor: colors.error,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  logoutButtonPressed: {
    transform: [{ scale: 0.99 }],
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },

  // Version Text
  versionText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
