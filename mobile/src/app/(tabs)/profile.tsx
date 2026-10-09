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
import {
  BuildingIcon,
  SettingsIcon,
  LogOutIcon,
  CloudIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  PlusIcon,
  MapPinIcon,
  BanknoteIcon,
  CheckCircleIcon,
  RefreshCwIcon,
} from '@/components/icons';

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
  const displayName = user?.name || activeBusiness?.name || 'Merchant Owner';
  const displayEmail = user?.email || 'merchant@networth.et';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'NW';

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

  const handleSyncPress = () => {
    if (isSyncing) {
      Alert.alert('Syncing', 'A database synchronization is already underway.');
    } else if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'Device is offline. Changes are saved locally and will auto-sync once connected to the internet.'
      );
    } else if (pendingCount > 0) {
      Alert.alert(
        'Sync Pending Updates',
        `You have ${pendingCount} offline update(s) ready to sync with the server.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sync Now', onPress: () => triggerSync() },
        ]
      );
    } else {
      Alert.alert(
        'All Data Synced',
        'Your local database is fully up to date with the server.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Top Header Drawer Bar */}
      <HamburgerHeader activeTabId="profile" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HERO USER PROFILE CARD */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
          <View style={styles.heroRow}>
            {/* Avatar with Ethiopian Emerald Ring */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <ThemedText style={styles.avatarText}>{initials}</ThemedText>
              </View>
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
              </View>
            </View>

            {/* User Credentials & Role Badge */}
            <View style={styles.heroInfo}>
              <View style={styles.heroNameRow}>
                <ThemedText style={[styles.heroName, { color: colors.text }]} numberOfLines={1}>
                  {displayName}
                </ThemedText>
                <View style={styles.roleBadge}>
                  <ThemedText style={styles.roleBadgeText}>Owner</ThemedText>
                </View>
              </View>

              <ThemedText style={styles.heroEmail} numberOfLines={1}>
                {displayEmail}
              </ThemedText>

              {/* Business Entity Subtitle */}
              <View style={styles.heroEntityPill}>
                <BuildingIcon size={12} color="#065F46" strokeWidth={2.2} />
                <ThemedText style={styles.heroEntityText} numberOfLines={1}>
                  {activeBusiness?.name || 'NetWorth Ethiopia'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* 2. OPERATING BUSINESS & BRANCH MANAGEMENT */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
          {/* Card Header */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                <BuildingIcon size={17} color="#065F46" strokeWidth={2.2} />
              </View>
              <View>
                <ThemedText style={[styles.cardSectionTitle, { color: colors.text }]}>
                  Business & Branches
                </ThemedText>
                <ThemedText style={styles.cardSectionSubtitle}>
                  Operational entity & locations
                </ThemedText>
              </View>
            </View>

            <Pressable
              onPress={() => router.push('/(business)/business-profile' as any)}
              style={styles.editBtn}
              accessibilityLabel="Edit Business Profile"
            >
              <ThemedText style={styles.editBtnText}>Manage</ThemedText>
            </Pressable>
          </View>

          {/* Business Entity Overview Box */}
          <View style={[styles.entityBox, { backgroundColor: colors.backgroundSelected }]}>
            <View style={styles.entityNameRow}>
              <ThemedText style={[styles.entityName, { color: colors.text }]} numberOfLines={1}>
                {activeBusiness?.name || 'NetWorth Ethiopia'}
              </ThemedText>
              <View style={styles.verifiedBadge}>
                <ShieldCheckIcon size={12} color="#065F46" strokeWidth={2.2} />
                <ThemedText style={styles.verifiedBadgeText}>Verified</ThemedText>
              </View>
            </View>

            <View style={styles.entityMetaRow}>
              <ThemedText style={styles.entityMetaLabel}>
                TIN: <ThemedText style={[styles.entityMetaValue, { color: colors.text }]}>{activeBusiness?.tinNumber || '0049182390'}</ThemedText>
              </ThemedText>
              <ThemedText style={styles.entityMetaDivider}>•</ThemedText>
              <ThemedText style={styles.entityMetaLabel}>
                Category: <ThemedText style={[styles.entityMetaValue, { color: colors.text }]}>Retail & Trade</ThemedText>
              </ThemedText>
            </View>
          </View>

          {/* Active Branch Quick Selector */}
          <View style={styles.branchSelectorSection}>
            <View style={styles.branchSelectorHeader}>
              <View style={styles.branchLabelGroup}>
                <MapPinIcon size={13} color="#64748B" strokeWidth={2} />
                <ThemedText style={styles.branchSelectorTitle}>
                  Active Branch: <ThemedText style={[styles.branchSelectorActiveName, { color: colors.text }]}>{activeBranch?.name || 'Main Branch'}</ThemedText>
                </ThemedText>
              </View>

              <Pressable
                onPress={() => router.push('/(business)/branches' as any)}
                hitSlop={8}
              >
                <ThemedText style={styles.branchCountLink}>
                  All Branches ({branches.length})
                </ThemedText>
              </Pressable>
            </View>

            {/* Branch Selector Chips Horizontal Bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.branchChipsContainer}
            >
              {branches.map((branch: any) => {
                const isCurrent = activeBranch?.id === branch.id;
                return (
                  <Pressable
                    key={branch.id}
                    onPress={() => switchBranch(branch.id)}
                    style={[
                      styles.branchChip,
                      {
                        backgroundColor: isCurrent ? '#ECFDF5' : colors.backgroundSelected,
                        borderColor: isCurrent ? '#065F46' : 'transparent',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.branchChipDot,
                        { backgroundColor: isCurrent ? '#065F46' : '#94A3B8' },
                      ]}
                    />
                    <ThemedText
                      style={[
                        styles.branchChipText,
                        {
                          color: isCurrent ? '#065F46' : colors.textSecondary,
                          fontWeight: isCurrent ? '800' : '600',
                        },
                      ]}
                    >
                      {branch.name}
                    </ThemedText>
                  </Pressable>
                );
              })}

              {/* Add New Branch Chip */}
              <Pressable
                onPress={() => router.push('/(business)/create-branch' as any)}
                style={[styles.addBranchChip, { borderColor: colors.backgroundSelected }]}
              >
                <PlusIcon size={13} color="#065F46" strokeWidth={2.5} />
                <ThemedText style={styles.addBranchChipText}>Add Branch</ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </View>

        {/* 3. BUSINESS MANAGEMENT & SHORTCUTS */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
          <ThemedText style={styles.sectionHeaderLabel}>
            Business Settings
          </ThemedText>

          {/* Action: Branch Management */}
          <Pressable
            onPress={() => router.push('/(business)/branches' as any)}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: colors.backgroundSelected },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <BuildingIcon size={17} color="#2563EB" strokeWidth={2.2} />
              </View>
              <View>
                <ThemedText style={[styles.menuItemTitle, { color: colors.text }]}>
                  Branch Locations
                </ThemedText>
                <ThemedText style={styles.menuItemSubtitle}>
                  View and manage store locations
                </ThemedText>
              </View>
            </View>
            <ChevronRightIcon size={17} color="#94A3B8" />
          </Pressable>

          <View style={[styles.menuDivider, { backgroundColor: colors.backgroundSelected }]} />

          {/* Action: Business Profile & Tax */}
          <Pressable
            onPress={() => router.push('/(business)/business-profile' as any)}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: colors.backgroundSelected },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
                <SettingsIcon size={17} color="#7C3AED" strokeWidth={2.2} />
              </View>
              <View>
                <ThemedText style={[styles.menuItemTitle, { color: colors.text }]}>
                  Business Profile & TIN
                </ThemedText>
                <ThemedText style={styles.menuItemSubtitle}>
                  Legal name, tax number, registration
                </ThemedText>
              </View>
            </View>
            <ChevronRightIcon size={17} color="#94A3B8" />
          </Pressable>

          <View style={[styles.menuDivider, { backgroundColor: colors.backgroundSelected }]} />

          {/* Action: Add New Branch */}
          <Pressable
            onPress={() => router.push('/(business)/create-branch' as any)}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: colors.backgroundSelected },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                <PlusIcon size={17} color="#065F46" strokeWidth={2.5} />
              </View>
              <View>
                <ThemedText style={[styles.menuItemTitle, { color: colors.text }]}>
                  Create New Branch
                </ThemedText>
                <ThemedText style={styles.menuItemSubtitle}>
                  Expand with a new branch location
                </ThemedText>
              </View>
            </View>
            <ChevronRightIcon size={17} color="#94A3B8" />
          </Pressable>
        </View>

        {/* 4. SYSTEM, SYNC & PREFERENCES */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
          <ThemedText style={styles.sectionHeaderLabel}>
            System & Sync
          </ThemedText>

          {/* Cloud Sync Row */}
          <Pressable
            onPress={handleSyncPress}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: colors.backgroundSelected },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#065F46" />
                ) : (
                  <CloudIcon size={17} color="#065F46" strokeWidth={2.2} />
                )}
              </View>
              <View>
                <ThemedText style={[styles.menuItemTitle, { color: colors.text }]}>
                  Cloud Synchronization
                </ThemedText>
                <ThemedText style={styles.menuItemSubtitle}>
                  Tap to check sync status
                </ThemedText>
              </View>
            </View>

            <View
              style={[
                styles.syncPill,
                !isOnline && styles.syncPillOffline,
                pendingCount > 0 && styles.syncPillPending,
              ]}
            >
              <View
                style={[
                  styles.syncDot,
                  !isOnline && styles.syncDotOffline,
                  pendingCount > 0 && styles.syncDotPending,
                ]}
              />
              <ThemedText
                style={[
                  styles.syncPillText,
                  !isOnline && styles.syncPillTextOffline,
                  pendingCount > 0 && styles.syncPillTextPending,
                ]}
              >
                {isSyncing
                  ? 'Syncing...'
                  : !isOnline
                  ? 'Offline'
                  : pendingCount > 0
                  ? `${pendingCount} Unsynced`
                  : 'Synced'}
              </ThemedText>
            </View>
          </Pressable>

          <View style={[styles.menuDivider, { backgroundColor: colors.backgroundSelected }]} />

          {/* Currency Row */}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                <BanknoteIcon size={17} color="#B45309" strokeWidth={2.2} />
              </View>
              <View>
                <ThemedText style={[styles.menuItemTitle, { color: colors.text }]}>
                  Base Currency
                </ThemedText>
                <ThemedText style={styles.menuItemSubtitle}>
                  Ethiopian Birr
                </ThemedText>
              </View>
            </View>
            <View style={styles.currencyBadge}>
              <ThemedText style={styles.currencyBadgeText}>ETB</ThemedText>
            </View>
          </View>

          <View style={[styles.menuDivider, { backgroundColor: colors.backgroundSelected }]} />

          {/* Version Info Row */}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.backgroundSelected }]}>
                <CheckCircleIcon size={17} color="#64748B" strokeWidth={2.2} />
              </View>
              <View>
                <ThemedText style={[styles.menuItemTitle, { color: colors.text }]}>
                  App Version
                </ThemedText>
                <ThemedText style={styles.menuItemSubtitle}>
                  NetWorth Ethiopia Mobile
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.versionText}>1.0.0 (SDK 57)</ThemedText>
          </View>
        </View>

        {/* 5. LOGOUT BUTTON */}
        <Pressable
          onPress={handleSignOut}
          disabled={isLoggingOut}
          style={({ pressed }) => [
            styles.signOutBtn,
            pressed && { opacity: 0.8 },
          ]}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#DC2626" size="small" />
          ) : (
            <View style={styles.signOutInner}>
              <LogOutIcon size={18} color="#DC2626" strokeWidth={2.2} />
              <ThemedText style={styles.signOutText}>
                Sign Out of NetWorth
              </ThemedText>
            </View>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
    gap: 12,
  },

  /* Base Cards */
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  /* 1. Hero User Profile Card */
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#065F46', // Ethiopian Emerald
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#ECFDF5',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  heroInfo: {
    flex: 1,
    gap: 3,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroName: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroEmail: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
  },
  heroEntityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  heroEntityText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },

  /* 2. Business & Branches Card */
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardSectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cardSectionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 0.5,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  editBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#065F46',
  },

  /* Entity Overview Box */
  entityBox: {
    padding: 12,
    borderRadius: 14,
    gap: 6,
    marginBottom: 12,
  },
  entityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entityName: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    backgroundColor: '#ECFDF5',
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  entityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entityMetaLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
  },
  entityMetaValue: {
    fontWeight: '700',
  },
  entityMetaDivider: {
    fontSize: 10,
    color: '#CBD5E1',
  },

  /* Branch Selector Section */
  branchSelectorSection: {
    gap: 8,
  },
  branchSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  branchLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  branchSelectorTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  branchSelectorActiveName: {
    fontWeight: '800',
  },
  branchCountLink: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },
  branchChipsContainer: {
    gap: 6,
    paddingVertical: 2,
  },
  branchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  branchChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  branchChipText: {
    fontSize: 12,
  },
  addBranchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  addBranchChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },

  /* 3 & 4. Grouped Menus */
  sectionHeaderLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  menuItemSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    marginVertical: 2,
  },

  /* System Indicators */
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  syncPillOffline: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  syncPillPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  syncDotOffline: {
    backgroundColor: '#94A3B8',
  },
  syncDotPending: {
    backgroundColor: '#D97706',
  },
  syncPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  syncPillTextOffline: {
    color: '#64748B',
  },
  syncPillTextPending: {
    color: '#92400E',
  },
  currencyBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  currencyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  versionText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
  },

  /* 5. Sign Out Button */
  signOutBtn: {
    marginTop: 4,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signOutText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#DC2626',
  },
});
