import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';


import { ThemedText } from '@/components/themed-text';
import { HamburgerHeader } from '@/components/navigation/hamburger-drawer';
import { useTheme } from '@/hooks/use-theme';
import { useBusinessStore } from '@/store/business-store';
import { authClient } from '@/lib/auth-client';
import { useNetworkSync } from '@/hooks/use-network-sync';

export default function ProfileScreen() {
  const colors = useTheme();
  const { isOnline, isSyncing, pendingCount, triggerSync } = useNetworkSync();
  const { data: session } = authClient.useSession();
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const activeBranch = useBusinessStore((state) => state.activeBranch);
  const branches = useBusinessStore((state) => state.branches);
  const switchBranch = useBusinessStore((state) => state.switchBranch);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = session?.user;
  const displayName = user?.name || 'Merchant User';
  const displayEmail = user?.email || 'user@networth.et';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of NetWorth Ethiopia?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await authClient.signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <HamburgerHeader activeTabId="profile" />

      <ScrollView
        className="flex-1 px-4 py-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* 1. USER IDENTITY CARD */}
        <View style={styles.userCard}>
          <View className="flex-row items-center gap-4">
            <View style={styles.avatarCircle}>
              <ThemedText className="text-[18px] font-black text-white">
                {initials}
              </ThemedText>
            </View>

            <View className="flex-1 gap-0.5">
              <View className="flex-row items-center gap-2">
                <ThemedText className="text-[18px] font-black text-gray-900" numberOfLines={1}>
                  {displayName}
                </ThemedText>
                <View style={styles.roleBadge}>
                  <ThemedText className="text-[10px] font-extrabold text-brand uppercase">
                    Owner
                  </ThemedText>
                </View>
              </View>
              <ThemedText className="text-[13px] font-medium text-gray-500" numberOfLines={1}>
                {displayEmail}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* 2. OPERATING BUSINESS CARD */}
        <View className="mt-4 p-5 rounded-3xl bg-white border border-gray-100 shadow-sm gap-3.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-xl bg-brand-soft items-center justify-center border border-brand-light">
                <ThemedText className="text-[16px]">🏬</ThemedText>
              </View>
              <ThemedText className="text-[15px] font-extrabold text-gray-900">
                Business & Operating Branch
              </ThemedText>
            </View>

            <Pressable
              onPress={() => router.push('/(business)/business-profile' as any)}
              className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 active:opacity-70"
            >
              <ThemedText className="text-[11px] font-bold text-gray-700">Edit</ThemedText>
            </Pressable>
          </View>

          <View className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-gray-100 gap-1.5">
            <ThemedText className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Registered Entity
            </ThemedText>
            <ThemedText className="text-[16px] font-black text-gray-900">
              {activeBusiness?.name || 'NetWorth Ethiopia'}
            </ThemedText>
            <View className="flex-row items-center gap-3 mt-1">
              <ThemedText className="text-[12px] font-medium text-gray-500">
                TIN: {activeBusiness?.tinNumber || '0049182390'}
              </ThemedText>
              <ThemedText className="text-[12px] font-medium text-gray-400">·</ThemedText>
              <ThemedText className="text-[12px] font-medium text-gray-500">
                Category: Retail & Trade
              </ThemedText>
            </View>
          </View>

          {/* Active Branch Switcher */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <ThemedText className="text-[12px] font-bold uppercase tracking-wider text-gray-500">
                Active Branch: {activeBranch?.name || 'Main Branch'}
              </ThemedText>
              <Pressable onPress={() => router.push('/(business)/branches' as any)}>
                <ThemedText className="text-[12px] font-bold text-brand">
                  Manage ({branches.length})
                </ThemedText>
              </Pressable>
            </View>

            {/* Quick Branch Switcher Chips */}
            {branches.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 py-1">
                {branches.map((branch: any) => {
                  const isCurrent = activeBranch?.id === branch.id;
                  return (
                    <Pressable
                      key={branch.id}
                      onPress={() => switchBranch(branch.id)}
                      style={[
                        styles.branchChip,
                        isCurrent && styles.branchChipActive,
                      ]}
                    >
                      <View
                        className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-brand' : 'bg-gray-300'}`}
                      />
                      <ThemedText
                        className={`text-[13px] ${isCurrent ? 'font-black text-brand-dark' : 'font-medium text-gray-700'}`}
                      >
                        {branch.name}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}
          </View>
        </View>

        {/* 3. MANAGEMENT SHORTCUTS */}
        <View className="mt-4 p-4 rounded-3xl bg-white border border-gray-100 shadow-sm gap-1">
          <ThemedText className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 px-2 mb-1">
            Quick Actions
          </ThemedText>

          <Pressable
            onPress={() => router.push('/(business)/branches' as any)}
            style={styles.actionRow}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-blue-50 items-center justify-center">
                <ThemedText className="text-[15px]">🏢</ThemedText>
              </View>
              <ThemedText className="text-[14px] font-bold text-gray-800">
                Branch Management
              </ThemedText>
            </View>
            <ThemedText className="text-[16px] text-gray-400 font-bold">›</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(business)/create-branch' as any)}
            style={styles.actionRow}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-brand-soft items-center justify-center">
                <ThemedText className="text-[15px]">➕</ThemedText>
              </View>
              <ThemedText className="text-[14px] font-bold text-gray-800">
                Add New Branch
              </ThemedText>
            </View>
            <ThemedText className="text-[16px] text-gray-400 font-bold">›</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(business)/business-profile' as any)}
            style={styles.actionRow}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-purple-50 items-center justify-center">
                <ThemedText className="text-[15px]">⚙️</ThemedText>
              </View>
              <ThemedText className="text-[14px] font-bold text-gray-800">
                Business Settings & Profile
              </ThemedText>
            </View>
            <ThemedText className="text-[16px] text-gray-400 font-bold">›</ThemedText>
          </Pressable>
        </View>

        {/* 4. SYSTEM & PREFERENCES */}
        <View className="mt-4 p-4 rounded-3xl bg-white border border-gray-100 shadow-sm gap-2">
          <ThemedText className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 px-2 mb-1">
            System & Currency
          </ThemedText>

          <View style={styles.preferenceRow}>
            <ThemedText className="text-[13px] font-semibold text-gray-700">
              Primary Currency
            </ThemedText>
            <View className="px-2.5 py-1 rounded-lg bg-brand-soft border border-brand-light">
              <ThemedText className="text-[11px] font-bold text-brand-dark">
                ETB (Ethiopian Birr)
              </ThemedText>
            </View>
          </View>

          <View style={styles.preferenceRow}>
            <View className="flex-row items-center gap-2">
              <ThemedText className="text-[15px]">☁️</ThemedText>
              <ThemedText className="text-[13px] font-semibold text-gray-700">
                Cloud Sync Status
              </ThemedText>
            </View>

            <Pressable
              onPress={() => {
                if (isSyncing) {
                  Alert.alert('Sync in Progress', 'Currently syncing pending changes with the server.');
                } else if (!isOnline) {
                  Alert.alert(
                    'Offline Mode',
                    'You are currently offline. Changes are saved locally and will automatically sync once your connection is restored.'
                  );
                } else if (pendingCount > 0) {
                  Alert.alert(
                    'Unsynced Changes',
                    `You have ${pendingCount} pending offline update(s). Tap Sync Now to push them immediately.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Sync Now', onPress: () => triggerSync() },
                    ]
                  );
                } else {
                  Alert.alert(
                    'Cloud Sync Status',
                    'Your device is connected and all data is fully synchronized with the server.',
                    [{ text: 'OK' }]
                  );
                }
              }}
              style={[
                styles.syncStatusBadge,
                !isOnline && styles.syncStatusOffline,
                pendingCount > 0 && styles.syncStatusPending,
              ]}
            >
              <View
                style={[
                  styles.syncDotGreen,
                  !isOnline && styles.syncDotOffline,
                  pendingCount > 0 && styles.syncDotPending,
                ]}
              />
              <ThemedText
                style={[
                  styles.syncTextGreen,
                  !isOnline && styles.syncTextOffline,
                  pendingCount > 0 && styles.syncTextPending,
                ]}
              >
                {isSyncing
                  ? '🔄 Syncing...'
                  : !isOnline
                  ? '📶 Offline'
                  : pendingCount > 0
                  ? `🟡 ${pendingCount} Unsynced`
                  : '🟢 Synced'}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.preferenceRow}>
            <ThemedText className="text-[13px] font-semibold text-gray-700">
              App Version
            </ThemedText>
            <ThemedText className="text-[12px] font-medium text-gray-400">
              1.0.0 (Expo SDK 57)
            </ThemedText>
          </View>
        </View>

        {/* 5. SIGN OUT BUTTON */}
        <View className="mt-6">
          <Pressable
            onPress={handleSignOut}
            disabled={isLoggingOut}
            style={styles.signOutBtn}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <View className="flex-row items-center gap-2">
                <ThemedText style={{ fontSize: 16 }}>🚪</ThemedText>
                <ThemedText className="text-[14px] font-bold text-[#EF4444]">
                  Sign Out of NetWorth
                </ThemedText>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#065F46',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ECFDF5',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 95, 70, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.2)',
  },
  branchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  branchChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  signOutBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  syncStatusOffline: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  syncStatusPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  syncDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  syncDotOffline: {
    backgroundColor: '#9CA3AF',
  },
  syncDotPending: {
    backgroundColor: '#F59E0B',
  },
  syncTextGreen: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },
  syncTextOffline: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  syncTextPending: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
  },
});

