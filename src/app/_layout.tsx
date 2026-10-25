import { Stack } from 'expo-router';

export default function RootLayout() {
  // TODO: Task 5.1 - Load Inter fonts and configure React Query provider
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
