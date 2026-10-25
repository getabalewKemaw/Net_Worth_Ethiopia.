import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStaffStore } from '@/store/staff-store';
import { localBidrRepo } from '@/repositories/local-bidr.repo';
import type { DebtItem, DebtFilterStatus } from '@/types/bidr';
import { StaffHeader } from '@/components/staff/staff-header';
import { IssueDubeModal } from '@/components/staff/issue-dube-modal';
import { SettleDubeModal } from '@/components/staff/settle-dube-modal';
import { PlusIcon, SearchIcon } from '@/components/icons';

export default function StaffDubeScreen() {
  const assignedBusinessId = useStaffStore((s) => s.assignedBusinessId);
  const assignedBranchId = useStaffStore((s) => s.assignedBranchId);
  const shiftMetrics = useStaffStore((s) => s.shiftMetrics);
  const refreshShiftMetrics = useStaffStore((s) => s.refreshShiftMetrics);

  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<DebtFilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedDebtToSettle, setSelectedDebtToSettle] = useState<DebtItem | null>(null);

  const loadBranchDebts = useCallback(async () => {
    if (!assignedBusinessId || !assignedBranchId) return;

    try {
      const items = await localBidrRepo.getDebts(
        assignedBusinessId,
        assignedBranchId,
        {
          searchQuery: searchQuery.trim() || undefined,
          filterStatus,
        }
      );
      setDebts(items);
    } catch (err) {
      console.error('[StaffDubeScreen] Failed to load debts:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [assignedBusinessId, assignedBranchId, searchQuery, filterStatus]);

  useEffect(() => {
    loadBranchDebts();
  }, [loadBranchDebts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadBranchDebts(), refreshShiftMetrics()]);
  };

  const totalActiveCredit = useMemo(() => {
    return debts
      .filter((d) => d.status === 'pending')
      .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  }, [debts]);

  const isOverdue = (dueDateStr?: string | null): boolean => {
    if (!dueDateStr) return false;
    const due = new Date(dueDateStr);
    if (isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <StaffHeader onRefresh={handleRefresh} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#065F46"
            colors={['#065F46']}
          />
        }
      >
        {/* Dube Ledger Hero Card */}
        <View className="mx-4 mt-3 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <View className="flex-row items-center justify-between pb-2 border-b border-slate-100">
            <View>
              <Text className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider">
                Branch Customer Credit Notebook
              </Text>
              <Text className="text-xs text-slate-500 mt-0.5">
                Outstanding Dube Ledger
              </Text>
            </View>

            <View className="bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Text className="text-[11px] font-bold text-amber-800">
                {debts.filter((d) => d.status === 'pending').length} Active Debts
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-3">
            <View>
              <Text className="text-[10px] text-slate-500 uppercase font-semibold">
                Total Outstanding Credit
              </Text>
              <Text className="text-xl font-black text-slate-900">
                {totalActiveCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[10px] text-slate-500 uppercase font-semibold">
                Recovered Today
              </Text>
              <Text className="text-base font-extrabold text-[#065F46]">
                +{(shiftMetrics?.dubeRecovered ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button: Issue Customer Dube */}
        <View className="mx-4 mt-3.5">
          <Pressable
            onPress={() => setShowIssueModal(true)}
            className="w-full py-3.5 px-4 bg-[#065F46] rounded-2xl flex-row items-center justify-center border border-emerald-800 shadow-sm active:opacity-85"
          >
            <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center mr-2">
              <PlusIcon size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text className="text-white font-extrabold text-sm">Issue Customer Dube</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="mx-4 mt-3.5 flex-row items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <SearchIcon size={16} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by customer name or phone..."
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-2 text-xs text-slate-900"
          />
        </View>

        {/* Filter Pills */}
        <View className="mx-4 mt-3 flex-row gap-2">
          {(['all', 'pending', 'settled'] as DebtFilterStatus[]).map((st) => {
            const isSelected = filterStatus === st;
            const label = st === 'all' ? 'All' : st === 'pending' ? 'Active Credit' : 'Settled History';
            return (
              <Pressable
                key={st}
                onPress={() => setFilterStatus(st)}
                className={`py-1.5 px-3 rounded-full border ${
                  isSelected
                    ? 'bg-[#065F46] border-[#065F46]'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Debt Cards Feed */}
        {isLoading && debts.length === 0 ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#065F46" />
            <Text className="text-slate-500 text-xs mt-3">Loading branch customer credit...</Text>
          </View>
        ) : debts.length === 0 ? (
          <View className="mx-4 mt-4 bg-white border border-slate-200 rounded-2xl p-8 items-center justify-center shadow-sm">
            <Text className="text-3xl mb-2">👥</Text>
            <Text className="text-slate-900 font-bold text-sm text-center">
              No customer credit records found
            </Text>
            <Text className="text-slate-500 text-xs text-center mt-1">
              Tap &quot;Issue Customer Dube&quot; to give store credit to trusted buyers.
            </Text>
          </View>
        ) : (
          <View className="mx-4 mt-3">
            {debts.map((item) => {
              const isSettled = item.status === 'settled';
              const overdue = !isSettled && isOverdue(item.dueDate);

              return (
                <View
                  key={item.id}
                  className={`bg-white border rounded-2xl p-3.5 mb-2.5 shadow-sm ${
                    isSettled
                      ? 'border-slate-200 opacity-75'
                      : overdue
                      ? 'border-red-200 bg-red-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <View className="flex-row items-center justify-between pb-2 border-b border-slate-100">
                    <View className="flex-1 mr-2">
                      <Text className="text-sm font-extrabold text-slate-900" numberOfLines={1}>
                        {item.customerName || 'Customer'}
                      </Text>
                      {item.customerPhone && (
                        <Text className="text-xs text-slate-500 mt-0.5">
                          📞 {item.customerPhone}
                        </Text>
                      )}
                    </View>

                    <View className="items-end">
                      <Text className={`text-base font-black ${isSettled ? 'text-slate-400' : 'text-amber-700'}`}>
                        {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </Text>
                      <View className="flex-row items-center mt-0.5">
                        <View
                          className={`px-1.5 py-0.5 rounded ${
                            isSettled
                              ? 'bg-slate-100'
                              : overdue
                              ? 'bg-red-50 border border-red-200'
                              : 'bg-amber-50 border border-amber-200'
                          }`}
                        >
                          <Text
                            className={`text-[9px] font-bold ${
                              isSettled ? 'text-slate-600' : overdue ? 'text-red-700' : 'text-amber-800'
                            }`}
                          >
                            {isSettled ? '✓ SETTLED' : overdue ? '⚠️ OVERDUE' : '⏳ ACTIVE'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between pt-2.5">
                    <View className="flex-1 mr-2">
                      {item.description && (
                        <Text className="text-xs text-slate-700" numberOfLines={1}>
                          {item.description}
                        </Text>
                      )}
                      <Text className="text-[10px] text-slate-500 mt-0.5">
                        Due: {item.dueDate || 'No promised date'}
                      </Text>
                    </View>

                    {!isSettled && (
                      <Pressable
                        onPress={() => setSelectedDebtToSettle(item)}
                        className="py-1.5 px-3.5 bg-[#065F46] rounded-xl active:opacity-85"
                      >
                        <Text className="text-xs font-black text-white">Settle Debt</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Issue Dube Modal */}
      <IssueDubeModal
        visible={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        onSuccess={handleRefresh}
      />

      {/* Settle Debt Modal */}
      <SettleDubeModal
        visible={Boolean(selectedDebtToSettle)}
        debt={selectedDebtToSettle}
        onClose={() => setSelectedDebtToSettle(null)}
        onSuccess={handleRefresh}
      />
    </SafeAreaView>
  );
}
