import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStaffStore } from '@/store/staff-store';
import { localExpensesRepo } from '@/repositories/local-expenses.repo';
import type { ExpenseEntry } from '@/types/sales';
import { StaffHeader } from '@/components/staff/staff-header';
import { AddStaffExpenseModal } from '@/components/staff/add-expense-modal';
import { PlusIcon } from '@/components/icons';

export default function StaffExpensesScreen() {
  const assignedBusinessId = useStaffStore((s) => s.assignedBusinessId);
  const assignedBranchId = useStaffStore((s) => s.assignedBranchId);
  const refreshShiftMetrics = useStaffStore((s) => s.refreshShiftMetrics);

  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadTodayExpenses = useCallback(async () => {
    if (!assignedBusinessId || !assignedBranchId) return;

    try {
      const allExpenses = await localExpensesRepo.getExpenses(
        assignedBusinessId,
        assignedBranchId,
        50
      );

      // Filter for today's expenses
      const now = new Date();
      const todayYear = now.getFullYear();
      const todayMonth = now.getMonth();
      const todayDate = now.getDate();

      const todayList = allExpenses.filter((item) => {
        if (!item.createdAt) return true;
        const d = new Date(item.createdAt);
        return (
          d.getFullYear() === todayYear &&
          d.getMonth() === todayMonth &&
          d.getDate() === todayDate
        );
      });

      setExpenses(todayList);
    } catch (err) {
      console.error('[StaffExpensesScreen] Failed to load expenses:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [assignedBusinessId, assignedBranchId]);

  useEffect(() => {
    loadTodayExpenses();
  }, [loadTodayExpenses]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadTodayExpenses(), refreshShiftMetrics()]);
  };

  const totalShiftExpenses = useMemo(() => {
    return expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  }, [expenses]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-950">
      <StaffHeader onRefresh={handleRefresh} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#EF4444"
            colors={['#EF4444']}
          />
        }
      >
        {/* Expenses Hero Summary Card */}
        <View className="mx-4 mt-3 rounded-2xl bg-slate-900 border border-red-900/50 p-4 shadow-sm">
          <View className="flex-row items-center justify-between pb-2 border-b border-slate-800">
            <View>
              <Text className="text-[11px] font-extrabold text-red-400 uppercase tracking-wider">
                Branch Petty Operating Expenses
              </Text>
              <Text className="text-xs text-slate-400 mt-0.5">
                Paid out of counter cash / drawer
              </Text>
            </View>

            <View className="bg-red-950/60 px-2.5 py-1 rounded-full border border-red-800/40">
              <Text className="text-[11px] font-bold text-red-300">
                {expenses.length} Records Today
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-3">
            <View>
              <Text className="text-[10px] text-slate-400 uppercase font-semibold">
                Total Expenses Deducted
              </Text>
              <Text className="text-2xl font-black text-red-400">
                -{totalShiftExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
              </Text>
            </View>

            <View className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Text className="text-[10px] text-slate-400">Drawer Cash Adjusted</Text>
            </View>
          </View>
        </View>

        {/* Action Button: Record Expense */}
        <View className="mx-4 mt-3.5">
          <Pressable
            onPress={() => setShowAddModal(true)}
            className="w-full py-3.5 px-4 bg-red-600 rounded-2xl flex-row items-center justify-center border border-red-500 shadow-sm active:opacity-85"
          >
            <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center mr-2">
              <PlusIcon size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text className="text-white font-extrabold text-sm">Record Petty Expense</Text>
          </Pressable>
        </View>

        {/* Shift Expenses Feed Header */}
        <View className="mx-4 mt-6 flex-row items-center justify-between pb-2 border-b border-slate-800">
          <View className="flex-row items-center">
            <Text className="text-sm font-extrabold text-white mr-2">
              Today's Petty Expenses
            </Text>
            <View className="bg-slate-800 px-2 py-0.5 rounded-full">
              <Text className="text-[11px] font-bold text-slate-400">
                {expenses.length} recorded
              </Text>
            </View>
          </View>
          <Text className="text-[11px] text-slate-400">
            Locked to this branch
          </Text>
        </View>

        {/* Expenses Feed */}
        {isLoading && expenses.length === 0 ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#EF4444" />
            <Text className="text-slate-400 text-xs mt-3">Loading branch expenses...</Text>
          </View>
        ) : expenses.length === 0 ? (
          <View className="mx-4 mt-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-8 items-center justify-center">
            <Text className="text-3xl mb-2">💸</Text>
            <Text className="text-slate-200 font-bold text-sm text-center">
              No expenses recorded today
            </Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Tap &quot;Record Petty Expense&quot; for packaging, supplies, or transport.
            </Text>
          </View>
        ) : (
          <View className="mx-4 mt-2">
            {expenses.map((item) => (
              <View
                key={item.id}
                className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 mb-2.5 flex-row items-center justify-between shadow-sm"
              >
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-1">
                    <View className="px-2 py-0.5 rounded-md bg-red-950/60 border border-red-700/60 mr-2">
                      <Text className="text-[10px] font-black text-red-300">
                        {item.category || 'General'}
                      </Text>
                    </View>
                    <Text className="text-[11px] text-slate-400">
                      {item.time || 'Today'}
                    </Text>
                  </View>

                  <Text className="text-sm font-bold text-slate-100" numberOfLines={1}>
                    {item.description}
                  </Text>

                  {item.notes && (
                    <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
                      Note: {item.notes}
                    </Text>
                  )}

                  {item.recordedByName && (
                    <Text className="text-[10px] text-red-400/80 mt-1">
                      Cashier: {item.recordedByName}
                    </Text>
                  )}
                </View>

                <View className="items-end">
                  <Text className="text-base font-black text-red-400">
                    -{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text className="text-[10px] text-slate-400 font-semibold">ETB</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Staff Expense Modal */}
      <AddStaffExpenseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleRefresh}
      />
    </SafeAreaView>
  );
}
