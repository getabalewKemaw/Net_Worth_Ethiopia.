import React from 'react';
import { ScrollView, View, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { HamburgerHeader } from '@/components/navigation/hamburger-drawer';
import { useBusinessStore } from '@/store/business-store';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const colors = useTheme();

  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const branches = useBusinessStore((state) => state.branches);
  const activeBranch = useBusinessStore((state) => state.activeBranch);
  const switchBranch = useBusinessStore((state) => state.switchBranch);
  const isPending = useBusinessStore((state) => state.isPending);

  // Demo branches fallback for visual rich preview
  const displayBranches = branches.length > 0 ? branches : [
    {
      id: 'b1',
      name: 'Main Branch (Piassa)',
      city: 'Addis Ababa',
      branchCode: 'BR-001',
      salesNum: 12450,
      sales: '12,450 ETB',
      debt: '18,200 ETB',
      share: '67%',
      active: true,
    },
    {
      id: 'b2',
      name: 'Bole Flagship Store',
      city: 'Bole, Addis Ababa',
      branchCode: 'BR-002',
      salesNum: 6000,
      sales: '6,000 ETB',
      debt: '14,600 ETB',
      share: '33%',
      active: false,
    },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Top Navigation Bar with Hamburger Drawer Menu */}
      <HamburgerHeader activeTabId="dashboard" />

      <ScrollView className="flex-1 px-4 py-3" showsVerticalScrollIndicator={false}>
        {isPending ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText className="text-xs font-semibold mt-3" style={{ color: colors.textSecondary }}>
              Loading operational metrics...
            </ThemedText>
          </View>
        ) : (
          <View className="gap-5 pb-10">
            {/* 1. HERO BANNER CARD (Forest Emerald Gradient Theme) */}
            <View style={styles.heroCard} className="p-5 rounded-3xl gap-4 shadow-md overflow-hidden relative">
              <View className="flex-row items-center justify-between z-10">
                <View className="gap-1">
                  <View className="flex-row items-center gap-2">
                    <View className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <ThemedText className="text-white text-[11px] font-bold uppercase tracking-wider opacity-90">
                      {activeBusiness?.name || 'NetWorth Ethiopia'} · Verified
                    </ThemedText>
                  </View>
                  <ThemedText className="text-white text-[24px] font-black tracking-tight">
                    Selam, Merchant 👋
                  </ThemedText>
                </View>

                <Pressable
                  className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md flex-row items-center gap-1.5 active:opacity-70"
                  onPress={() => router.push('/(business)/branches')}
                >
                  <ThemedText className="text-white text-[12px] font-semibold">
                    📍 {activeBranch?.name || 'Main Branch'}
                  </ThemedText>
                  <ThemedText className="text-white/80 text-[10px]">▼</ThemedText>
                </Pressable>
              </View>

              {/* Total Daily Sales Hero Metric */}
              <View className="pt-2 border-t border-white/15 flex-row items-center justify-between z-10">
                <View>
                  <ThemedText className="text-white/70 text-[11px] uppercase font-bold tracking-wider">
                    Total Consolidated Revenue Today
                  </ThemedText>
                  <ThemedText className="text-white text-[28px] font-black tracking-tight mt-0.5">
                    18,450.00 <ThemedText className="text-white/80 text-[16px] font-semibold">ETB</ThemedText>
                  </ThemedText>
                </View>

                <View className="px-3 py-1.5 rounded-xl bg-[#10B981]/25 border border-[#10B981]/40 items-end">
                  <ThemedText className="text-[#A7F3D0] text-[12px] font-extrabold">↑ +12.5%</ThemedText>
                  <ThemedText className="text-white/80 text-[10px]">vs. yesterday</ThemedText>
                </View>
              </View>
            </View>

            {/* 2. QUICK ACTION BUTTONS BAR */}
            <View className="gap-2">
              <ThemedText className="text-[12px] font-extrabold uppercase tracking-wider pl-1" style={{ color: colors.textSecondary }}>
                Quick Actions
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2.5">
                <Pressable
                  className="px-4 py-3 rounded-2xl flex-row items-center gap-2.5 active:opacity-85 shadow-sm"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => router.push('/sales' as any)}
                >
                  <View className="w-7 h-7 rounded-xl bg-white/20 items-center justify-center">
                    <ThemedText className="text-white text-[15px]">⚡</ThemedText>
                  </View>
                  <ThemedText className="text-white font-bold text-[14px]">+ 2-Tap Sale</ThemedText>
                </Pressable>

                <Pressable
                  className="px-4 py-3 rounded-2xl flex-row items-center gap-2.5 border active:opacity-85"
                  style={{ backgroundColor: colors.backgroundElement, borderColor: 'rgba(0,0,0,0.06)' }}
                  onPress={() => router.push('/bidr' as any)}
                >
                  <View className="w-7 h-7 rounded-xl bg-[#D97706]/15 items-center justify-center">
                    <ThemedText className="text-[15px]">📜</ThemedText>
                  </View>
                  <ThemedText className="font-bold text-[14px]" style={{ color: colors.text }}>+ Add Bidr (Debt)</ThemedText>
                </Pressable>

                <Pressable
                  className="px-4 py-3 rounded-2xl flex-row items-center gap-2.5 border active:opacity-85"
                  style={{ backgroundColor: colors.backgroundElement, borderColor: 'rgba(0,0,0,0.06)' }}
                  onPress={() => router.push('/expenses' as any)}
                >
                  <View className="w-7 h-7 rounded-xl bg-[#EF4444]/15 items-center justify-center">
                    <ThemedText className="text-[15px]">💸</ThemedText>
                  </View>
                  <ThemedText className="font-bold text-[14px]" style={{ color: colors.text }}>+ Outflow Expense</ThemedText>
                </Pressable>
              </ScrollView>
            </View>

            {/* 3. EXECUTIVE KPI CARDS (2x2 GRID) */}
            <View className="gap-2">
              <ThemedText className="text-[12px] font-extrabold uppercase tracking-wider pl-1" style={{ color: colors.textSecondary }}>
                Key Performance Indicators
              </ThemedText>

              <View className="flex-row flex-wrap gap-3">
                {/* KPI 1: Today's Revenue */}
                <View className="flex-1 min-w-[155px] p-4 rounded-2xl gap-2 border" style={{ backgroundColor: colors.backgroundElement, borderColor: 'rgba(0,0,0,0.05)' }}>
                  <View className="flex-row items-center justify-between">
                    <ThemedText className="text-[11px] font-bold uppercase" style={{ color: colors.textSecondary }}>
                      Today's Revenue
                    </ThemedText>
                    <View className="w-7 h-7 rounded-full bg-[#10B981]/15 items-center justify-center">
                      <ThemedText className="text-[12px]">💰</ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[22px] font-black" style={{ color: colors.text }}>
                    18,450 ETB
                  </ThemedText>
                  <View className="flex-row items-center gap-1">
                    <ThemedText className="text-[11px] font-bold text-[#10B981]">↑ 12.5%</ThemedText>
                    <ThemedText className="text-[11px]" style={{ color: colors.textSecondary }}>vs yesterday</ThemedText>
                  </View>
                </View>

                {/* KPI 2: Estimated Net Profit */}
                <View className="flex-1 min-w-[155px] p-4 rounded-2xl gap-2 border" style={{ backgroundColor: colors.backgroundElement, borderColor: 'rgba(0,0,0,0.05)' }}>
                  <View className="flex-row items-center justify-between">
                    <ThemedText className="text-[11px] font-bold uppercase" style={{ color: colors.textSecondary }}>
                      Estimated Profit
                    </ThemedText>
                    <View className="w-7 h-7 rounded-full bg-[#0D9488]/15 items-center justify-center">
                      <ThemedText className="text-[12px]">📈</ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[22px] font-black" style={{ color: colors.text }}>
                    6,250 ETB
                  </ThemedText>
                  <View className="flex-row items-center gap-1">
                    <ThemedText className="text-[11px] font-bold text-[#0D9488]">33.8% Margin</ThemedText>
                  </View>
                </View>

                {/* KPI 3: Outstanding Bidr (Debt) */}
                <View className="flex-1 min-w-[155px] p-4 rounded-2xl gap-2 border" style={{ backgroundColor: colors.backgroundElement, borderColor: 'rgba(0,0,0,0.05)' }}>
                  <View className="flex-row items-center justify-between">
                    <ThemedText className="text-[11px] font-bold uppercase" style={{ color: colors.textSecondary }}>
                      Bidr (Customer Debt)
                    </ThemedText>
                    <View className="w-7 h-7 rounded-full bg-[#D97706]/15 items-center justify-center">
                      <ThemedText className="text-[12px]">📜</ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[22px] font-black text-[#D97706]">
                    32,800 ETB
                  </ThemedText>
                  <ThemedText className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>
                    12 pending customer balances
                  </ThemedText>
                </View>

                {/* KPI 4: Credit Health Rating */}
                <View className="flex-1 min-w-[155px] p-4 rounded-2xl gap-2 border" style={{ backgroundColor: colors.backgroundElement, borderColor: 'rgba(0,0,0,0.05)' }}>
                  <View className="flex-row items-center justify-between">
                    <ThemedText className="text-[11px] font-bold uppercase" style={{ color: colors.textSecondary }}>
                      Health Rating
                    </ThemedText>
                    <View className="w-7 h-7 rounded-full bg-[#10B981]/15 items-center justify-center">
                      <ThemedText className="text-[12px]">⭐️</ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[22px] font-black text-[#10B981]">
                    785 A+
                  </ThemedText>
                  <ThemedText className="text-[11px] font-bold text-[#10B981]">
                    ✓ High Bank Loan Readiness
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* 4. 🏬 BRANCH PERFORMANCE BREAKDOWN */}
            <View className="p-5 rounded-3xl gap-4 border" style={{ backgroundColor: colors.backgroundElement, borderColor: 'rgba(0,0,0,0.06)' }}>
              <View className="flex-row items-center justify-between">
                <View className="gap-0.5">
                  <ThemedText className="text-[17px] font-black" style={{ color: colors.text }}>
                    🏬 Branch Performance Breakdown
                  </ThemedText>
                  <ThemedText className="text-[12px]" style={{ color: colors.textSecondary }}>
                    Multi-location revenue & debt share
                  </ThemedText>
                </View>

                <Pressable
                  className="px-3.5 py-2 rounded-xl active:opacity-80"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => router.push('/(business)/branches')}
                >
                  <ThemedText className="text-white text-[12px] font-bold">Manage Branches</ThemedText>
                </Pressable>
              </View>

              <View className="gap-3">
                {displayBranches.map((br: any, idx: number) => {
                  const isSelected = activeBranch?.id === br.id || br.active;
                  const sharePct = br.share || (idx === 0 ? '67%' : '33%');

                  return (
                    <View
                      key={br.id || idx}
                      className="p-4 rounded-2xl border gap-3"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: isSelected ? colors.primary : 'rgba(0,0,0,0.08)',
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="gap-1 flex-1">
                          <View className="flex-row items-center gap-2">
                            <ThemedText className="text-[15px] font-extrabold" style={{ color: colors.text }}>
                              {br.name}
                            </ThemedText>
                            {isSelected && (
                              <View className="px-2.5 py-0.5 rounded-full bg-[#10B981]/15">
                                <ThemedText className="text-[10px] font-black text-[#10B981]">ACTIVE</ThemedText>
                              </View>
                            )}
                          </View>
                          <ThemedText className="text-[12px]" style={{ color: colors.textSecondary }}>
                            📍 {br.city || 'Addis Ababa'} · Code: <ThemedText className="font-mono">{br.branchCode || `BR-00${idx + 1}`}</ThemedText>
                          </ThemedText>
                        </View>

                        {!isSelected && br.id && (
                          <Pressable
                            className="px-3.5 py-1.5 rounded-xl border active:opacity-80"
                            style={{ borderColor: colors.primary }}
                            onPress={() => switchBranch(br.id)}
                          >
                            <ThemedText className="text-[12px] font-bold" style={{ color: colors.primary }}>
                              Switch
                            </ThemedText>
                          </Pressable>
                        )}
                      </View>

                      {/* Revenue Progress Fill Visualizer */}
                      <View className="gap-1">
                        <View className="flex-row justify-between items-center">
                          <ThemedText className="text-[11px] font-bold text-[#60646C]">Revenue Contribution</ThemedText>
                          <ThemedText className="text-[11px] font-bold" style={{ color: colors.primary }}>{sharePct}</ThemedText>
                        </View>
                        <View className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <View
                            className="h-full rounded-full"
                            style={{ width: sharePct as any, backgroundColor: isSelected ? colors.primary : '#94A3B8' }}
                          />
                        </View>
                      </View>

                      {/* Sales vs Debt Numbers */}
                      <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
                        <View>
                          <ThemedText className="text-[10px] font-extrabold uppercase text-[#60646C]">Today's Sales</ThemedText>
                          <ThemedText className="text-[14px] font-black" style={{ color: colors.text }}>{br.sales}</ThemedText>
                        </View>
                        <View className="items-end">
                          <ThemedText className="text-[10px] font-extrabold uppercase text-[#60646C]">Bidr Balance</ThemedText>
                          <ThemedText className="text-[14px] font-black text-[#D97706]">{br.debt}</ThemedText>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 5. ANALYTICS & WEEKLY SALES TREND VISUALIZER */}
            <View className="p-5 rounded-3xl gap-4 border" style={{ backgroundColor: colors.backgroundElement, borderColor: 'rgba(0,0,0,0.06)' }}>
              <View className="flex-row items-center justify-between">
                <View>
                  <ThemedText className="text-[17px] font-black" style={{ color: colors.text }}>
                    📊 Analytics & Sales Trend
                  </ThemedText>
                  <ThemedText className="text-[12px]" style={{ color: colors.textSecondary }}>
                    7-day revenue performance trajectory
                  </ThemedText>
                </View>
                <View className="px-3 py-1 rounded-xl bg-white/50 border border-gray-200">
                  <ThemedText className="text-[12px] font-bold" style={{ color: colors.text }}>This Week</ThemedText>
                </View>
              </View>

              {/* Weekly Bar Graph Representation */}
              <View className="flex-row items-end justify-between h-[120px] pt-5 px-2">
                {[
                  { day: 'Mon', val: '12k', h: '55%' },
                  { day: 'Tue', val: '14k', h: '68%' },
                  { day: 'Wed', val: '9k', h: '42%' },
                  { day: 'Thu', val: '16k', h: '78%' },
                  { day: 'Fri', val: '19k', h: '92%' },
                  { day: 'Sat', val: '15k', h: '72%' },
                  { day: 'Sun', val: '18.4k', h: '88%', active: true },
                ].map((item, idx) => (
                  <View key={idx} className="items-center gap-2 flex-1">
                    <ThemedText className="text-[10px] font-bold text-[#60646C]">{item.val}</ThemedText>
                    <View
                      className="w-full max-w-[26px] rounded-t-lg shadow-sm"
                      style={{
                        height: item.h as any,
                        backgroundColor: item.active ? colors.primary : 'rgba(0,0,0,0.12)',
                      }}
                    />
                    <ThemedText className={`text-[11px] ${item.active ? 'font-black' : 'font-medium'}`} style={{ color: item.active ? colors.primary : colors.textSecondary }}>
                      {item.day}
                    </ThemedText>
                  </View>
                ))}
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">
                <ThemedText className="text-[13px]" style={{ color: colors.textSecondary }}>
                  Total Weekly Revenue: <ThemedText className="font-black text-[#10B981]">105,350 ETB</ThemedText>
                </ThemedText>
                <Pressable onPress={() => router.push('/(business)/branches')}>
                  <ThemedText className="text-[13px] font-black" style={{ color: colors.primary }}>
                    Full Reports →
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {/* 6. LIVE TRANSACTION ACTIVITY LEDGER */}
            <View className="p-5 rounded-3xl gap-4 border" style={{ backgroundColor: colors.backgroundElement, borderColor: 'rgba(0,0,0,0.06)' }}>
              <View className="flex-row items-center justify-between">
                <ThemedText className="text-[17px] font-black" style={{ color: colors.text }}>
                  ⚡ Live Transaction Feed
                </ThemedText>
                <Pressable onPress={() => router.push('/sales' as any)}>
                  <ThemedText className="text-[12px] font-bold" style={{ color: colors.primary }}>
                    View All
                  </ThemedText>
                </Pressable>
              </View>

              <View className="gap-3">
                {/* Transaction 1 */}
                <View className="flex-row items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-100">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-2xl bg-[#10B981]/15 items-center justify-center">
                      <ThemedText className="text-[18px]">🛒</ThemedText>
                    </View>
                    <View>
                      <ThemedText className="text-[14px] font-black" style={{ color: colors.text }}>
                        Quick Sale — Retail Goods
                      </ThemedText>
                      <ThemedText className="text-[12px]" style={{ color: colors.textSecondary }}>
                        Cash · Main Branch · 10:42 AM
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[15px] font-black text-[#10B981]">+250.00 ETB</ThemedText>
                </View>

                {/* Transaction 2 */}
                <View className="flex-row items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-100">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-2xl bg-[#0284C7]/15 items-center justify-center">
                      <ThemedText className="text-[18px]">📲</ThemedText>
                    </View>
                    <View>
                      <ThemedText className="text-[14px] font-black" style={{ color: colors.text }}>
                        Bidr Repayment — Abebe K.
                      </ThemedText>
                      <ThemedText className="text-[12px]" style={{ color: colors.textSecondary }}>
                        Telebirr Verified · 10:31 AM
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[15px] font-black text-[#10B981]">+500.00 ETB</ThemedText>
                </View>

                {/* Transaction 3 */}
                <View className="flex-row items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-100">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-2xl bg-[#D97706]/15 items-center justify-center">
                      <ThemedText className="text-[18px]">📜</ThemedText>
                    </View>
                    <View>
                      <ThemedText className="text-[14px] font-black" style={{ color: colors.text }}>
                        New Bidr Entry — Kebede M.
                      </ThemedText>
                      <ThemedText className="text-[12px]" style={{ color: colors.textSecondary }}>
                        14-Day Term · Bole Branch · 10:15 AM
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[15px] font-black text-[#D97706]">1,200.00 ETB</ThemedText>
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
    backgroundColor: '#1B3B2B', // Ethiopian Forest Emerald Deep Theme
  },
});


