/**
 * app/(auth)/_layout.tsx
 * Auth group layout — redirects authenticated users to main app.
 * File path in Expo project: app/(auth)/_layout.tsx
 */

import { Stack } from 'expo-router';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function AuthLayout() {
  const user = useAuthStore((s) => s.user);

  // If already logged in, go to main app
  if (user) {
    return <Redirect href="/(tabs)/translate" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
