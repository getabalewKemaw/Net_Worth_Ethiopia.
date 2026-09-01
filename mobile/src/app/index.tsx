import { ScrollView, View, ActivityIndicator, Pressable } from 'react-native';
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

  // Fallback multi-branch demo data when registered branches are limited
  const displayBranches = branches.length > 0 ? branches : [
    { id: 'b1', name: 'Main Branch', city: 'Addis Ababa', branchCode: 'BR-001', sales: '12,450 ETB', debt: '18,200 ETB', active: true },
    { id: 'b2', name: 'Bole Flagship', city: 'Bole, Addis Ababa', branchCode: 'BR-002', sales: '6,000 ETB', debt: '14,600 ETB', active: false },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Top Navigation Bar with Hamburger Drawer Menu */}
      <HamburgerHeader activeTabId="dashboard" />

      <ScrollView className="flex-1 px-4 py-3" showsVerticalScrollIndicator={false}>
        {isPending ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View className="gap-5 pb-8">
            {/* Greeting & Date Header */}
            <View className="flex-row items-center justify-between">
              <View>
                <ThemedText className="text-[22px] font-extrabold" style={{ color: colors.text }}>
                  Good morning 👋
                </ThemedText>
                <ThemedText className="text-[13px] mt-0.5 font-medium" style={{ color: colors.textSecondary }}>
                  {activeBranch?.name ? `${activeBranch.name} · Executive Dashboard` : "Today's Merchant Summary"}
                </ThemedText>
              </View>
            </View>

            {/* Quick Action CTA Buttons */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2.5 py-1">
              <Pressable
                className="px-4 py-3 rounded-xl flex-row items-center gap-2 active:opacity-80 shadow-sm"
                style={{ backgroundColor: colors.primary }}
                onPress={() => router.push('/sales')}
              >
                <ThemedText className="text-white text-[16px]">⚡</ThemedText>
                <ThemedText className="text-white font-bold text-[14px]">+ New Sale</ThemedText>
              </Pressable>

              <Pressable
                className="px-4 py-3 rounded-xl flex-row items-center gap-2 border border-gray-200 active:opacity-80"
                style={{ backgroundColor: colors.backgroundElement }}
                onPress={() => router.push('/bidr')}
              >
                <ThemedText className="text-[16px]">📜</ThemedText>
                <ThemedText className="font-semibold text-[14px]" style={{ color: colors.text }}>+ Add Debt</ThemedText>
              </Pressable>

              <Pressable
                className="px-4 py-3 rounded-xl flex-row items-center gap-2 border border-gray-200 active:opacity-80"
                style={{ backgroundColor: colors.backgroundElement }}
                onPress={() => router.push('/expenses')}
              >
                <ThemedText className="text-[16px]">💸</ThemedText>
                <ThemedText className="font-semibold text-[14px]" style={{ color: colors.text }}>+ Expense</ThemedText>
              </Pressable>
            </ScrollView>

            {/* 4 Executive KPI Cards */}
            <View className="flex-row flex-wrap gap-3">
              {/* Today's Sales */}
              <View className="flex-1 min-w-[150px] p-4 rounded-2xl gap-1 border border-gray-100" style={{ backgroundColor: colors.backgroundElement }}>
                <ThemedText className="text-[12px] font-semibold uppercase" style={{ color: colors.textSecondary }}>
                  Today's Total Sales
                </ThemedText>
                <ThemedText className="text-[20px] font-black" style={{ color: colors.text }}>
                  18,450 ETB
                </ThemedText>
                <ThemedText className="text-[12px] font-bold text-[#2E7D32]">
                  ↑ 12.5% vs yesterday
                </ThemedText>
              </View>

              {/* Today's Profit */}
              <View className="flex-1 min-w-[150px] p-4 rounded-2xl gap-1 border border-gray-100" style={{ backgroundColor: colors.backgroundElement }}>
                <ThemedText className="text-[12px] font-semibold uppercase" style={{ color: colors.textSecondary }}>
                  Today's Profit
                </ThemedText>
                <ThemedText className="text-[20px] font-black" style={{ color: colors.text }}>
                  6,250 ETB
                </ThemedText>
                <ThemedText className="text-[12px] font-bold text-[#2E7D32]">
                  ↑ 8.2% margin
                </ThemedText>
              </View>

              {/* Outstanding Debt */}
              <View className="flex-1 min-w-[150px] p-4 rounded-2xl gap-1 border border-gray-100" style={{ backgroundColor: colors.backgroundElement }}>
                <ThemedText className="text-[12px] font-semibold uppercase" style={{ color: colors.textSecondary }}>
                  Bidr (Customer Debt)
                </ThemedText>
                <ThemedText className="text-[20px] font-black" style={{ color: colors.text }}>
                  32,800 ETB
                </ThemedText>
                <ThemedText className="text-[12px] font-medium" style={{ color: colors.textSecondary }}>
                  12 pending customers
                </ThemedText>
              </View>

              {/* Store Performance Score */}
              <View className="flex-1 min-w-[150px] p-4 rounded-2xl gap-1 border border-gray-100" style={{ backgroundColor: colors.backgroundElement }}>
                <ThemedText className="text-[12px] font-semibold uppercase" style={{ color: colors.textSecondary }}>
                  Health Credit Score
                </ThemedText>
                <ThemedText className="text-[20px] font-black text-[#2E7D32]">
                  785 A+
                </ThemedText>
                <ThemedText className="text-[12px] font-bold text-[#2E7D32]">
                  ✓ High Loan Eligibility
                </ThemedText>
              </View>
            </View>

            {/* 🏬 BRANCH PERFORMANCE SUMMARY SECTION */}
            <View className="p-4 rounded-2xl gap-3 border border-gray-100" style={{ backgroundColor: colors.backgroundElement }}>
              <View className="flex-row items-center justify-between">
                <View>
                  <ThemedText className="text-[16px] font-bold" style={{ color: colors.text }}>
                    🏬 Branch Performance Summary
                  </ThemedText>
                  <ThemedText className="text-[12px]" style={{ color: colors.textSecondary }}>
                    Sales & debt breakdown across operating locations
                  </ThemedText>
                </View>
                <Pressable
                  className="px-3 py-1.5 rounded-lg active:opacity-80"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => router.push('/(business)/branches')}
                >
                  <ThemedText className="text-white text-[12px] font-semibold">Manage Branches</ThemedText>
                </Pressable>
              </View>

              <View className="gap-3 mt-1">
                {displayBranches.map((br: any, idx: number) => {
                  const isSelected = activeBranch?.id === br.id || br.active;
                  const branchSales = br.sales || (idx === 0 ? '12,450 ETB' : '6,000 ETB');
                  const branchDebt = br.debt || (idx === 0 ? '18,200 ETB' : '14,600 ETB');

                  return (
                    <View
                      key={br.id || idx}
                      className="p-3.5 rounded-xl border flex-row items-center justify-between"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: isSelected ? colors.primary : 'rgba(0,0,0,0.08)',
                      }}
                    >
                      <View className="flex-1 gap-1">
                        <View className="flex-row items-center gap-2">
                          <ThemedText className="text-[15px] font-bold" style={{ color: colors.text }}>
                            {br.name}
                          </ThemedText>
                          {isSelected && (
                            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(46, 125, 50, 0.12)' }}>
                              <ThemedText className="text-[10px] font-bold text-[#2E7D32]">Active Branch</ThemedText>
                            </View>
                          )}
                        </View>

                        <ThemedText className="text-[12px]" style={{ color: colors.textSecondary }}>
                          📍 {br.city || br.address || 'Addis Ababa'} · Code: {br.branchCode || `BR-00${idx + 1}`}
                        </ThemedText>

                        {/* Branch Metrics Pill */}
                        <View className="flex-row items-center gap-4 mt-1">
                          <View>
                            <ThemedText className="text-[10px] font-bold uppercase text-[#60646C]">Sales Today</ThemedText>
                            <ThemedText className="text-[13px] font-extrabold" style={{ color: colors.text }}>{branchSales}</ThemedText>
                          </View>
                          <View>
                            <ThemedText className="text-[10px] font-bold uppercase text-[#60646C]">Bidr Debt</ThemedText>
                            <ThemedText className="text-[13px] font-extrabold text-[#FF8F00]">{branchDebt}</ThemedText>
                          </View>
                        </View>
                      </View>

                      {!isSelected && br.id && (
                        <Pressable
                          className="px-3 py-1.5 rounded-lg active:opacity-80 border"
                          style={{ borderColor: colors.primary }}
                          onPress={() => switchBranch(br.id)}
                        >
                          <ThemedText className="text-[12px] font-semibold" style={{ color: colors.primary }}>
                            Switch
                          </ThemedText>
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Merged Analytics & Sales Trend Section */}
            <View className="p-4 rounded-2xl gap-3 border border-gray-100" style={{ backgroundColor: colors.backgroundElement }}>
              <View className="flex-row items-center justify-between">
                <ThemedText className="text-[16px] font-bold" style={{ color: colors.text }}>
                  📊 Analytics & Sales Trend
                </ThemedText>
                <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: colors.backgroundSelected }}>
                  <ThemedText className="text-[12px] font-semibold" style={{ color: colors.text }}>Last 7 Days</ThemedText>
                </View>
              </View>

              {/* Simplified Trend Bar Visualization */}
              <View className="flex-row items-end justify-between h-[100px] pt-4 px-2">
                {[
                  { day: 'Mon', val: 12000, h: '60%' },
                  { day: 'Tue', val: 14500, h: '72%' },
                  { day: 'Wed', val: 9800, h: '48%' },
                  { day: 'Thu', val: 16200, h: '80%' },
                  { day: 'Fri', val: 19000, h: '95%' },
                  { day: 'Sat', val: 15400, h: '76%' },
                  { day: 'Sun', val: 18450, h: '90%' },
                ].map((item, idx) => (
                  <View key={idx} className="items-center gap-1.5 flex-1">
                    <View className="w-full max-w-[24px] rounded-t-md" style={{ height: item.h, backgroundColor: idx === 6 ? colors.primary : colors.backgroundSelected }} />
                    <ThemedText className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>{item.day}</ThemedText>
                  </View>
                ))}
              </View>

              <View className="flex-row items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <ThemedText className="text-[13px]" style={{ color: colors.textSecondary }}>
                  Net Weekly Profit: <ThemedText className="font-bold text-[#2E7D32]">42,500 ETB</ThemedText>
                </ThemedText>
                <Pressable onPress={() => router.push('/(business)/branches')}>
                  <ThemedText className="text-[13px] font-bold" style={{ color: colors.primary }}>
                    View Branch Details →
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Recent Activity Ledger */}
            <View className="p-4 rounded-2xl gap-3 border border-gray-100" style={{ backgroundColor: colors.backgroundElement }}>
              <ThemedText className="text-[16px] font-bold" style={{ color: colors.text }}>
                Recent Transactions
              </ThemedText>

              <View className="gap-2.5">
                <View className="flex-row items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: 'rgba(46, 125, 50, 0.12)' }}>
                      <ThemedText className="text-[16px]">🛒</ThemedText>
                    </View>
                    <View>
                      <ThemedText className="text-[14px] font-bold" style={{ color: colors.text }}>Sale — Coca Cola x2</ThemedText>
                      <ThemedText className="text-[12px]" style={{ color: colors.textSecondary }}>Cash · 10:42 AM</ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[14px] font-black" style={{ color: colors.text }}>+250 ETB</ThemedText>
                </View>

                <View className="flex-row items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: 'rgba(2, 132, 199, 0.12)' }}>
                      <ThemedText className="text-[16px]">📲</ThemedText>
                    </View>
                    <View>
                      <ThemedText className="text-[14px] font-bold" style={{ color: colors.text }}>Bidr Repayment — Abebe</ThemedText>
                      <ThemedText className="text-[12px]" style={{ color: colors.textSecondary }}>Telebirr · 10:31 AM</ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[14px] font-black text-[#2E7D32]">+500 ETB</ThemedText>
                </View>

                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: 'rgba(255, 143, 0, 0.12)' }}>
                      <ThemedText className="text-[16px]">📜</ThemedText>
                    </View>
                    <View>
                      <ThemedText className="text-[14px] font-bold" style={{ color: colors.text }}>New Debt — Kebede</ThemedText>
                      <ThemedText className="text-[12px]" style={{ color: colors.textSecondary }}>14 Days Term · 10:15 AM</ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-[14px] font-black text-[#FF8F00]">1,200 ETB</ThemedText>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


