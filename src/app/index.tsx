import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to login for auth testing
  return <Redirect href="/(auth)/login" />;
}
