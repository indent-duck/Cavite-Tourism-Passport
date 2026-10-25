import { Stack } from 'expo-router';

/**
 * Auth Layout
 * 
 * Stack navigator for authentication flows (login, signup, forgot password).
 * No header shown - each screen manages its own layout.
 * Gestures enabled for back navigation.
 * 
 * Validates: Requirements 1.3.2 (Auth Layout)
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup/email" />
      <Stack.Screen name="signup/verify" />
      <Stack.Screen name="signup/details" />
      <Stack.Screen name="forgot/email" />
      <Stack.Screen name="forgot/verify" />
      <Stack.Screen name="forgot/new-password" />
      <Stack.Screen name="forgot/success" />
    </Stack>
  );
}
