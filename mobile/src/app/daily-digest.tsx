import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useBusinessStore } from '@/store/business-store';
import * as staffService from '@/service/staff';
import { localStaffRepo } from '@/repositories/local-staff.repo';
import type { DailyDigestResponse, BranchDailyDigest } from '@/types/staff';
import { CalendarIcon, ChevronRightIcon, RefreshCwIcon } from '@/components/icons';

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
        // 1. Try remote fetch from backend (/api/branches/daily-digest)
        const res = await staffService.fetchDailyDigest(activeBusiness.id, dateStr);
        setDigest(res);
      } catch (err: any) {
        console.warn('[DailyDigest] Remote fetch failed, using local SQLite fallback:', err.message);

        // 2. Offline Fallback: Aggregate local SQLite branch metrics
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

    // Prevent selecting future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj > today) return;

    setSelectedDate(formatDateString(dateObj));
  };

  const isToday = selectedDate === formatDateString(new Date());

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-950">
      {/* Top Navigation Bar */}
      <View className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center active:opacity-70 py-1"
          hitSlop={8}
        >
          <Text className="text-emerald-400 font-bold text-base mr-1">←</Text>
          <Text className="text-white font-extrabold text-base">Back</Text>
        </Pressable>

        <View className="items-center">
          <Text className="text-base font-extrabold text-white">Daily Branch Digest</Text>
          <Text className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            {activeBusiness?.name || 'Multi-Branch Reconciliation'}
          </Text>
        </View>

        <Pressable
          onPress={handleRefresh}
          className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 items-center justify-center active:opacity-70"
          hitSlop={6}
        >
          <RefreshCwIcon size={14} color="#94A3B8" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* Date Selector Pill */}
        <View className="mx-4 mt-3 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex-row items-center justify-between shadow-sm">
          <Pressable
            onPress={() => handleShiftDate(-1)}
            className="w-8 h-8 rounded-xl bg-slate-800 items-center justify-center border border-slate-700 active:opacity-70"
          >
            <Text className="text-slate-300 font-black text-sm">◀</Text>
          </Pressable>

          <View className="flex-row items-center gap-2">
            <CalendarIcon size={16} color="#10B981" />
            <Text className="text-sm font-extrabold text-white">
              {formatDisplayDate(selectedDate)}
            </Text>
            <Text className="text-xs text-slate-400">({selectedDate})</Text>
          </View>

          <Pressable
            onPress={() => handleShiftDate(1)}
            disabled={isToday}
            className={`w-8 h-8 rounded-xl items-center justify-center border ${
              isToday
                ? 'bg-slate-950 border-slate-800 opacity-30'
                : 'bg-slate-800 border-slate-700 active:opacity-70'
            }`}
          >
            <Text className="text-slate-300 font-black text-sm">▶</Text>
          </Pressable>
        </View>

        {/* Quick Date Short-Cuts */}
        <View className="mx-4 mt-2 flex-row gap-2">
          <Pressable
            onPress={() => setSelectedDate(formatDateString(new Date()))}
            className={`py-1 px-3 rounded-full border ${
              isToday ? 'bg-emerald-600/30 border-emerald-500' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <Text className={`text-xs font-bold ${isToday ? 'text-emerald-300' : 'text-slate-400'}`}>
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
                className={`py-1 px-3 rounded-full border ${
                  isYesterday ? 'bg-emerald-600/30 border-emerald-500' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <Text className={`text-xs font-bold ${isYesterday ? 'text-emerald-300' : 'text-slate-400'}`}>
                  Yesterday
                </Text>
              </Pressable>
            );
          })()}
        </View>

        {errorMsg ? (
          <View className="mx-4 mt-3 bg-red-950/60 border border-red-800/80 p-3 rounded-xl">
            <Text className="text-xs text-red-300 font-semibold">{errorMsg}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color="#10B981" />
            <Text className="text-slate-400 text-xs mt-3">Compiling multi-branch daily audit...</Text>
          </View>
        ) : !digest ? (
          <View className="mx-4 mt-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl items-center">
            <Text className="text-3xl mb-2">📊</Text>
            <Text className="text-white font-bold text-sm">No digest data available</Text>
          </View>
        ) : (
          <>
            {/* COMPANY-WIDE RECONCILIATION SUMMARY */}
            <View className="mx-4 mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <View className="flex-row items-center justify-between pb-2 border-b border-slate-800">
                <Text className="text-xs font-black text-slate-300 uppercase tracking-widest">
                  Company-Wide Reconciliation
                </Text>
                <Text className="text-[11px] text-emerald-400 font-bold">
                  {digest.branches.length} Operating Branches
                </Text>
              </View>

              <View className="mt-3">
                <Text className="text-[11px] text-slate-400 uppercase font-semibold">
                  Total Gross Revenue Collected
                </Text>
                <Text className="text-2xl font-black text-white mt-0.5">
                  {digest.totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                </Text>
              </View>

              {/* 2-Column Physical Cash vs Digital Mobile Money Breakdown */}
              <View className="mt-3.5 flex-row gap-2.5">
                {/* Physical Cash in Drawers */}
                <View className="flex-1 bg-emerald-950/60 border border-emerald-600/40 rounded-xl p-3">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <Text className="text-base">💵</Text>
                    <Text className="text-[11px] font-extrabold text-emerald-300 uppercase">
                      Physical Cash
                    </Text>
                  </View>
                  <Text className="text-base font-black text-white">
                    {digest.totalCashInDrawer.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                  </Text>
                  <Text className="text-[10px] text-emerald-400/80 mt-1">
                    To collect from branch drawers
                  </Text>
                </View>

                {/* Digital Bank Trails */}
                <View className="flex-1 bg-blue-950/60 border border-blue-600/40 rounded-xl p-3">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <Text className="text-base">📱</Text>
                    <Text className="text-[11px] font-extrabold text-blue-300 uppercase">
                      Digital Trails
                    </Text>
                  </View>
                  <Text className="text-base font-black text-white">
                    {digest.totalDigitalInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                  </Text>
                  <Text className="text-[10px] text-blue-400/80 mt-1">
                    Telebirr & CBE in bank accounts
                  </Text>
                </View>
              </View>

              {/* Settled Debt Volume */}
              {digest.totalDubeSettled > 0 && (
                <View className="mt-2.5 pt-2 border-t border-slate-800/80 flex-row items-center justify-between">
                  <Text className="text-xs text-amber-400 font-semibold">
                    👥 Customer Debts Recovered:
                  </Text>
                  <Text className="text-xs font-black text-amber-300">
                    +{digest.totalDubeSettled.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                  </Text>
                </View>
              )}
            </View>

            {/* BRANCH COUNTER AUDITS LIST */}
            <View className="mx-4 mt-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">
                  Branch Counter Audits
                </Text>
                <Text className="text-[11px] text-slate-400">
                  Daily Store Breakdown
                </Text>
              </View>

              {digest.branches.map((b) => (
                <View
                  key={b.branchId}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3.5 shadow-sm"
                >
                  {/* Branch Card Header */}
                  <View className="flex-row items-center justify-between pb-2.5 border-b border-slate-800">
                    <View className="flex-1 mr-2">
                      <Text className="text-sm font-extrabold text-white">
                        🏬 {b.branchName}
                      </Text>
                      {b.cashierName && (
                        <Text className="text-xs text-emerald-400 font-semibold mt-0.5">
                          Cashier: {b.cashierName}
                        </Text>
                      )}
                    </View>

                    <View className="items-end">
                      <Text className="text-[10px] text-slate-400 uppercase font-semibold">
                        Branch Inflow
                      </Text>
                      <Text className="text-base font-black text-emerald-400">
                        {b.metrics.grossInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </Text>
                    </View>
                  </View>

                  {/* Channel Breakdown */}
                  <View className="mt-3 flex-row gap-2">
                    <View className="flex-1 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <Text className="text-[10px] text-slate-400 font-semibold">💵 Cash in Drawer</Text>
                      <Text className="text-xs font-black text-white mt-0.5">
                        {b.metrics.cashVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </Text>
                    </View>

                    <View className="flex-1 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <Text className="text-[10px] text-slate-400 font-semibold">📱 Telebirr</Text>
                      <Text className="text-xs font-black text-white mt-0.5">
                        {b.metrics.telebirrVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </Text>
                    </View>

                    <View className="flex-1 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <Text className="text-[10px] text-slate-400 font-semibold">🏦 CBE Birr</Text>
                      <Text className="text-xs font-black text-white mt-0.5">
                        {b.metrics.cbeVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </Text>
                    </View>
                  </View>

                  {/* Expenses Callout */}
                  {b.metrics.expenseVolume > 0 && (
                    <View className="mt-2.5 flex-row items-center justify-between bg-red-950/30 border border-red-900/40 px-3 py-1.5 rounded-xl">
                      <Text className="text-[11px] text-red-300 font-semibold">
                        💸 Petty Expenses Deducted:
                      </Text>
                      <Text className="text-[11px] font-black text-red-400">
                        -{b.metrics.expenseVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </Text>
                    </View>
                  )}

                  {/* Settled Debts Feed */}
                  <View className="mt-3 pt-2.5 border-t border-slate-800/80">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs font-bold text-amber-300">
                        👥 Debts Settled ({b.settledDebtsToday.length})
                      </Text>
                      {b.settledDebtsToday.length > 0 && (
                        <Text className="text-[10px] text-slate-400">
                          Cashier Audit Trail
                        </Text>
                      )}
                    </View>

                    {b.settledDebtsToday.length === 0 ? (
                      <Text className="text-[11px] text-slate-500 italic">
                        No customer credit was settled at this branch on this day.
                      </Text>
                    ) : (
                      <View className="gap-1.5 mt-1">
                        {b.settledDebtsToday.map((debt) => (
                          <View
                            key={debt.saleId}
                            className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex-row items-center justify-between"
                          >
                            <View className="flex-1 mr-2">
                              <Text className="text-xs font-bold text-white">
                                {debt.customerName || 'Customer'}
                              </Text>
                              <Text className="text-[10px] text-slate-400 mt-0.5">
                                Logged by {debt.recordedByName || 'Cashier'} · {debt.paymentMethod.toUpperCase()}
                              </Text>
                            </View>
                            <Text className="text-xs font-black text-amber-300">
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
