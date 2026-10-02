import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useBusinessStore } from '@/store/business-store';
import { authClient } from '@/lib/auth-client';
import { SyncStatusBadge } from '@/components/common/sync-status-badge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(330, SCREEN_WIDTH * 0.82);

export interface TabCategory {
  title: string;
  items: {
    id: string;
    label: string;
    icon: string;
    route: string;
    badge?: string;
  }[];
}

export const MERCHANT_TAB_CATEGORIES: TabCategory[] = [
  {
    title: 'Main Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠', route: '/' },
      { id: 'sales', label: 'Sales & Orders', icon: '🛒', route: '/sales' },
      { id: 'bidr', label: 'Bidr (Customer Debt)', icon: '📜', route: '/bidr', badge: 'Credit' },
      { id: 'expenses', label: 'Expenses', icon: '💸', route: '/expenses' },
    ],
  },
  {
    title: 'Business & Branches',
    items: [
      { id: 'branches', label: 'Branch Locations', icon: '🏬', route: '/(business)/branches' },
      { id: 'business-profile', label: 'Business Profile', icon: '🏢', route: '/(business)/business-profile' },
      { id: 'staff', label: 'Staff & Roles', icon: '👥', route: '/staff' },
    ],
  },
  {
    title: 'Financial Intelligence',
    items: [
      { id: 'health', label: 'Business Health', icon: '⭐️', route: '/health' },
      { id: 'financial', label: 'Financial Profile', icon: '🏦', route: '/financial-profile' },
      { id: 'sync', label: 'Offline Sync Queue', icon: '⚡', route: '/sync', badge: 'Live' },
    ],
  },
  {
    title: 'System & Account',
    items: [
      { id: 'profile', label: 'Merchant Profile', icon: '👤', route: '/profile' },
      { id: 'privacy', label: 'Privacy & Terms', icon: '🔒', route: '/privacy' },
    ],
  },
];

export interface HamburgerDrawerProps {
  activeTabId?: string;
}

