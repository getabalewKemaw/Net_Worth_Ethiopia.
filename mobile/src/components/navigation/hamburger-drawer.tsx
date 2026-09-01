import React, { useState } from 'react';
import {
  View,
  Pressable,
  Modal,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
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
    title: 'System & Storage',
    items: [
      { id: 'sync', label: 'Offline Sync Queue', icon: '⚡', route: '/sync' },
      { id: 'settings', label: 'Settings', icon: '⚙️', route: '/(business)/business-profile' },
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
        className="w-full px-4 py-3 flex-row items-center justify-between border-b"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.backgroundElement,
          zIndex: 10,
        }}
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => setIsOpen(true)}
            className="w-10 h-10 rounded-xl items-center justify-center active:opacity-70"
            style={{ backgroundColor: colors.backgroundElement }}
          >
            <ThemedText className="text-[20px] font-bold">☰</ThemedText>
          </Pressable>

          <View>
            <ThemedText className="text-[17px] font-bold" style={{ color: colors.text }}>
              {activeBusiness?.name || 'NetWorth Ethiopia'}
            </ThemedText>
            <ThemedText className="text-[12px]" style={{ color: colors.textSecondary }}>
              {activeBranch?.name || 'Main Branch'}
            </ThemedText>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="px-2.5 py-1 rounded-full flex-row items-center gap-1.5" style={{ backgroundColor: 'rgba(46, 125, 50, 0.12)' }}>
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2E7D32' }} />
            <ThemedText className="text-[12px] font-semibold" style={{ color: '#2E7D32' }}>Online</ThemedText>
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
              { backgroundColor: colors.background },
            ]}
          >
            {/* Drawer Header */}
            <View className="p-5 border-b flex-row items-center justify-between" style={{ borderColor: colors.backgroundElement }}>
              <View className="gap-0.5">
                <ThemedText className="text-[18px] font-extrabold" style={{ color: colors.primary }}>
                  NetWorth Ethiopia
                </ThemedText>
                <ThemedText className="text-[13px]" style={{ color: colors.textSecondary }}>
                  {activeBusiness?.name || 'Merchant Operations'}
                </ThemedText>
              </View>

              <Pressable
                onPress={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full items-center justify-center active:opacity-70"
                style={{ backgroundColor: colors.backgroundElement }}
              >
                <ThemedText className="text-[16px] font-bold">✕</ThemedText>
              </Pressable>
            </View>

            {/* Branch Badge Summary */}
            <View className="mx-4 my-3 p-3 rounded-xl flex-row items-center justify-between" style={{ backgroundColor: colors.backgroundElement }}>
              <View className="gap-0.5">
                <ThemedText className="text-[11px] uppercase font-bold text-[#60646C]">Operating Branch</ThemedText>
                <ThemedText className="text-[14px] font-bold" style={{ color: colors.text }}>
                  {activeBranch?.name || 'No Branch Selected'}
                </ThemedText>
              </View>
              <Pressable
                className="px-3 py-1.5 rounded-lg active:opacity-80"
                style={{ backgroundColor: colors.primary }}
                onPress={() => handleNavigate('/(business)/branches')}
              >
                <ThemedText className="text-white text-[12px] font-semibold">Switch</ThemedText>
              </Pressable>
            </View>

            {/* Categorized Tab Navigation List */}
            <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
              {MERCHANT_TAB_CATEGORIES.map((category, catIndex) => (
                <View key={catIndex} className="mb-5">
                  <ThemedText className="text-[11px] font-bold uppercase tracking-wider mb-2 pl-2" style={{ color: colors.textSecondary }}>
                    {category.title}
                  </ThemedText>

                  <View className="gap-1">
                    {category.items.map((item) => {
                      const isActive = pathname === item.route;
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => handleNavigate(item.route)}
                          className="flex-row items-center justify-between px-3.5 py-3 rounded-xl active:opacity-70"
                          style={{
                            backgroundColor: isActive ? colors.backgroundSelected : 'transparent',
                          }}
                        >
                          <View className="flex-row items-center gap-3">
                            <ThemedText className="text-[18px]">{item.icon}</ThemedText>
                            <ThemedText
                              className={`text-[15px] ${isActive ? 'font-bold' : 'font-medium'}`}
                              style={{ color: isActive ? colors.primary : colors.text }}
                            >
                              {item.label}
                            </ThemedText>
                          </View>
                          {isActive && (
                            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Drawer Footer / Logout */}
            <View className="p-4 border-t" style={{ borderColor: colors.backgroundElement }}>
              <Pressable
                onPress={handleLogout}
                className="flex-row items-center justify-center gap-2 py-3 rounded-xl active:opacity-80"
                style={{ backgroundColor: '#111827' }}
              >
                <ThemedText className="text-white text-[15px] font-semibold">Log out</ThemedText>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    flex: 1,
  },
  drawerContainer: {
    width: Platform.OS === 'web' ? 340 : '80%',
    maxWidth: 360,
    height: '100%',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
});
