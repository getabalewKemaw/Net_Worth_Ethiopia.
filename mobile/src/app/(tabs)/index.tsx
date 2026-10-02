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

  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header */}
      <HamburgerHeader activeTabId="dashboard" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isPending ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#065F46" />
            <ThemedText style={styles.loadingText}>
              Loading operational metrics...
            </ThemedText>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {/* 1. HERO REVENUE CARD (Sleek, Balanced Ethiopian Emerald) */}
            <View style={styles.heroCard}>
              {/* Card Top Row */}
              <View style={styles.heroTopRow}>
                <View style={styles.heroHeaderLeft}>
                  <View style={styles.liveIndicatorDot} />
                  <ThemedText style={styles.heroHeaderLabel}>
                    Today&apos;s Total Revenue
                  </ThemedText>
                </View>

                <View style={styles.growthBadge}>
                  <ThemedText style={styles.growthBadgeText}>
                    ↑ +12.5%
                  </ThemedText>
                </View>
              </View>

              {/* Main Balance Display - Reduced & Proportional */}
              <View style={styles.heroAmountRow}>
                <ThemedText style={styles.heroAmountText}>
                  18,450.00
                </ThemedText>
                <ThemedText style={styles.heroCurrencyText}>
                  ETB
                </ThemedText>
              </View>

              {/* Card Bottom Stats Grid - Compact, Balanced & Refined */}
              <View style={styles.heroStatsDivider}>
                <View style={styles.heroStatColLeft}>
                  <ThemedText style={styles.heroSubLabel}>
                    Estimated Profit
                  </ThemedText>
                  <ThemedText style={styles.heroSubValue}>
                    6,250 ETB{' '}
                    <ThemedText style={styles.profitPercent}>
                      (33%)
                    </ThemedText>
                  </ThemedText>
                </View>

                <View style={styles.heroStatColRight}>
                  <ThemedText style={styles.heroSubLabel}>
                    Registered Dube(debt)
                  </ThemedText>
                  <ThemedText style={styles.heroDubeValue}>
                    32,800 ETB
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* 2. UNIFIED QUICK ACTIONS (Connected directly to actual functionality/tabs) */}
            <View style={styles.actionRow}>
              {/* 1. Record Sale -> Navigates to Sales Tab */}
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

              {/* 2. Log Expense -> Navigates to Expenses / Sales Tab */}
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

              {/* 3. Manage Branches -> Navigates to Branches Screen */}
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

            {/* 3. WEEKLY SALES PERFORMANCE CHART */}
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

              {/* Bar Chart Component */}
              <SalesTrendAreaChart />
            </View>

            {/* 4. PAYMENT SETTLEMENT CHANNELS */}
            <View style={styles.cleanCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <ThemedText style={styles.sectionTitle}>
                    Payment Channels
                  </ThemedText>
                  <ThemedText style={styles.sectionSubtitle}>
                    Settlement share for today&apos;s sales
                  </ThemedText>
                </View>

                <View style={styles.reconciledBadge}>
                  <ThemedText style={styles.reconciledText}>
                    RECONCILED
                  </ThemedText>
                </View>
              </View>

              <PaymentChannelDonutChart />
            </View>

            {/* 5. MULTI-BRANCH STATUS */}
            <View style={styles.cleanCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <ThemedText style={styles.sectionTitle}>
                    Operating Branches
                  </ThemedText>
                  <ThemedText style={styles.sectionSubtitle}>
                    Active locations ({displayBranches.length})
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
                      <View style={styles.branchLeft}>
                        <View
                          style={[
                            styles.branchAvatar,
                            { backgroundColor: isCurrent ? '#065F46' : '#94A3B8' },
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
                            {br.city || 'Addis Ababa'} · Share: {br.share || '50%'}
                          </ThemedText>
                        </View>
                      </View>

                      <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                        <ThemedText style={styles.branchSalesText}>
                          {br.sales || '12,450 ETB'}
                        </ThemedText>
                        <ThemedText style={styles.branchActiveTag}>
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
                {/* Activity 1 */}
                <View style={styles.activityRow}>
                  <View style={styles.activityLeft}>
                    <View style={[styles.activityIconBadge, { backgroundColor: '#ECFDF5' }]}>
                      <ThemedText style={{ fontSize: 13 }}>💵</ThemedText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.activityTitle}>
                        Counter Cash Sale
                      </ThemedText>
                      <ThemedText style={styles.activitySubtitle}>
                        Main Branch · 12:45 PM
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.activityAmount, { color: '#059669' }]}>
                    +850.00 ETB
                  </ThemedText>
                </View>

                {/* Activity 2 */}
                <View style={styles.activityRow}>
                  <View style={styles.activityLeft}>
                    <View style={[styles.activityIconBadge, { backgroundColor: '#EFF6FF' }]}>
                      <ThemedText style={{ fontSize: 13 }}>📱</ThemedText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.activityTitle}>
                        Telebirr QR Payment
                      </ThemedText>
                      <ThemedText style={styles.activitySubtitle}>
                        Main Branch · 11:30 AM
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.activityAmount, { color: '#0284C7' }]}>
                    +500.00 ETB
                  </ThemedText>
                </View>

                {/* Activity 3 */}
                <View style={[styles.activityRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.activityLeft}>
                    <View style={[styles.activityIconBadge, { backgroundColor: '#FFFBEB' }]}>
                      <ThemedText style={{ fontSize: 13 }}>📜</ThemedText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.activityTitle}>
                        New Dube — Kebede M.
                      </ThemedText>
                      <ThemedText style={styles.activitySubtitle}>
                        14-Day Term · 10:15 AM
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.activityAmount, { color: '#D97706' }]}>
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
    fontSize: 27, // Clean, reduced from 34px to proportional 27px
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
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  reconciledBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  reconciledText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  manageBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  manageBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },

  // Operating Branches Row
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  branchRowActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  branchLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  branchAvatar: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchAvatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  branchName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  branchMeta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  branchSalesText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  branchActiveTag: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#059669',
  },

  // Recent Activity Feed Row
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  activityLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  activityIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  activitySubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  activityAmount: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
});
