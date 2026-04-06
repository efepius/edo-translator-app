/**
 * app/index.tsx
 * Entry point — redirects to tabs or auth based on login state.
 * File path in Expo project: app/index.tsx
 */

import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return null;

  // Route authenticated users to main app, others to login
  return user ? <Redirect href="/(tabs)/translate" /> : <Redirect href="/(auth)/welcome" />;
}
