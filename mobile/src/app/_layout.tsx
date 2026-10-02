import '../global.css';
import '@/lib/online-manager-polyfill';
import { useEffect } from 'react';
import { DefaultTheme, ThemeProvider, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { authClient } from '@/lib/auth-client';
import { useBusinessStore } from '@/store/business-store';
import { initLocalDatabase } from '@/db/migrations';
import { useNetworkSync } from '@/hooks/use-network-sync';

import { Platform } from 'react-native';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap';
  document.head.appendChild(link);
}

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

export default function TabLayout() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const segments = useSegments();

  // Background offline sync lifecycle watcher
  useNetworkSync();

  const loadInitialState = useBusinessStore((state) => state.loadInitialState);
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const isBusinessPending = useBusinessStore((state) => state.isPending);

  // Initialize local SQLite database schema and indexes on mount
  useEffect(() => {
    initLocalDatabase().catch((err) => {
      console.error('[SQLite] Failed to initialize local database:', err);
    });
  }, []);

  // Sync business store state on authentication
  useEffect(() => {
    if (session) {
      loadInitialState();
    }
  }, [session, loadInitialState]);

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
  }, [session, isPending, activeBusiness, isBusinessPending, segments, router]);

  return (
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
