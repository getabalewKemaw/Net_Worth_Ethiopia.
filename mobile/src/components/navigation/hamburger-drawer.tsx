import React, { useState } from 'react';
import {
  View,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';


import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useBusinessStore } from '@/store/business-store';
import { authClient } from '@/lib/auth-client';

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
      { id: 'sales', label: 'Sales', icon: '🛒', route: '/sales' },
      { id: 'bidr', label: 'Bidr (Debt)', icon: '📜', route: '/bidr' },
      { id: 'expenses', label: 'Expenses', icon: '💸', route: '/expenses' },
    ],
  },
  {
    title: 'Operations & Staff',
    items: [
      { id: 'branches', label: 'Branches', icon: '🏬', route: '/(business)/branches' },
      { id: 'staff', label: 'Staff & Roles', icon: '👥', route: '/staff' },
    ],
  },
  {
    title: 'Financial Intelligence & Privacy',
    items: [
      { id: 'health', label: 'Business Health', icon: '⭐️', route: '/health' },
      { id: 'financial', label: 'Financial Profile', icon: '🏦', route: '/financial-profile' },
      { id: 'privacy', label: 'Privacy & Rights', icon: '🔒', route: '/privacy' },
    ],
  },
  {
    title: 'System & Profile',
    items: [
      { id: 'sync', label: 'Offline Sync Queue', icon: '⚡', route: '/sync' },
      { id: 'profile', label: 'Merchant Profile', icon: '👤', route: '/profile' },
      { id: 'settings', label: 'Business Settings', icon: '⚙️', route: '/(business)/business-profile' },
    ],
  },
];

interface HamburgerDrawerProps {
  activeTabId?: string;
}

export function HamburgerHeader({ activeTabId = 'dashboard' }: HamburgerDrawerProps) {
  const colors = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const activeBranch = useBusinessStore((state) => state.activeBranch);

  const handleNavigate = (route: string) => {
    setIsOpen(false);
    if (route === '/' && pathname === '/') return;
    router.push(route as any);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await authClient.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <>
      {/* Persistent Top Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: '#FFFFFF',
            borderBottomColor: '#F3F4F6',
          },
        ]}
      >
        <View className="flex-row items-center gap-3">
          {/* Sleek Custom Styled Hamburger Button */}
          <Pressable
            onPress={() => setIsOpen(true)}
            style={styles.hamburgerBtn}
            android_ripple={{ color: 'rgba(16, 185, 129, 0.15)', borderless: false }}
          >
            <View style={{ width: 18, height: 13, justifyContent: 'space-between' }}>
              <View style={{ width: 18, height: 2.2, borderRadius: 1.5, backgroundColor: '#1F2937' }} />
              <View style={{ width: 12, height: 2.2, borderRadius: 1.5, backgroundColor: '#10B981' }} />
              <View style={{ width: 18, height: 2.2, borderRadius: 1.5, backgroundColor: '#1F2937' }} />
            </View>
          </Pressable>

          <View className="gap-0.5">
            <ThemedText className="text-[16px] font-extrabold tracking-tight" style={{ color: colors.text }}>
              {activeBusiness?.name || 'NetWorth Ethiopia'}
            </ThemedText>
            <View className="flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <ThemedText className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>
                {activeBranch?.name || 'Main Branch'}
              </ThemedText>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {/* Subtle Online Status Chip */}
          <View
            style={styles.onlineBadge}
          >
            <View className="w-2 h-2 rounded-full bg-[#10B981]" />
            <ThemedText className="text-[11px] font-bold text-[#065F46]">
              Online
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Slide-out Navigation Drawer Modal */}
      <Modal
        visible={isOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          {/* Backdrop overlay touchable */}
          <Pressable style={styles.backdropPressable} onPress={() => setIsOpen(false)} />

          {/* Drawer Container */}
          <SafeAreaView
            style={[
              styles.drawerContainer,
              { backgroundColor: '#FFFFFF' },
            ]}
          >
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View className="gap-0.5">
                <ThemedText className="text-[18px] font-black text-[#10B981]">
                  NetWorth Ethiopia
                </ThemedText>
                <ThemedText className="text-[12px] font-medium text-gray-500">
                  {activeBusiness?.name || 'Merchant Operations'}
                </ThemedText>
              </View>

              <Pressable
                onPress={() => setIsOpen(false)}
                style={styles.closeBtn}
              >
                <ThemedText style={{ fontSize: 16, fontWeight: '700', color: '#4B5563' }}>✕</ThemedText>
              </Pressable>
            </View>

            {/* Operating Branch Card */}
            <View style={styles.branchSummaryCard}>
              <View className="gap-0.5 flex-1 pr-2">
                <ThemedText className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800">
                  Current Branch
                </ThemedText>
                <ThemedText className="text-[14px] font-bold text-gray-900" numberOfLines={1}>
                  {activeBranch?.name || 'No Branch Selected'}
                </ThemedText>
              </View>
              <Pressable
                style={styles.switchBranchBtn}
                onPress={() => handleNavigate('/(business)/branches')}
              >
                <ThemedText className="text-white text-[11px] font-bold">Switch</ThemedText>
              </Pressable>
            </View>

            {/* Categorized Tab Navigation List */}
            <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
              {MERCHANT_TAB_CATEGORIES.map((category, catIndex) => (
                <View key={catIndex} className="mb-4">
                  <ThemedText className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 pl-2 text-gray-400">
                    {category.title}
                  </ThemedText>

                  <View className="gap-1">
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
                        >
                          <View className="flex-row items-center gap-3">
                            <ThemedText className="text-[17px]">{item.icon}</ThemedText>
                            <ThemedText
                              className={`text-[14px] ${isActive ? 'font-bold text-[#10B981]' : 'font-medium text-gray-700'}`}
                            >
                              {item.label}
                            </ThemedText>
                          </View>
                          {isActive && (
                            <View className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Drawer Footer / Logout */}
            <View style={styles.drawerFooter}>
              <Pressable
                onPress={handleLogout}
                style={styles.logoutBtn}
              >
                <ThemedText className="text-white text-[14px] font-bold">Sign Out</ThemedText>
              </Pressable>
            </View>
          </SafeAreaView>
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
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  onlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  modalBackdrop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdropPressable: {
    flex: 1,
  },
  drawerContainer: {
    width: Platform.OS === 'web' ? 340 : '80%',
    maxWidth: 360,
    height: '100%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  drawerHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchSummaryCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchBranchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  logoutBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EF4444',
  },
});
