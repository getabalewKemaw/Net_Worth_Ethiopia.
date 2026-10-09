import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { HamburgerHeader } from '@/components/navigation/hamburger-drawer';
import { useBusinessStore } from '@/store/business-store';
import { useSalesStore } from '@/store/sales-store';
import { useBidrStore } from '@/store/bidr-store';
import { useTheme } from '@/hooks/use-theme';
import { useNetworkSync } from '@/hooks/use-network-sync';
import {
  SalesTrendAreaChart,
  PaymentChannelDonutChart,
} from '@/components/charts/dashboard-charts';
import {
  fetchCompleteDashboardMetrics,
  type DashboardMetricsResult,
} from '@/service/dashboard';

export default function HomeScreen() {
  const colors = useTheme();

  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const branches = useBusinessStore((state) => state.branches);
  const activeBranch = useBusinessStore((state) => state.activeBranch);
  const switchBranch = useBusinessStore((state) => state.switchBranch);
  const isBusinessPending = useBusinessStore((state) => state.isPending);
  const refreshBusinessState = useBusinessStore((state) => state.refreshState);

  const { lastSyncTime } = useNetworkSync();

  const [metrics, setMetrics] = useState<DashboardMetricsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load real metrics from SQLite / API
  const loadDashboardMetrics = useCallback(async () => {
    if (!activeBusiness?.id) {
      setMetrics(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchCompleteDashboardMetrics(
        activeBusiness.id,
        activeBranch?.id,
        branches,
        {
          sales: useSalesStore.getState().sales,
          expenses: useSalesStore.getState().expenses,
          debts: useBidrStore.getState().debts,
        }
      );
      setMetrics(data);
    } catch (err) {
      console.warn('[Dashboard] Metrics fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeBusiness?.id, activeBranch?.id, branches]);

  // Initial and reactive load whenever business/branch or network sync changes
  useEffect(() => {
    loadDashboardMetrics();
  }, [loadDashboardMetrics, lastSyncTime]);

  // Pull-to-refresh with full store and backend sync
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (activeBusiness?.id) {
        await Promise.all([
          refreshBusinessState(),
          useSalesStore.getState().refresh(activeBusiness.id, activeBranch?.id),
          useBidrStore.getState().refresh(activeBusiness.id, activeBranch?.id),
        ]);
      }
      await loadDashboardMetrics();
    } catch (err) {
      console.warn('[Dashboard] Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeBusiness?.id, activeBranch?.id, refreshBusinessState, loadDashboardMetrics]);

  const todayRevenue = metrics?.todayRevenue ?? 0;
  const todayExpense = metrics?.todayExpense ?? 0;
  const registeredDube = metrics?.registeredDube ?? 0;
  const estimatedProfit = metrics?.estimatedProfit ?? 0;
  const profitPercent = metrics?.profitPercent ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header Drawer Bar */}
      <HamburgerHeader activeTabId="dashboard" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#065F46"
            colors={['#065F46']}
          />
        }
      >
        {isLoading || isBusinessPending ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#065F46" />
            <ThemedText style={styles.loadingText}>
              Loading live business metrics...
            </ThemedText>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {/* 1. HERO REVENUE CARD (Live Ethiopian Forest Emerald) */}
            <View style={styles.heroCard}>
              {/* Card Top Row */}
              <View style={styles.heroTopRow}>
                <View style={styles.heroHeaderLeft}>
                  <View style={styles.liveIndicatorDot} />
                  <ThemedText style={styles.heroHeaderLabel}>
                    Today&apos;s Total Revenue
                  </ThemedText>
                </View>

                {/* Real Dynamic Growth / Activity Badge */}
                <View style={styles.growthBadge}>
                  <ThemedText
                    style={[
                      styles.growthBadgeText,
                      !metrics?.isGrowthPositive && { color: '#FCD34D' },
                    ]}
                  >
                    {metrics?.growthBadgeText || 'Today'}
                  </ThemedText>
                </View>
              </View>

              {/* Main Balance Display */}
              <View style={styles.heroAmountRow}>
                <ThemedText style={styles.heroAmountText}>
                  {todayRevenue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </ThemedText>
                <ThemedText style={styles.heroCurrencyText}>
                  ETB
                </ThemedText>
              </View>

              {/* Card Bottom Stats Grid: Profit & Credit Dube */}
              <View style={styles.heroStatsDivider}>
                <View style={styles.heroStatColLeft}>
                  <ThemedText style={styles.heroSubLabel}>
                    Estimated Profit
                  </ThemedText>
                  <ThemedText style={styles.heroSubValue}>
                    {estimatedProfit.toLocaleString('en-US')} ETB{' '}
                    <ThemedText style={styles.profitPercent}>
                      ({profitPercent}%)
                    </ThemedText>
                  </ThemedText>
                </View>

                <View style={styles.heroStatColRight}>
                  <ThemedText style={styles.heroSubLabel}>
                    Registered Dube (Debt)
                  </ThemedText>
                  <ThemedText style={styles.heroDubeValue}>
                    {registeredDube.toLocaleString('en-US')} ETB
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* 2. UNIFIED QUICK ACTIONS (Connected directly to actual screens) */}
            <View style={styles.actionRow}>
              {/* Record Sale -> Sales Tab */}
              <Pressable
                style={[styles.actionButton, styles.saleAction]}
                onPress={() => router.push('/sales' as any)}
              >
                <View style={[styles.actionIconBadge, { backgroundColor: '#ECFDF5' }]}>
                  <ThemedText style={{ fontSize: 15 }}>🛒</ThemedText>
                </View>
                <ThemedText style={[styles.actionTitle, { color: '#065F46' }]}>
                  + New Sale
                </ThemedText>
              </Pressable>

              {/* Log Expense -> Expenses Screen */}
              <Pressable
                style={[styles.actionButton, styles.expenseAction]}
                onPress={() => router.push('/sales' as any)}
              >
                <View style={[styles.actionIconBadge, { backgroundColor: '#FFFBEB' }]}>
                  <ThemedText style={{ fontSize: 15 }}>💸</ThemedText>
                </View>
                <ThemedText style={[styles.actionTitle, { color: '#B45309' }]}>
                  + Expense
                </ThemedText>
              </Pressable>

              {/* Manage Branches -> Branches Screen */}
              <Pressable
                style={[styles.actionButton, styles.branchesAction]}
                onPress={() => router.push('/(business)/branches' as any)}
              >
                <View style={[styles.actionIconBadge, { backgroundColor: '#EFF6FF' }]}>
                  <ThemedText style={{ fontSize: 15 }}>🏬</ThemedText>
                </View>
                <ThemedText style={[styles.actionTitle, { color: '#1E40AF' }]}>
                  Branches
                </ThemedText>
              </Pressable>
            </View>

            {/* 3. WEEKLY SALES PERFORMANCE CHART (Connected with Real Past 7 Days Data) */}
            <View style={styles.cleanCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <ThemedText style={styles.sectionTitle}>
                    Weekly Sales Velocity
                  </ThemedText>
                  <ThemedText style={styles.sectionSubtitle}>
                    Daily revenue breakdown for the past 7 days
                  </ThemedText>
                </View>

                <View style={styles.pillBadge}>
                  <ThemedText style={styles.pillBadgeText}>
                    This Week
                  </ThemedText>
                </View>
              </View>

              {/* Real Data Bar Chart */}
              <SalesTrendAreaChart
                dataPoints={metrics?.weeklySalesPoints}
                avgText={metrics?.avgDailyRevenueText}
                hasData={metrics?.hasWeeklySales}
              />
            </View>

            {/* 4. PAYMENT SETTLEMENT CHANNELS (Connected with Real Payment Methods) */}
            <View style={styles.cleanCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <ThemedText style={styles.sectionTitle}>
                    Payment Channels
                  </ThemedText>
                  <ThemedText style={styles.sectionSubtitle}>
                    Settlement share for business transactions
                  </ThemedText>
                </View>

                <View style={styles.reconciledBadge}>
                  <ThemedText style={styles.reconciledText}>
                    RECONCILED
                  </ThemedText>
                </View>
              </View>

              {/* Real Data Channels Breakdown */}
              <PaymentChannelDonutChart
                channels={metrics?.paymentChannels}
                hasData={metrics?.hasPaymentData}
              />
            </View>

            {/* 5. MULTI-BRANCH STATUS (Connected with Real Branches & Sales) */}
            <View style={styles.cleanCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <ThemedText style={styles.sectionTitle}>
                    Operating Branches
                  </ThemedText>
                  <ThemedText style={styles.sectionSubtitle}>
                    Active locations ({metrics?.branchBreakdown?.length || branches.length})
                  </ThemedText>
                </View>

                <Pressable
                  onPress={() => router.push('/(business)/branches' as any)}
                  style={styles.manageBtn}
                >
                  <ThemedText style={styles.manageBtnText}>
                    Manage →
                  </ThemedText>
                </Pressable>
              </View>

              <View style={{ gap: 7, marginTop: 4 }}>
                {metrics?.branchBreakdown && metrics.branchBreakdown.length > 0 ? (
                  metrics.branchBreakdown.map((br, idx) => (
                    <Pressable
                      key={br.id || idx}
                      onPress={() => switchBranch(br.id)}
                      style={[
                        styles.branchRow,
                        br.isCurrent && styles.branchRowActive,
                      ]}
                    >
                      <View style={styles.branchLeft}>
                        <View
                          style={[
                            styles.branchAvatar,
                            { backgroundColor: br.isCurrent ? '#065F46' : '#94A3B8' },
                          ]}
                        >
                          <ThemedText style={styles.branchAvatarText}>
                            {idx + 1}
                          </ThemedText>
                        </View>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={styles.branchName} numberOfLines={1}>
                            {br.name}
                          </ThemedText>
                          <ThemedText style={styles.branchMeta}>
                            {br.city} · Share: {br.share}
                          </ThemedText>
                        </View>
                      </View>

                      <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                        <ThemedText style={styles.branchSalesText}>
                          {br.sales}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.branchActiveTag,
                            br.isCurrent && { color: '#065F46', fontWeight: '800' },
                          ]}
                        >
                          {br.isCurrent ? '● Active Branch' : 'Tap to Select'}
                        </ThemedText>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <View style={styles.emptyBranchBox}>
                    <ThemedText style={{ fontSize: 24, marginBottom: 4 }}>🏬</ThemedText>
                    <ThemedText style={styles.emptyTitle}>No Branches Registered</ThemedText>
                    <ThemedText style={styles.emptySubtitle}>
                      Add branches to track multi-location sales.
                    </ThemedText>
                    <Pressable
                      onPress={() => router.push('/(business)/create-branch' as any)}
                      style={styles.emptyActionBtn}
                    >
                      <ThemedText style={styles.emptyActionText}>+ Add Branch</ThemedText>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            {/* 6. RECENT ACTIVITY FEED (Connected with Real Sales, Expenses & Debts) */}
            <View style={styles.cleanCard}>
              <View style={styles.cardHeaderRow}>
                <ThemedText style={styles.sectionTitle}>
                  Recent Activities
                </ThemedText>
                <Pressable onPress={() => router.push('/sales' as any)}>
                  <ThemedText style={styles.viewAllText}>
                    View all →
                  </ThemedText>
                </Pressable>
              </View>

              <View style={{ marginTop: 2 }}>
                {metrics?.recentActivities && metrics.recentActivities.length > 0 ? (
                  metrics.recentActivities.map((act, index) => {
                    const isLast = index === metrics.recentActivities.length - 1;
                    return (
                      <View
                        key={act.id}
                        style={[
                          styles.activityRow,
                          isLast && { borderBottomWidth: 0 },
                        ]}
                      >
                        <View style={styles.activityLeft}>
                          <View
                            style={[
                              styles.activityIconBadge,
                              { backgroundColor: act.iconBg },
                            ]}
                          >
                            <ThemedText style={{ fontSize: 13 }}>{act.icon}</ThemedText>
                          </View>
                          <View style={{ flex: 1 }}>
                            <ThemedText style={styles.activityTitle} numberOfLines={1}>
                              {act.title}
                            </ThemedText>
                            <ThemedText style={styles.activitySubtitle} numberOfLines={1}>
                              {act.subtitle}
                            </ThemedText>
                          </View>
                        </View>
                        <ThemedText
                          style={[
                            styles.activityAmount,
                            { color: act.amountColor },
                          ]}
                        >
                          {act.amountFormatted}
                        </ThemedText>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyBranchBox}>
                    <ThemedText style={{ fontSize: 24, marginBottom: 4 }}>📊</ThemedText>
                    <ThemedText style={styles.emptyTitle}>No Transactions Yet</ThemedText>
                    <ThemedText style={styles.emptySubtitle}>
                      Record sales or expenses to view live activities here.
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },
  loadingContainer: {
    paddingVertical: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 10,
  },

  // 1. Hero Revenue Card - Elevated, Balanced & Compact
  heroCard: {
    backgroundColor: '#064E3B', // Rich, deep Ethiopian Forest Emerald
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  heroHeaderLabel: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  growthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  growthBadgeText: {
    color: '#34D399',
    fontSize: 10.5,
    fontWeight: '800',
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 4,
  },
  heroAmountText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  heroCurrencyText: {
    color: '#A7F3D0',
    fontSize: 13,
    fontWeight: '800',
  },
  heroStatsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroStatColLeft: {
    flex: 1,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroStatColRight: {
    flex: 1,
    paddingLeft: 12,
  },
  heroSubLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10.5,
    fontWeight: '500',
    marginBottom: 2,
  },
  heroSubValue: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  profitPercent: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  heroDubeValue: {
    color: '#FCD34D',
    fontSize: 13.5,
    fontWeight: '800',
  },

  // 2. Quick Action Buttons Row
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
  },
  saleAction: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  expenseAction: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  branchesAction: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  actionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '800',
  },

  // 3. Compact Clean Cards
  cleanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
    fontWeight: '500',
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  reconciledBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    backgroundColor: '#ECFDF5',
  },
  reconciledText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },

  // Multi-branch Rows
  manageBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  manageBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  branchRowActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  branchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  branchAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  branchName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  branchMeta: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  branchSalesText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  branchActiveTag: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  emptyBranchBox: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 240,
  },
  emptyActionBtn: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#065F46',
  },
  emptyActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Recent Activity Feed Rows
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activityIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  activitySubtitle: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  activityAmount: {
    fontSize: 12.5,
    fontWeight: '800',
    marginLeft: 8,
  },
});
