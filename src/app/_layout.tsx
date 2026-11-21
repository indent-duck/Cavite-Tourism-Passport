import { showNotificationsInForeground } from '@/lib/push-notifications';
import { queryClient } from '@/lib/query-client';
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from '@expo-google-fonts/inter';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Notifications that arrive while the app is open still show as a banner
showNotificationsInForeground();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Don't render anything until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Tracks the on-screen keyboard so forms can keep the focused input visible */}
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="scanner" />
              <Stack.Screen name="sites/[id]" />
              <Stack.Screen name="itineraries/[id]" />
              <Stack.Screen name="events/[id]" />
              <Stack.Screen name="rewards" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="edit-profile" />
              <Stack.Screen name="change-password" />
              <Stack.Screen name="delete-account" />
              <Stack.Screen name="stamp-requests/index" />
              <Stack.Screen name="stamp-requests/new" />
            </Stack>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