export function HamburgerHeader({ activeTabId = 'dashboard' }: HamburgerDrawerProps) {
  const colors = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: session } = authClient.useSession();
  const user = session?.user;
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const activeBranch = useBusinessStore((state) => state.activeBranch);

  const displayName = user?.name || activeBusiness?.name || 'Merchant Owner';
  const displayEmail = user?.email || 'merchant@networth.et';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'NW';

  const openDrawer = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
      callback?.();
    });
  };

  const handleNavigate = (route: string) => {
    closeDrawer(() => {
      if (route === '/' && pathname === '/') return;
      router.push(route as any);
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of NetWorth Ethiopia?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            closeDrawer(async () => {
              try {
                await authClient.signOut();
                router.replace('/(auth)/login');
              } catch (error) {
                console.error('Failed to sign out:', error);
              }
            });
          },
        },
      ]
    );
  };

  return (
    <>
      {/* Persistent Top Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: '#FFFFFF',
            borderBottomColor: '#F1F5F9',
          },
        ]}
      >
        <View className="flex-row items-center gap-3">
          {/* Hamburger Menu Trigger Button */}
          <Pressable
            onPress={openDrawer}
            style={styles.hamburgerBtn}
            accessibilityLabel="Open navigation menu"
            accessibilityRole="button"
            android_ripple={{ color: 'rgba(6, 95, 70, 0.15)', borderless: false }}
          >
            <View style={styles.hamburgerLinesContainer}>
              <View style={[styles.hamburgerLine, { width: 18, backgroundColor: '#0F172A' }]} />
              <View style={[styles.hamburgerLine, { width: 13, backgroundColor: '#065F46' }]} />
              <View style={[styles.hamburgerLine, { width: 18, backgroundColor: '#0F172A' }]} />
            </View>
          </Pressable>

          <View className="gap-0.5">
            <ThemedText className="text-[15px] font-black tracking-tight" style={{ color: '#0F172A' }}>
              {activeBusiness?.name || 'NetWorth Ethiopia'}
            </ThemedText>
            <View className="flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <ThemedText className="text-[11px] font-medium text-slate-500">
                {activeBranch?.name || 'Main Branch'}
              </ThemedText>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {/* Dynamic Offline / Online / Syncing Status Badge */}
          <SyncStatusBadge />
        </View>
      </View>

      {/* Left-Aligned Slide-out Navigation Drawer Modal */}
      <Modal
        visible={isOpen}
        animationType="none"
        transparent={true}
        onRequestClose={() => closeDrawer()}
      >
        <View style={styles.modalRoot}>
          {/* Semi-transparent Backdrop Overlay */}
          <Animated.View
            style={[
              styles.backdropOverlay,
              { opacity: fadeAnim },
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => closeDrawer()} />
          </Animated.View>

          {/* Left-Sided Drawer Container */}
          <Animated.View
            style={[
              styles.drawerWrapper,
              {
                width: DRAWER_WIDTH,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <SafeAreaView style={styles.drawerInner}>
              {/* Drawer Top Branding Header */}
              <View style={styles.drawerHeader}>
                <View className="flex-row items-center gap-3">
                  <View style={styles.brandIconBox}>
                    <ThemedText style={styles.brandIconText}>NW</ThemedText>
                  </View>
                  <View>
                    <View className="flex-row items-center gap-1.5">
                      <ThemedText className="text-[17px] font-black text-slate-900 tracking-tight">
                        NetWorth
                      </ThemedText>
                      <View style={styles.etPill}>
                        <ThemedText style={styles.etPillText}>ET</ThemedText>
                      </View>
                    </View>
                    <ThemedText className="text-[11px] font-semibold text-slate-400">
                      Merchant Operations
                    </ThemedText>
                  </View>
                </View>

                <Pressable
                  onPress={() => closeDrawer()}
                  style={styles.closeBtn}
                  accessibilityLabel="Close menu"
                  hitSlop={8}
                >
                  <ThemedText style={styles.closeBtnIcon}>✕</ThemedText>
                </Pressable>
              </View>

              {/* Operating Branch Context Card */}
              <View style={styles.branchContextCard}>
                <View style={styles.branchContextLeft}>
                  <View className="flex-row items-center gap-1.5 mb-0.5">
                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <ThemedText className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800">
                      Active Branch
                    </ThemedText>
                  </View>
                  <ThemedText className="text-[13px] font-bold text-slate-900" numberOfLines={1}>
                    {activeBranch?.name || 'Main Branch'}
                  </ThemedText>
                  {activeBranch?.branchCode ? (
                    <ThemedText className="text-[10px] font-mono text-slate-500">
                      {activeBranch.branchCode}
                    </ThemedText>
                  ) : null}
                </View>

                <Pressable
                  style={styles.switchBranchBtn}
                  onPress={() => handleNavigate('/(business)/branches')}
                  android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <ThemedText style={styles.switchBranchText}>Switch</ThemedText>
                </Pressable>
              </View>

              {/* Navigation Menu Links */}
              <ScrollView
                className="flex-1 px-3 py-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                {MERCHANT_TAB_CATEGORIES.map((category, catIndex) => (
                  <View key={catIndex} className="mb-4">
                    <ThemedText className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 pl-3 text-slate-400">
                      {category.title}
                    </ThemedText>

                    <View className="gap-0.5">
                      {category.items.map((item) => {
                        const isActive = pathname === item.route;
                        return (
                          <Pressable
                            key={item.id}
                            onPress={() => handleNavigate(item.route)}
                            style={[
                              styles.navItem,
                              isActive && styles.navItemActive,
                            ]}
                            android_ripple={{ color: 'rgba(6, 95, 70, 0.08)' }}
                          >
                            <View className="flex-row items-center gap-3 flex-1 pr-2">
                              <View style={[styles.navItemIconBox, isActive && styles.navItemIconBoxActive]}>
                                <ThemedText style={{ fontSize: 16 }}>{item.icon}</ThemedText>
                              </View>
                              <ThemedText
                                className={`text-[13.5px] ${isActive ? 'font-bold text-emerald-900' : 'font-semibold text-slate-700'}`}
                                numberOfLines={1}
                              >
                                {item.label}
                              </ThemedText>
                            </View>

                            <View className="flex-row items-center gap-1.5">
                              {item.badge ? (
                                <View style={[styles.badgePill, isActive && styles.badgePillActive]}>
                                  <ThemedText style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                                    {item.badge}
                                  </ThemedText>
                                </View>
                              ) : null}
                              {isActive ? (
                                <View style={styles.activeDot} />
                              ) : null}
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Drawer Footer with Merchant User Profile & Sign Out */}
              <View style={styles.drawerFooter}>
                <View style={styles.userProfileRow}>
                  {user?.image ? (
                    <Image source={{ uri: user.image }} style={styles.userAvatar} />
                  ) : (
                    <View style={styles.userAvatarFallback}>
                      <ThemedText style={styles.userAvatarInitials}>{initials}</ThemedText>
                    </View>
                  )}
                  <View className="flex-1 pr-2">
                    <ThemedText className="text-[13px] font-bold text-slate-900" numberOfLines={1}>
                      {displayName}
                    </ThemedText>
                    <ThemedText className="text-[11px] font-medium text-slate-500" numberOfLines={1}>
                      {displayEmail}
                    </ThemedText>
                  </View>
                </View>

                <Pressable
                  onPress={handleLogout}
                  style={styles.signOutBtn}
                  android_ripple={{ color: 'rgba(239, 68, 68, 0.15)' }}
                >
                  <ThemedText style={styles.signOutBtnIcon}>🚪</ThemedText>
                  <ThemedText style={styles.signOutBtnText}>Sign Out</ThemedText>
                </Pressable>

                <ThemedText style={styles.versionLabel}>
                  NetWorth Ethiopia • v1.0.0
                </ThemedText>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    zIndex: 10,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  hamburgerLinesContainer: {
    width: 18,
    height: 12,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    height: 2,
    borderRadius: 1.5,
  },
  onlineBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawerWrapper: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 5, height: 0 },
        shadowOpacity: 0.22,
        shadowRadius: 15,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  drawerInner: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#065F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: -0.5,
  },
  etPill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  etPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnIcon: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  branchContextCard: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  branchContextLeft: {
    flex: 1,
    paddingRight: 8,
  },
  switchBranchBtn: {
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 7,
    backgroundColor: '#065F46',
  },
  switchBranchText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginVertical: 1,
  },
  navItemActive: {
    backgroundColor: '#ECFDF5',
  },
  navItemIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemIconBoxActive: {
    backgroundColor: '#D1FAE5',
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  badgePillActive: {
    backgroundColor: '#A7F3D0',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  badgeTextActive: {
    color: '#065F46',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#065F46',
  },
  drawerFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
  },
  userAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutBtnIcon: {
    fontSize: 14,
  },
  signOutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  versionLabel: {
    fontSize: 10,
    textAlign: 'center',
    color: '#94A3B8',
    fontWeight: '500',
  },
});
