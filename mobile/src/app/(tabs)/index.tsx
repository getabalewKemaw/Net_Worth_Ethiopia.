import React from 'react';
import { ScrollView, View, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { HamburgerHeader } from '@/components/navigation/hamburger-drawer';
import { useBusinessStore } from '@/store/business-store';
import { useTheme } from '@/hooks/use-theme';
import {
  SalesTrendAreaChart,
  PaymentChannelDonutChart,
} from '@/components/charts/dashboard-charts';

export default function HomeScreen() {
  const colors = useTheme();

  const branches = useBusinessStore((state) => state.branches);
  const activeBranch = useBusinessStore((state) => state.activeBranch);
  const isPending = useBusinessStore((state) => state.isPending);

  const displayBranches =
    branches.length > 0
      ? branches
      : [
          {
            id: 'b1',
            name: 'Main Branch (Piassa)',
            city: 'Addis Ababa',
            sales: '12,450 ETB',
            debt: '18,200 ETB',
            share: '67%',
            active: true,
          },
          {
            id: 'b2',
            name: 'Bole Flagship Store',
            city: 'Bole, Addis Ababa',
            sales: '6,000 ETB',
            debt: '14,600 ETB',
            share: '33%',
            active: false,
          },
        ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Top Header */}
      <HamburgerHeader activeTabId="dashboard" />

      <ScrollView
        className="flex-1 px-4 py-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {isPending ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#065F46" />
            <ThemedText className="text-xs font-semibold mt-3 text-gray-500">
              Loading operational metrics...
            </ThemedText>
          </View>
        ) : (
          <View className="gap-4">
            {/* 1. HERO REVENUE CARD (Premium Ethiopian Emerald) */}
            <View style={styles.heroCard}>
              {/* Card Top Row */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full bg-brand-light" />
                  <ThemedText className="text-brand-light text-[12px] font-bold uppercase tracking-wider">
                    Today&apos;s Total Revenue
                  </ThemedText>
                </View>

                <View style={styles.growthBadge}>
                  <ThemedText className="text-brand-light text-[11px] font-black">
                    ↑ +12.5%
                  </ThemedText>
                </View>
              </View>

              {/* Main Balance Display */}
              <View className="flex-row items-baseline gap-2 my-1">
                <ThemedText className="text-white text-[34px] font-black tracking-tight">
                  18,450.00
                </ThemedText>
                <ThemedText className="text-brand-light text-[16px] font-extrabold">
                  ETB
                </ThemedText>
              </View>

              {/* Card Bottom Stats Grid */}
              <View style={styles.heroStatsDivider}>
                <View className="flex-1 pr-3 border-r border-white/10">
                  <ThemedText className="text-white/60 text-[11px] font-medium mb-0.5">
                    Estimated Profit
                  </ThemedText>
                  <ThemedText className="text-white text-[15px] font-black">
                    6,250 ETB{' '}
                    <ThemedText className="text-brand-light text-[11px] font-bold">
                      (33%)
                    </ThemedText>
                  </ThemedText>
                </View>

                <View className="flex-1 pl-3">
                  <ThemedText className="text-white/60 text-[11px] font-medium mb-0.5">
                    Customer Credit (Bidr)
                  </ThemedText>
                  <ThemedText className="text-[#FCD34D] text-[15px] font-black">
                    32,800 ETB
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* 2. UNIFIED QUICK ACTIONS (Clean 3-Action Row) */}
            <View className="flex-row gap-3">
              {/* Record Sale */}
              <Pressable
                style={[styles.actionButton, styles.saleAction]}
                onPress={() => router.push('/sales' as any)}
              >
                <View style={[styles.actionIconBadge, { backgroundColor: '#ECFDF5' }]}>
                  <ThemedText style={{ fontSize: 16 }}>🛒</ThemedText>
                </View>
                <ThemedText style={[styles.actionTitle, { color: '#065F46' }]}>
                  + New Sale
                </ThemedText>
              </Pressable>

              {/* Record Bidr */}
              <Pressable
                style={[styles.actionButton, styles.bidrAction]}
                onPress={() => router.push('/bidr' as any)}
              >
                <View style={[styles.actionIconBadge, { backgroundColor: '#FFFBEB' }]}>
                  <ThemedText style={{ fontSize: 16 }}>📜</ThemedText>
                </View>
                <ThemedText style={[styles.actionTitle, { color: '#92400E' }]}>
                  + Add Bidr
                </ThemedText>
              </Pressable>

              {/* Branches */}
              <Pressable
                style={[styles.actionButton, styles.branchesAction]}
                onPress={() => router.push('/(business)/branches')}
              >
                <View style={[styles.actionIconBadge, { backgroundColor: '#EFF6FF' }]}>
                  <ThemedText style={{ fontSize: 16 }}>🏬</ThemedText>
                </View>
                <ThemedText style={[styles.actionTitle, { color: '#1E40AF' }]}>
                  Branches
                </ThemedText>
              </Pressable>
            </View>

            {/* 3. WEEKLY SALES PERFORMANCE CHART */}
            <View style={styles.cleanCard}>
              <View className="flex-row items-center justify-between mb-1">
                <View>
                  <ThemedText className="text-[16px] font-black text-gray-900">
                    Weekly Sales Velocity
                  </ThemedText>
                  <ThemedText className="text-[12px] font-medium text-gray-500">
                    Daily revenue breakdown for the past 7 days
                  </ThemedText>
                </View>

                <View className="px-2.5 py-1 rounded-full bg-gray-100">
                  <ThemedText className="text-[11px] font-bold text-gray-600">
                    This Week
                  </ThemedText>
                </View>
              </View>

              {/* Bar Chart Component */}
              <SalesTrendAreaChart />
            </View>

            {/* 4. PAYMENT SETTLEMENT CHANNELS */}
            <View style={styles.cleanCard}>
              <View className="flex-row items-center justify-between mb-2">
                <View>
                  <ThemedText className="text-[16px] font-black text-gray-900">
                    Payment Channels
                  </ThemedText>
                  <ThemedText className="text-[12px] font-medium text-gray-500">
                    Settlement share for today&apos;s sales
                  </ThemedText>
                </View>

                <View className="px-2 py-0.5 rounded-full bg-brand-soft border border-brand-light">
                  <ThemedText className="text-[10px] font-extrabold text-brand-dark">
                    RECONCILED
                  </ThemedText>
                </View>
              </View>

              <PaymentChannelDonutChart />
            </View>

            {/* 5. MULTI-BRANCH STATUS */}
            <View style={styles.cleanCard}>
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <ThemedText className="text-[16px] font-black text-gray-900">
                    Operating Branches
                  </ThemedText>
                  <ThemedText className="text-[12px] font-medium text-gray-500">
                    Active locations ({displayBranches.length})
                  </ThemedText>
                </View>

                <Pressable
                  onPress={() => router.push('/(business)/branches')}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 active:opacity-70"
                >
                  <ThemedText className="text-[11px] font-bold text-gray-700">
                    Manage →
                  </ThemedText>
                </Pressable>
              </View>

              <View className="gap-2.5">
                {displayBranches.map((br: any, idx: number) => {
                  const isCurrent = activeBranch?.id === br.id || br.active;
                  return (
                    <View
                      key={br.id || idx}
                      style={[
                        styles.branchRow,
                        isCurrent && styles.branchRowActive,
                      ]}
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          style={[
                            styles.branchAvatar,
                            { backgroundColor: isCurrent ? '#065F46' : '#94A3B8' },
                          ]}
                        >
                          <ThemedText className="text-white text-[11px] font-black">
                            {idx + 1}
                          </ThemedText>
                        </View>
                        <View>
                          <ThemedText className="text-[13px] font-bold text-gray-900">
                            {br.name}
                          </ThemedText>
                          <ThemedText className="text-[11px] text-gray-500">
                            {br.city || 'Addis Ababa'} · Share: {br.share || '50%'}
                          </ThemedText>
                        </View>
                      </View>

                      <View className="items-end">
                        <ThemedText className="text-[13px] font-black text-gray-900">
                          {br.sales || '12,450 ETB'}
                        </ThemedText>
                        <ThemedText className="text-[10px] font-semibold text-brand-dark">
                          {isCurrent ? '● Active Branch' : 'Online'}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 6. RECENT ACTIVITY FEED */}
            <View style={styles.cleanCard}>
              <View className="flex-row items-center justify-between mb-3">
                <ThemedText className="text-[16px] font-black text-gray-900">
                  Recent Activities
                </ThemedText>
                <Pressable onPress={() => router.push('/sales' as any)}>
                  <ThemedText className="text-[11px] font-bold text-brand">
                    View all
                  </ThemedText>
                </Pressable>
              </View>

              <View className="gap-2">
                {/* Activity 1 */}
                <View style={styles.activityRow}>
                  <View className="flex-row items-center gap-3">
                    <View style={[styles.activityIconBadge, { backgroundColor: '#ECFDF5' }]}>
                      <ThemedText style={{ fontSize: 14 }}>💵</ThemedText>
                    </View>
                    <View>
                      <ThemedText className="text-[13px] font-bold text-gray-900">
                        Counter Cash Sale
                      </ThemedText>
                      <ThemedText className="text-[11px] text-gray-500">
                        Main Branch · 12:45 PM
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[13px] font-black text-brand-dark">
                    +850.00 ETB
                  </ThemedText>
                </View>

                {/* Activity 2 */}
                <View style={styles.activityRow}>
                  <View className="flex-row items-center gap-3">
                    <View style={[styles.activityIconBadge, { backgroundColor: '#EFF6FF' }]}>
                      <ThemedText style={{ fontSize: 14 }}>📱</ThemedText>
                    </View>
                    <View>
                      <ThemedText className="text-[13px] font-bold text-gray-900">
                        Telebirr QR Payment
                      </ThemedText>
                      <ThemedText className="text-[11px] text-gray-500">
                        Main Branch · 11:30 AM
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[13px] font-black text-[#0284C7]">
                    +500.00 ETB
                  </ThemedText>
                </View>

                {/* Activity 3 */}
                <View style={styles.activityRow}>
                  <View className="flex-row items-center gap-3">
                    <View style={[styles.activityIconBadge, { backgroundColor: '#FFFBEB' }]}>
                      <ThemedText style={{ fontSize: 14 }}>📜</ThemedText>
                    </View>
                    <View>
                      <ThemedText className="text-[13px] font-bold text-gray-900">
                        New Bidr — Kebede M.
                      </ThemedText>
                      <ThemedText className="text-[11px] text-gray-500">
                        14-Day Term · 10:15 AM
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[13px] font-black text-[#D97706]">
                    1,200.00 ETB
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#064E3B', // Rich, deep Ethiopian Forest Emerald
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#065F46',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  growthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroStatsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Action Buttons
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
  saleAction: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  bidrAction: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  branchesAction: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  actionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Clean Cards
  cleanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  // Branch Rows
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  branchRowActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  branchAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Activity Rows
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  activityIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
