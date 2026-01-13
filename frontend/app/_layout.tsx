import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121212' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="substance/[name]" 
          options={{ 
            headerShown: true, 
            headerStyle: { backgroundColor: '#1E1E1E' },
            headerTintColor: '#fff',
            title: 'Substance Details',
            presentation: 'modal'
          }} 
        />
      </Stack>
    </View>
  );
}
