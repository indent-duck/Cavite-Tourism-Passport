import { Header } from '@/components/ui/Header';
import { PromoChip } from '@/components/ui/PromoChip';
import { TabBar } from '@/components/ui/TabBar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePathname, useRouter } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

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
        tabBar={(props) => <TabBar {...props} />}
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
