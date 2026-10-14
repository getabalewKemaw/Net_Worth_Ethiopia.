import React, { useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useBusinessStore } from '@/store/business-store';
import { useBusinessHealthStore } from '@/store/business-health-store';
import {
  InflowOutflowBarChart,
  ProfitVelocityTrendChart,
  DigitalFootprintDial,
} from '@/components/charts/health-charts';
import { ShareDossierModal } from '@/components/health/share-dossier-modal';
import type { TimeRangeFilter } from '@/types/health';

const TIMEFRAMES: { id: TimeRangeFilter; label: string }[] = [
  { id: '1M', label: '1M' },
  { id: '3M', label: '3M' },
  { id: '6M', label: '6M' },
  { id: 'YTD', label: 'YTD' },
  { id: '1Y', label: '1 Year' },
  { id: 'ALL', label: 'All' },
];

function formatCurrencyETB(amount: number): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
}

function formatCompactETB(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(amount / 1_000).toFixed(1)}k`;
  return `${Math.round(amount)}`;
}

export default function BusinessHealthScreen() {
  const colors = useTheme();
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const branches = useBusinessStore((state) => state.branches);

  const {
    filteredSnapshots,
    summary,
    timeframe,
    selectedBranchId,
    isPending,
    isRefreshing,
    error,
    setTimeframe,
    setSelectedBranchId,
    loadHealthData,
    refreshHealthData,
    openShareModal,
  } = useBusinessHealthStore();

  const businessId = activeBusiness?.id || '';

  // Initial load when screen mounts or business changes
  useEffect(() => {
    if (businessId) {
      loadHealthData(businessId, selectedBranchId, branches);
    }
  }, [businessId, selectedBranchId]);

  const onRefresh = useCallback(async () => {
    if (businessId) {
      await refreshHealthData(businessId, selectedBranchId, branches);
    }
  }, [businessId, selectedBranchId, branches]);

  const latestSnapshot =
    filteredSnapshots.length > 0
      ? filteredSnapshots[filteredSnapshots.length - 1]
      : undefined;

  const activeBranchName = selectedBranchId
    ? branches.find((b) => b.id === selectedBranchId)?.name || 'Branch'
    : 'All Operating Branches';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. TOP NAVIGATION HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <ThemedText style={styles.backText}>← Back</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareDossierBtn}
            onPress={openShareModal}
            accessibilityRole="button"
            accessibilityLabel="Share Bank Dossier"
            activeOpacity={0.8}
          >
            <ThemedText style={styles.shareDossierBtnText}>🏦 Share Dossier</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleRow}>
          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.screenTitle}>Business Health</ThemedText>
            <ThemedText style={styles.businessSubtitle} numberOfLines={1}>
              {activeBusiness?.name || 'NetWorth Ethiopia'} · {activeBranchName}
            </ThemedText>
          </View>

          <View style={styles.healthStatusPill}>
            <View style={styles.pulseDot} />
            <ThemedText style={styles.healthStatusText}>Loan Ready</ThemedText>
          </View>
        </View>
      </View>

      {/* 2. TIMEFRAME FILTER BAR */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {TIMEFRAMES.map((tf) => {
            const isActive = timeframe === tf.id;
            return (
              <TouchableOpacity
                key={tf.id}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setTimeframe(tf.id)}
                activeOpacity={0.7}
              >
                <ThemedText
                  style={[styles.filterPillText, isActive && styles.filterPillTextActive]}
                >
                  {tf.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#065F46"
            colors={['#065F46']}
          />
        }
      >
        {isPending && !isRefreshing && filteredSnapshots.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#065F46" />
            <ThemedText style={styles.loadingText}>
              Auditing financial snapshots & branch records...
            </ThemedText>
          </View>
        ) : (
          <>
            {/* 3. HERO EXECUTIVE SUMMARY CARD */}
            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.heroPulseRow}>
                  <View style={styles.heroPulseDot} />
                  <ThemedText style={styles.heroPulseLabel}>FINANCIAL PULSE</ThemedText>
                </View>
                <ThemedText style={styles.heroPeriodTag}>
                  {timeframe === 'ALL' ? 'Cumulative' : `${timeframe} Window`}
                </ThemedText>
              </View>

              <ThemedText style={styles.heroNetLabel}>
                Net Generated Cash (Inflow - Outflow)
              </ThemedText>
              <ThemedText style={styles.heroNetValue}>
                {formatCurrencyETB(summary?.netProfit || 0)}
              </ThemedText>

              {/* Grid Metrics Breakdown */}
              <View style={styles.heroGrid}>
                <View style={styles.heroGridItem}>
                  <ThemedText style={styles.heroGridLabel}>Gross Inflow</ThemedText>
                  <ThemedText style={[styles.heroGridValue, { color: '#34D399' }]}>
                    {formatCompactETB(summary?.totalInflow || 0)} ETB
                  </ThemedText>
                </View>

                <View style={styles.heroGridDivider} />

                <View style={styles.heroGridItem}>
                  <ThemedText style={styles.heroGridLabel}>Gross Outflow</ThemedText>
                  <ThemedText style={[styles.heroGridValue, { color: '#FBBF24' }]}>
                    {formatCompactETB(summary?.totalOutflow || 0)} ETB
                  </ThemedText>
                </View>

                <View style={styles.heroGridDivider} />

                <View style={styles.heroGridItem}>
                  <ThemedText style={styles.heroGridLabel}>Net Margin</ThemedText>
                  <ThemedText style={styles.heroGridValue}>
                    {summary?.avgProfitMarginPct || 0}%
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* 4. DUAL-BAR MONTHLY CURRENCY FLOW COMPARISON */}
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Monthly Currency Flow</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Gross inflows vs operational expense outflows
              </ThemedText>
            </View>

            <InflowOutflowBarChart
              snapshots={filteredSnapshots}
              onSelectPeriod={(s) => {
                // optionally inspect period
              }}
            />

            {/* 5. PROFIT VELOCITY & MOM TRAJECTORY */}
            <ProfitVelocityTrendChart snapshots={filteredSnapshots} />

            {/* 6. MULTI-BRANCH FINANCIAL AUDIT BREAKDOWN */}
            {latestSnapshot && latestSnapshot.branchMetrics && latestSnapshot.branchMetrics.length > 0 && (
              <View style={styles.branchSection}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.sectionTitle}>
                    Branch Profitability Audit ({latestSnapshot.branchMetrics.length} Locations)
                  </ThemedText>
                  <ThemedText style={styles.sectionSubtitle}>
                    Share breakdown of revenue and operating margins
                  </ThemedText>
                </View>

                <View style={styles.branchesList}>
                  {latestSnapshot.branchMetrics.map((b) => (
                    <View key={b.branchId} style={styles.branchCard}>
                      <View style={styles.branchCardHeader}>
                        <View style={styles.branchCardTitleGroup}>
                          <ThemedText style={styles.branchName}>{b.branchName}</ThemedText>
                          {b.city && (
                            <ThemedText style={styles.branchCity}>{b.city}</ThemedText>
                          )}
                        </View>
                        <View style={styles.shareBadge}>
                          <ThemedText style={styles.shareBadgeText}>
                            {b.sharePct}% Share
                          </ThemedText>
                        </View>
                      </View>

                      {/* Contribution Progress Track */}
                      <View style={styles.branchTrack}>
                        <View
                          style={[
                            styles.branchFill,
                            { width: `${Math.max(4, Math.min(100, b.sharePct))}%` },
                          ]}
                        />
                      </View>

                      {/* Branch Metric Figures */}
                      <View style={styles.branchNumbersRow}>
                        <View style={styles.branchNumItem}>
                          <ThemedText style={styles.branchNumLabel}>Revenue</ThemedText>
                          <ThemedText style={styles.branchNumValue}>
                            {formatCompactETB(b.inflow)} ETB
                          </ThemedText>
                        </View>
                        <View style={styles.branchNumItem}>
                          <ThemedText style={styles.branchNumLabel}>Expenses</ThemedText>
                          <ThemedText style={styles.branchNumValue}>
                            {formatCompactETB(b.outflow)} ETB
                          </ThemedText>
                        </View>
                        <View style={styles.branchNumItem}>
                          <ThemedText style={styles.branchNumLabel}>Net Profit</ThemedText>
                          <ThemedText
                            style={[
                              styles.branchNumValue,
                              { color: b.profit >= 0 ? '#065F46' : '#DC2626' },
                            ]}
                          >
                            {formatCompactETB(b.profit)} ETB
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 7. BANKABILITY & TRUST FOOTPRINT */}
            <DigitalFootprintDial
              latestSnapshot={latestSnapshot}
              averageDigitalRatio={summary?.averageDigitalRatio}
            />

            {/* 8. FOOTER PRIMARY ACTION */}
            <View style={styles.footerContainer}>
              <TouchableOpacity
                style={styles.generateDossierBtn}
                onPress={openShareModal}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.generateDossierBtnText}>
                  📋 Generate Bank-Certified Dossier Link
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.footerNote}>
                Encrypted & tamper-proof snapshot for CBE, Awash, Dashen & Telebirr credit
              </ThemedText>
            </View>
          </>
        )}
      </ScrollView>

      {/* Share Dossier Modal Component */}
      <ShareDossierModal
        businessId={businessId}
        businessName={activeBusiness?.name || 'NetWorth Ethiopia'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 10,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  shareDossierBtn: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  shareDossierBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  businessSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  healthStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  healthStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },

  // Timeframe Filter Bar
  filterBarContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#065F46',
    borderColor: '#065F46',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  // Hero Card Styles
  heroCard: {
    backgroundColor: '#064E3B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  heroPulseLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A7F3D0',
    letterSpacing: 0.8,
  },
  heroPeriodTag: {
    fontSize: 11,
    color: '#A7F3D0',
    fontWeight: '600',
  },
  heroNetLabel: {
    fontSize: 12,
    color: '#D1FAE5',
    marginBottom: 4,
  },
  heroNetValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  heroGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  heroGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroGridDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroGridLabel: {
    fontSize: 10,
    color: '#A7F3D0',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  heroGridValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Section Typography
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // Branch Breakdown
  branchSection: {
    marginBottom: 20,
  },
  branchesList: {
    gap: 10,
  },
  branchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  branchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  branchCardTitleGroup: {
    flex: 1,
    paddingRight: 8,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  branchCity: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  shareBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  shareBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  branchTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  branchFill: {
    height: '100%',
    backgroundColor: '#065F46',
    borderRadius: 3,
  },
  branchNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  branchNumItem: {
    alignItems: 'center',
  },
  branchNumLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 1,
  },
  branchNumValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Footer Actions
  footerContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  generateDossierBtn: {
    width: '100%',
    backgroundColor: '#065F46',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  generateDossierBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
});
