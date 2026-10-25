import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useBusinessStore } from '@/store/business-store';
import * as staffService from '@/service/staff';
import { localStaffRepo } from '@/repositories/local-staff.repo';
import type { DailyDigestResponse, BranchDailyDigest } from '@/types/staff';
import { CalendarIcon, RefreshCwIcon } from '@/components/icons';

const formatDateString = (d: Date): string => {
  return d.toISOString().slice(0, 10);
};

const formatDisplayDate = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(y, m - 1, d);
  targetDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function DailyDigestScreen() {
  const activeBusiness = useBusinessStore((s) => s.activeBusiness);
  const branches = useBusinessStore((s) => s.branches);

  const [selectedDate, setSelectedDate] = useState<string>(formatDateString(new Date()));
  const [digest, setDigest] = useState<DailyDigestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDigest = useCallback(
    async (dateStr: string) => {
      if (!activeBusiness?.id) {
        setIsLoading(false);
        return;
      }

      setErrorMsg(null);
      try {
        const res = await staffService.fetchDailyDigest(activeBusiness.id, dateStr);
        setDigest(res);
      } catch (err: any) {
        console.warn('[DailyDigest] Remote fetch failed, using local SQLite fallback:', err.message);

        try {
          const fallbackBranches: BranchDailyDigest[] = await Promise.all(
            branches.map(async (b) => {
              const metrics = await localStaffRepo.computeShiftDrawerMetrics(b.id, dateStr);
              return {
                branchId: b.id,
                branchName: b.name,
                cashierName: null,
                metrics: {
                  grossInflow: metrics.totalShiftVolume,
                  cashVolume: metrics.cashInDrawer,
                  telebirrVolume: metrics.telebirrCollected,
                  cbeVolume: metrics.cbeBirrCollected,
                  expenseVolume: metrics.expenseVolume,
                  netShiftCash: metrics.netCashInDrawer,
                },
                settledDebtsToday: [],
              };
            })
          );

          const totalInflow = fallbackBranches.reduce((s, b) => s + b.metrics.grossInflow, 0);
          const totalCashInDrawer = fallbackBranches.reduce((s, b) => s + b.metrics.cashVolume, 0);
          const totalDigitalInflow = fallbackBranches.reduce(
            (s, b) => s + b.metrics.telebirrVolume + b.metrics.cbeVolume,
            0
          );
          const totalDubeSettled = fallbackBranches.reduce(
            (s, b) => s + (b.metrics.grossInflow - b.metrics.cashVolume),
            0
          );

          setDigest({
            date: dateStr,
            businessId: activeBusiness.id,
            totalInflow,
            totalCashInDrawer,
            totalDigitalInflow,
            totalDubeSettled,
            branches: fallbackBranches,
          });
        } catch (localErr: any) {
          setErrorMsg(err.message || 'Could not load daily digest.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeBusiness?.id, branches]
  );

  useEffect(() => {
    setIsLoading(true);
    loadDigest(selectedDate);
  }, [loadDigest, selectedDate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDigest(selectedDate);
  };

  const handleShiftDate = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj > today) return;

    setSelectedDate(formatDateString(dateObj));
  };

  const isToday = selectedDate === formatDateString(new Date());

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.navTitle}>Daily Branch Digest</Text>
          <Text style={styles.navSubtitle}>
            {activeBusiness?.name || 'Multi-Branch Reconciliation'}
          </Text>
        </View>

        <Pressable
          onPress={handleRefresh}
          style={styles.refreshBtn}
          hitSlop={6}
        >
          <RefreshCwIcon size={14} color="#64748B" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#065F46"
            colors={['#065F46']}
          />
        }
      >
        {/* Date Selector Pill */}
        <View style={styles.dateSelectorCard}>
          <Pressable
            onPress={() => handleShiftDate(-1)}
            style={styles.dateArrowBtn}
          >
            <Text style={styles.arrowText}>◀</Text>
          </Pressable>

          <View style={styles.dateCenter}>
            <CalendarIcon size={16} color="#065F46" />
            <Text style={styles.dateDisplayTitle}>
              {formatDisplayDate(selectedDate)}
            </Text>
            <Text style={styles.dateDisplayIso}>({selectedDate})</Text>
          </View>

          <Pressable
            onPress={() => handleShiftDate(1)}
            disabled={isToday}
            style={[
              styles.dateArrowBtn,
              isToday && { opacity: 0.4 },
            ]}
          >
            <Text style={styles.arrowText}>▶</Text>
          </Pressable>
        </View>

        {/* Quick Date Short-Cuts */}
        <View style={styles.quickDateRow}>
          <Pressable
            onPress={() => setSelectedDate(formatDateString(new Date()))}
            style={[
              styles.quickDatePill,
              isToday ? styles.quickDatePillActive : styles.quickDatePillInactive,
            ]}
          >
            <Text
              style={[
                styles.quickDateText,
                { color: isToday ? '#FFFFFF' : '#475569' },
              ]}
            >
              Today
            </Text>
          </Pressable>

          {(() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = formatDateString(yesterday);
            const isYesterday = selectedDate === yesterdayStr;
            return (
              <Pressable
                onPress={() => setSelectedDate(yesterdayStr)}
                style={[
                  styles.quickDatePill,
                  isYesterday ? styles.quickDatePillActive : styles.quickDatePillInactive,
                ]}
              >
                <Text
                  style={[
                    styles.quickDateText,
                    { color: isYesterday ? '#FFFFFF' : '#475569' },
                  ]}
                >
                  Yesterday
                </Text>
              </Pressable>
            );
          })()}
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#065F46" />
            <Text style={styles.loadingText}>Compiling multi-branch daily audit...</Text>
          </View>
        ) : !digest ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>📊</Text>
            <Text style={styles.emptyTitle}>No digest data available</Text>
          </View>
        ) : (
          <>
            {/* COMPANY-WIDE RECONCILIATION SUMMARY */}
            <View style={styles.reconciliationCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderTitle}>
                  Company-Wide Reconciliation
                </Text>
                <Text style={styles.branchCountTitle}>
                  {digest.branches.length} Operating Branches
                </Text>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.metricLabel}>
                  Total Gross Revenue Collected
                </Text>
                <Text style={styles.grossRevenueAmount}>
                  {digest.totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                </Text>
              </View>

              {/* 2-Column Physical Cash vs Digital Mobile Money Breakdown */}
              <View style={styles.breakdownRow}>
                {/* Physical Cash in Drawers */}
                <View style={[styles.breakdownBox, styles.cashBox]}>
                  <View style={styles.boxTitleRow}>
                    <Text style={{ fontSize: 16 }}>💵</Text>
                    <Text style={styles.cashBoxTitle}>
                      Physical Cash
                    </Text>
                  </View>
                  <Text style={styles.cashBoxAmount}>
                    {digest.totalCashInDrawer.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                  </Text>
                  <Text style={styles.cashBoxSubtitle}>
                    To collect from branch drawers
                  </Text>
                </View>

                {/* Digital Bank Trails */}
                <View style={[styles.breakdownBox, styles.digitalBox]}>
                  <View style={styles.boxTitleRow}>
                    <Text style={{ fontSize: 16 }}>📱</Text>
                    <Text style={styles.digitalBoxTitle}>
                      Digital Trails
                    </Text>
                  </View>
                  <Text style={styles.digitalBoxAmount}>
                    {digest.totalDigitalInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                  </Text>
                  <Text style={styles.digitalBoxSubtitle}>
                    Telebirr & CBE in bank accounts
                  </Text>
                </View>
              </View>

              {/* Settled Debt Volume */}
              {digest.totalDubeSettled > 0 && (
                <View style={styles.dubeSettledRow}>
                  <Text style={styles.dubeSettledLabel}>
                    👥 Customer Debts Recovered:
                  </Text>
                  <Text style={styles.dubeSettledAmount}>
                    +{digest.totalDubeSettled.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                  </Text>
                </View>
              )}
            </View>

            {/* BRANCH COUNTER AUDITS LIST */}
            <View style={styles.auditsContainer}>
              <View style={styles.auditsHeaderRow}>
                <Text style={styles.auditsTitle}>
                  Branch Counter Audits
                </Text>
                <Text style={styles.auditsSubtitle}>
                  Daily Store Breakdown
                </Text>
              </View>

              {digest.branches.map((b) => (
                <View key={b.branchId} style={styles.branchAuditCard}>
                  {/* Branch Card Header */}
                  <View style={styles.branchAuditHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.branchNameText}>
                        🏬 {b.branchName}
                      </Text>
                      {b.cashierName && (
                        <Text style={styles.branchCashierText}>
                          Cashier: {b.cashierName}
                        </Text>
                      )}
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.branchInflowLabel}>
                        Branch Inflow
                      </Text>
                      <Text style={styles.branchInflowAmount}>
                        {b.metrics.grossInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </Text>
                    </View>
                  </View>

                  {/* Channel Breakdown */}
                  <View style={styles.channelRow}>
                    <View style={styles.channelCol}>
                      <Text style={styles.channelColLabel}>💵 Cash in Drawer</Text>
                      <Text style={styles.channelColValue}>
                        {b.metrics.cashVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </Text>
                    </View>

                    <View style={styles.channelCol}>
                      <Text style={styles.channelColLabel}>📱 Telebirr</Text>
                      <Text style={styles.channelColValue}>
                        {b.metrics.telebirrVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </Text>
                    </View>

                    <View style={styles.channelCol}>
                      <Text style={styles.channelColLabel}>🏦 CBE Birr</Text>
                      <Text style={styles.channelColValue}>
                        {b.metrics.cbeVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </Text>
                    </View>
                  </View>

                  {/* Expenses Callout */}
                  {b.metrics.expenseVolume > 0 && (
                    <View style={styles.expensesCallout}>
                      <Text style={styles.expensesCalloutLabel}>
                        💸 Petty Expenses Deducted:
                      </Text>
                      <Text style={styles.expensesCalloutAmount}>
                        -{b.metrics.expenseVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </Text>
                    </View>
                  )}

                  {/* Settled Debts Feed */}
                  <View style={styles.debtsSection}>
                    <View style={styles.debtsSectionHeader}>
                      <Text style={styles.debtsSectionTitle}>
                        👥 Debts Settled ({b.settledDebtsToday.length})
                      </Text>
                      {b.settledDebtsToday.length > 0 && (
                        <Text style={styles.debtsAuditNotice}>
                          Cashier Audit Trail
                        </Text>
                      )}
                    </View>

                    {b.settledDebtsToday.length === 0 ? (
                      <Text style={styles.noDebtsText}>
                        No customer credit was settled at this branch on this day.
                      </Text>
                    ) : (
                      <View style={{ gap: 6, marginTop: 4 }}>
                        {b.settledDebtsToday.map((debt) => (
                          <View key={debt.saleId} style={styles.debtAuditRow}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                              <Text style={styles.debtCustomerName}>
                                {debt.customerName || 'Customer'}
                              </Text>
                              <Text style={styles.debtAttributionText}>
                                Logged by {debt.recordedByName || 'Cashier'} · {debt.paymentMethod.toUpperCase()}
                              </Text>
                            </View>
                            <Text style={styles.debtSettledAmount}>
                              +{debt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNav: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  backArrow: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 16,
    marginRight: 4,
  },
  backText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  navSubtitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSelectorCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  dateArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  arrowText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#334155',
  },
  dateCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateDisplayTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  dateDisplayIso: {
    fontSize: 12,
    color: '#64748B',
  },
  quickDateRow: {
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  quickDatePill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickDatePillActive: {
    backgroundColor: '#065F46',
    borderColor: '#065F46',
  },
  quickDatePillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  quickDateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  errorBox: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 12,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  reconciliationCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  branchCountTitle: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  grossRevenueAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  breakdownRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  breakdownBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  cashBox: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  boxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cashBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#064E3B',
    textTransform: 'uppercase',
  },
  cashBoxAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#064E3B',
  },
  cashBoxSubtitle: {
    fontSize: 10,
    color: '#047857',
    marginTop: 4,
  },
  digitalBox: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  digitalBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E3A8A',
    textTransform: 'uppercase',
  },
  digitalBoxAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E3A8A',
  },
  digitalBoxSubtitle: {
    fontSize: 10,
    color: '#1D4ED8',
    marginTop: 4,
  },
  dubeSettledRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dubeSettledLabel: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  dubeSettledAmount: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B45309',
  },
  auditsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  auditsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  auditsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  auditsSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  branchAuditCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  branchAuditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  branchNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  branchCashierText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
    marginTop: 2,
  },
  branchInflowLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  branchInflowAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#065F46',
    marginTop: 1,
  },
  channelRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  channelCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  channelColLabel: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },
  channelColValue: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  expensesCallout: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  expensesCalloutLabel: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '600',
  },
  expensesCalloutAmount: {
    fontSize: 11,
    fontWeight: '900',
    color: '#DC2626',
  },
  debtsSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  debtsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  debtsSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  debtsAuditNotice: {
    fontSize: 10,
    color: '#64748B',
  },
  noDebtsText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  debtAuditRow: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  debtCustomerName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  debtAttributionText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  debtSettledAmount: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B45309',
  },
});
