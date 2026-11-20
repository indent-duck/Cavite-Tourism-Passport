import { Header } from '@/components/ui/Header';
import { PromoChip } from '@/components/ui/PromoChip';
import { TabBar } from '@/components/ui/TabBar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useStampRequests } from '@/hooks/useStampRequests';
import { getUnseenResults } from '@/lib/stamp-requests';
import { usePathname, useRouter } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

const TAB_PATHS = new Set(['/explore', '/passport', '/scan', '/discover', '/account']);

/**
 * Tabs Layout
 *
 * Five tabs rendered by the custom `TabBar` (raised center Scan button).
 * Includes Header component at the top with user info and promo chip on select tabs.
 * The Passport tab shows a dot while a reviewed stamp request is unseen.
 *
 * Validates: Requirements 1.3.3 (Tabs Layout), 3.4 (Custom Tab Bar Implementation)
 */
export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const { data: stampRequests } = useStampRequests();
  const hasUnseenStampResults = getUnseenResults(stampRequests ?? []).length > 0;

  // `usePathname` is global: it switches to e.g. '/settings' the moment a stack
  // screen is pushed over the tabs, while this layout is still visible behind the
  // slide-in. Deriving the Header from it directly made the Header mount over
  // Account mid-transition (shoving the screen down and flipping the status bar),
  // then unmount again on back. Only follow the pathname while it's a tab route.
  const [tabPath, setTabPath] = useState(pathname);
  if (TAB_PATHS.has(pathname) && pathname !== tabPath) {
    setTabPath(pathname);
  }

  // Show PromoChip only on Explore, Passport, and Discover tabs
  const showPromoChip = tabPath === '/explore' || tabPath === '/passport' || tabPath === '/discover';

  const handlePointsPress = () => {
    router.push('/rewards' as any);
  };

  const showHeader = !!user && tabPath !== '/account';

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
        tabBar={(props) => <TabBar {...props} badges={{ passport: hasUnseenStampResults }} />}
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
