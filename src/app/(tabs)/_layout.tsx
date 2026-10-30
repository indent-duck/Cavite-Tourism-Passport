import { Header } from '@/components/ui/Header';
import { PromoChip } from '@/components/ui/PromoChip';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Tabs Layout with Custom Tab Bar
 * 
 * Implements a custom bottom tab bar with 5 tabs and a raised center Scan button.
 * Includes Header component at the top with user info and promo chip on select tabs.
 * 
 * Validates: Requirements 1.3.3 (Tabs Layout), 3.4 (Custom Tab Bar Implementation)
 */

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

const tabs: TabConfig[] = [
  { 
    name: 'explore', 
    label: 'Explore', 
    icon: 'compass-outline',
    iconFocused: 'compass',
  },
  { 
    name: 'passport', 
    label: 'Passport', 
    icon: 'book-outline',
    iconFocused: 'book',
  },
  { 
    name: 'scan', 
    label: 'Scan', 
    icon: 'qr-code-outline',
    iconFocused: 'qr-code',
  },
  { 
    name: 'discover', 
    label: 'Discover', 
    icon: 'calendar-outline',
    iconFocused: 'calendar',
  },
  { 
    name: 'account', 
    label: 'Account', 
    icon: 'person-outline',
    iconFocused: 'person',
  },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const router = useRouter();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;
          const isCenter = index === 2; // Scan tab

          // Center Scan button
          if (isCenter) {
            return (
              <Pressable
                key={tab.name}
                style={styles.centerButtonContainer}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/scanner' as any);
                }}
                testID="scan-tab-button"
              >
                <View style={styles.centerButton}>
                  <Ionicons name="qr-code" size={32} color={colors.background} />
                </View>
              </Pressable>
            );
          }

          // Regular tab
          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            if (!isFocused) {
              // Use router.push instead of navigation.navigate for Expo Router
              router.push(`/(tabs)/${tab.name}` as any);
            }
          };

          return (
            <Pressable
              key={tab.name}
              style={styles.tab}
              onPress={onPress}
              testID={`${tab.name}-tab-button`}
            >
              <Ionicons
                name={isFocused ? tab.iconFocused : tab.icon}
                size={24}
                color={isFocused ? colors.primary : colors.border}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? colors.primary : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  // Show PromoChip only on Explore and Passport tabs
  const showPromoChip = pathname === '/explore' || pathname === '/passport';

  const handlePointsPress = () => {
    router.push('/rewards' as any);
  };

  return (
    <>
      {/* Header at the top of all tab screens except Account */}
      {user && !pathname.includes('/account') && (
        <Header
          userName={user.name}
          points={user.points}
          onPointsPress={handlePointsPress}
          rightSlot={showPromoChip ? <PromoChip /> : undefined}
        />
      )}

      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="passport" />
        <Tabs.Screen name="scan" />
        <Tabs.Screen name="discover" />
        <Tabs.Screen name="account" />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.tabBar,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    ...shadows.button,
  },
  label: {
    ...typography.labelSmall,
    marginTop: spacing.xs,
  },
});
