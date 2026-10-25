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
import { useStaffStore } from '@/store/staff-store';
import { localSalesRepo } from '@/repositories/local-sales.repo';
import type { SaleEntry } from '@/types/sales';
import { StaffHeader } from '@/components/staff/staff-header';
import { ShiftDrawerCard } from '@/components/staff/shift-drawer-card';
import { QuickSaleModal } from '@/components/staff/quick-sale-modal';
import { PlusIcon } from '@/components/icons';

export default function StaffSalesScreen() {
  const assignedBusinessId = useStaffStore((s) => s.assignedBusinessId);
  const assignedBranchId = useStaffStore((s) => s.assignedBranchId);
  const refreshShiftMetrics = useStaffStore((s) => s.refreshShiftMetrics);

  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQuickSaleModal, setShowQuickSaleModal] = useState(false);

  const loadTodaySales = useCallback(async () => {
    if (!assignedBusinessId || !assignedBranchId) return;

    try {
      // Fetch all local sales for this branch
      const branchSales = await localSalesRepo.getSales(
        assignedBusinessId,
        assignedBranchId,
        50
      );

      // Filter for today's transactions
      const now = new Date();
      const todayYear = now.getFullYear();
      const todayMonth = now.getMonth();
      const todayDate = now.getDate();

      const todayList = branchSales.filter((item) => {
        if (!item.createdAt) return true;
        const d = new Date(item.createdAt);
        return (
          d.getFullYear() === todayYear &&
          d.getMonth() === todayMonth &&
          d.getDate() === todayDate
        );
      });

      setSales(todayList);
    } catch (err) {
      console.error('[StaffSalesScreen] Failed to load sales:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [assignedBusinessId, assignedBranchId]);

  useEffect(() => {
    loadTodaySales();
    refreshShiftMetrics();
  }, [loadTodaySales, refreshShiftMetrics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadTodaySales(), refreshShiftMetrics()]);
  };

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case 'telebirr':
        return { label: '📱 Telebirr', bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200' };
      case 'cbe':
        return { label: '🏦 CBE Birr', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' };
      case 'cash':
      default:
        return { label: '💵 Cash', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' };
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      {/* Shared Branch Header */}
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
        {/* Shift Drawer Card (Hero) */}
        <ShiftDrawerCard />

        {/* Counter Workspace Action Bar */}
        <View className="mx-4 mt-4 flex-row gap-3">
          <Pressable
            onPress={() => setShowQuickSaleModal(true)}
            className="flex-1 py-3.5 px-4 bg-[#065F46] rounded-2xl flex-row items-center justify-center border border-emerald-800 shadow-sm active:opacity-85"
          >
            <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center mr-2">
              <PlusIcon size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text className="text-white font-extrabold text-sm">Quick Instant Sale</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/staff/dube' as any)}
            className="py-3.5 px-4 bg-white rounded-2xl flex-row items-center justify-center border border-slate-300 shadow-sm active:opacity-85"
          >
            <Text className="text-base mr-1.5">📝</Text>
            <Text className="text-slate-800 font-bold text-sm">Issue Dube</Text>
          </Pressable>
        </View>

        {/* Shift Sales Feed Header */}
        <View className="mx-4 mt-6 flex-row items-center justify-between pb-2 border-b border-slate-200">
          <View className="flex-row items-center">
            <Text className="text-sm font-extrabold text-slate-900 mr-2">
              Shift Sales Feed
            </Text>
            <View className="bg-slate-200 px-2 py-0.5 rounded-full">
              <Text className="text-[11px] font-bold text-slate-700">
                {sales.length} today
              </Text>
            </View>
          </View>
          <Text className="text-[11px] text-slate-500">
            Auto-Attributed & Locked
          </Text>
        </View>

        {/* Sales Feed Content */}
        {isLoading && sales.length === 0 ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#065F46" />
            <Text className="text-slate-500 text-xs mt-3">Loading counter sales...</Text>
          </View>
        ) : sales.length === 0 ? (
          <View className="mx-4 mt-4 bg-white border border-slate-200 rounded-2xl p-8 items-center justify-center shadow-sm">
            <Text className="text-3xl mb-2">🛒</Text>
            <Text className="text-slate-900 font-bold text-sm text-center">
              No sales recorded this shift yet
            </Text>
            <Text className="text-slate-500 text-xs text-center mt-1 mb-4">
              Tap &quot;Quick Instant Sale&quot; to checkout walk-in customers instantly.
            </Text>
            <Pressable
              onPress={() => setShowQuickSaleModal(true)}
              className="py-2.5 px-4 bg-emerald-50 border border-emerald-200 rounded-xl"
            >
              <Text className="text-[#065F46] font-extrabold text-xs">
                + Record First Sale
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="mx-4 mt-2">
            {sales.map((item) => {
              const badge = getPaymentBadge(item.paymentMethod || 'cash');
              return (
                <View
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 mb-2.5 flex-row items-center justify-between shadow-sm"
                >
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-1">
                      <View className={`px-2 py-0.5 rounded-md border ${badge.bg} ${badge.border} mr-2`}>
                        <Text className={`text-[10px] font-black ${badge.text}`}>
                          {badge.label}
                        </Text>
                      </View>
                      <Text className="text-[11px] text-slate-400">
                        {item.time || 'Today'}
                      </Text>
                    </View>

                    <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                      {item.description || 'Instant Sale'}
                    </Text>

                    {item.customer && (
                      <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={1}>
                        Customer: {item.customer}
                      </Text>
                    )}

                    {item.recordedByName && (
                      <Text className="text-[10px] text-[#065F46] mt-1">
                        Cashier: {item.recordedByName}
                      </Text>
                    )}
                  </View>

                  <View className="items-end">
                    <Text className="text-base font-black text-[#065F46]">
                      +{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text className="text-[10px] text-slate-400 font-semibold">ETB</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Quick Instant Sale Modal */}
      <QuickSaleModal
        visible={showQuickSaleModal}
        onClose={() => setShowQuickSaleModal(false)}
        onSuccess={handleRefresh}
      />
    </SafeAreaView>
  );
}
