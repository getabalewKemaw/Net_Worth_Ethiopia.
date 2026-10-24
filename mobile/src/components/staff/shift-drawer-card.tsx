import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useStaffStore } from '@/store/staff-store';

export function ShiftDrawerCard() {
  const shiftMetrics = useStaffStore((s) => s.shiftMetrics);
  const assignedBranchName = useStaffStore((s) => s.assignedBranchName);

  const cashInDrawer = shiftMetrics?.netCashInDrawer ?? shiftMetrics?.cashInDrawer ?? 0;
  const telebirr = shiftMetrics?.telebirrCollected ?? 0;
  const cbeBirr = shiftMetrics?.cbeBirrCollected ?? 0;
  const dubeSettled = shiftMetrics?.dubeRecovered ?? 0;
  const totalVolume = shiftMetrics?.totalShiftVolume ?? (cashInDrawer + telebirr + cbeBirr);
  const expenses = shiftMetrics?.expenseVolume ?? 0;

  return (
    <View className="mx-4 mt-3 rounded-2xl bg-slate-900 border border-emerald-900/60 p-4 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center justify-between pb-2 border-b border-slate-800">
        <View>
          <Text className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">
            Today's Shift Drawer
          </Text>
          <Text className="text-xs text-slate-400 mt-0.5">
            {assignedBranchName ? `${assignedBranchName} Counter` : 'Shift Reconciliation'}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-[10px] text-slate-400 uppercase font-semibold">
            Shift Volume
          </Text>
          <Text className="text-sm font-extrabold text-white">
            {totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
          </Text>
        </View>
      </View>

      {/* Primary Drawer Cash Callout */}
      <View className="mt-3 bg-emerald-950/70 border border-emerald-600/40 rounded-xl p-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 items-center justify-center mr-3">
            <Text className="text-lg">💵</Text>
          </View>
          <View>
            <Text className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
              Physical Cash in Drawer
            </Text>
            <Text className="text-[11px] text-emerald-400/80">
              Handover count at shift close
            </Text>
          </View>
        </View>
        <Text className="text-lg font-black text-emerald-400">
          {cashInDrawer.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
        </Text>
      </View>

      {/* Digital Mobile Money & Debt Recovery Breakdown */}
      <View className="grid grid-cols-3 flex-row gap-2 mt-2.5">
        {/* Telebirr */}
        <View className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[10px] font-bold text-violet-400 uppercase">
              📱 Telebirr
            </Text>
          </View>
          <Text className="text-xs font-black text-white" numberOfLines={1}>
            {telebirr.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ETB
          </Text>
        </View>

        {/* CBE Birr */}
        <View className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[10px] font-bold text-blue-400 uppercase">
              🏦 CBE Birr
            </Text>
          </View>
          <Text className="text-xs font-black text-white" numberOfLines={1}>
            {cbeBirr.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ETB
          </Text>
        </View>

        {/* Dube Settled */}
        <View className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[10px] font-bold text-amber-400 uppercase">
              👥 Dube Settled
            </Text>
          </View>
          <Text className="text-xs font-black text-amber-300" numberOfLines={1}>
            {dubeSettled.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ETB
          </Text>
        </View>
      </View>

      {/* Expenses Drawer Deduction Notice */}
      {expenses > 0 && (
        <View className="mt-2.5 pt-2 border-t border-slate-800/60 flex-row items-center justify-between">
          <Text className="text-[11px] text-slate-400">
            💸 Petty Expenses Paid:
          </Text>
          <Text className="text-[11px] font-bold text-red-400">
            -{expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
          </Text>
        </View>
      )}
    </View>
  );
}
