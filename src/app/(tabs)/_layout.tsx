import { Header } from '@/components/ui/Header';
import { PromoChip } from '@/components/ui/PromoChip';
import { TabBar } from '@/components/ui/TabBar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePathname, useRouter } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

/**
 * Tabs Layout
 *
 * Five tabs rendered by the custom `TabBar` (raised center Scan button).
 * Includes Header component at the top with user info and promo chip on select tabs.
 *
 * Validates: Requirements 1.3.3 (Tabs Layout), 3.4 (Custom Tab Bar Implementation)
 */
export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  // Show PromoChip only on Explore, Passport, and Discover tabs
  const showPromoChip = pathname === '/explore' || pathname === '/passport' || pathname === '/discover';

  const handlePointsPress = () => {
    router.push('/rewards' as any);
  };

  const showHeader = !!user && !pathname.includes('/account');

  return (
    // White backing so the gaps under the Header's rounded bottom corners
    // match the tab screens instead of the navigator's default gray
    <View style={styles.root}>
      {/* Light icons over the blue Header; dark icons on Account's white top */}
      <StatusBar style={showHeader ? 'light' : 'dark'} />

      {/* Header at the top of all tab screens except Account */}
      {showHeader && (
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
        tabBar={(props) => <TabBar {...props} />}
      >
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="passport" />
        <Tabs.Screen name="scan" />
        <Tabs.Screen name="discover" />
        <Tabs.Screen name="account" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
