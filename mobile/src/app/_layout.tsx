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

import { useAuthRole } from '@/hooks/use-auth-role';

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Unified role detection & automatic invite claim hook
  const { role, isResolving } = useAuthRole();

  // Background offline sync lifecycle watcher
  useNetworkSync();

  // Initialize local SQLite database schema and indexes on mount
  useEffect(() => {
    initLocalDatabase().catch((err) => {
      console.error('[SQLite] Failed to initialize local database:', err);
    });
  }, []);

  useEffect(() => {
    if (isResolving || role === 'loading') return;

    const currentSegment = segments[0] as string | undefined;
    const inAuthGroup = currentSegment === '(auth)';
    const inBusinessGroup = currentSegment === '(business)';
    const inStaffGroup = currentSegment === 'staff';

    switch (role) {
      case 'unauthenticated':
        if (!inAuthGroup) {
          router.replace('/(auth)/login');
        }
        break;

      case 'sales':
        // Sales Staff: Strictly restricted to /staff counter interface
        // Block access to owner tabs, health metrics, and business wizard
        if (!inStaffGroup) {
          router.replace('/staff' as any);
        }
        break;

      case 'owner':
        // Business Owner: Access to owner tabs, health, daily digest
        // Prevent access to auth, onboarding create-business, or staff interface
        if (inAuthGroup || (inBusinessGroup && segments[1] === 'create-business') || inStaffGroup) {
          router.replace('/');
        }
        break;

      case 'new_user':
        // Brand new user without staff assignment or registered business -> Onboarding
        if (!inBusinessGroup) {
          router.replace('/(business)/create-business');
        }
        break;
    }
  }, [role, isResolving, segments, router]);

  return (
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
