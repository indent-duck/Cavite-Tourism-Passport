import { Text, View } from 'react-native';

export default function Index() {
  // TODO: Task 5.2 - This will redirect to /(auth)/login once auth routes are created
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Cavite Tourism Passport</Text>
      <Text style={{ marginTop: 8, color: '#6B7280' }}>
        Auth routes will be created in task 5.2
      </Text>
    </View>
  );
}
