import { useEffect } from 'react';
import {  DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { authClient } from '@/lib/auth-client';
import { useBusinessStore } from '@/store/business-store';

import { Platform } from 'react-native';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap';
  document.head.appendChild(link);
}

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const segments = useSegments();

  const loadInitialState = useBusinessStore((state) => state.loadInitialState);
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const isBusinessPending = useBusinessStore((state) => state.isPending);

  // Sync business store state on authentication
  useEffect(() => {
    if (session) {
      loadInitialState();
    }
  }, [session]);

  useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inBusinessGroup = segments[0] === '(business)';

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Wait for initial business fetch to complete
      if (isBusinessPending && !activeBusiness) return;

      if (!activeBusiness) {
        // Authenticated but no business registered -> force business onboarding
        if (!inBusinessGroup) {
          router.replace('/(business)/create-business');
        }
      } else {
        // Authenticated and has business -> prevent back navigation to login or onboarding
        if (inAuthGroup || (inBusinessGroup && segments[1] === 'create-business')) {
          router.replace('/');
        }
      }
    }
  }, [session, isPending, activeBusiness, isBusinessPending, segments]);

  return (
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
