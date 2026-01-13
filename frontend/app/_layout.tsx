import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { theme } from '../constants/theme';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ 
        headerShown: false, 
        contentStyle: { backgroundColor: theme.background },
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.textPrimary,
      }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="substance/[name]" 
          options={{ 
            headerShown: true, 
            title: 'Substance Details',
            presentation: 'modal',
            headerStyle: { backgroundColor: theme.card },
            headerTintColor: theme.textPrimary,
          }} 
        />
      </Stack>
    </View>
  );
}
