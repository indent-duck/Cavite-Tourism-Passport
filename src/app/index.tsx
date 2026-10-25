import { Redirect } from 'expo-router';

export default function Index() {
  // Temporary redirect to tabs for foundation checkpoint testing
  // Will be replaced with auth flow in task 5.2
  return <Redirect href="/(tabs)/explore" />;
}
