/**
 * app/_layout.tsx
 * Root layout — sets up fonts, auth listener, and stack navigation.
 * File path in Expo project: app/_layout.tsx
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../store/authStore';

// Keep splash screen visible until fonts and auth are ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const loading = useAuthStore((s) => s.loading);

  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
    // 'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize Firebase Auth listener on mount
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, []);

  // Hide splash screen once fonts and auth are ready
  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal/premium"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'BiZY Premium',
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#c9a227',
          }}
        />
        <Stack.Screen
          name="modal/cultural-note"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Cultural Note',
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#c9a227',
          }}
        />
        <Stack.Screen
          name="modal/settings"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
