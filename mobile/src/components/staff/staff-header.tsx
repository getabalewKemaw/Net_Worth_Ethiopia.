import React, { useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useStaffStore } from '@/store/staff-store';
import { authClient } from '@/lib/auth-client';
import { router } from 'expo-router';
import { LogOutIcon, RefreshCwIcon } from '@/components/icons';

interface StaffHeaderProps {
  onRefresh?: () => Promise<void>;
}

export function StaffHeader({ onRefresh }: StaffHeaderProps) {
  const staffProfile = useStaffStore((s) => s.staffProfile);
  const assignedBranchName = useStaffStore((s) => s.assignedBranchName);
  const assignedBusinessName = useStaffStore((s) => s.assignedBusinessName);
  const clearStaffSession = useStaffStore((s) => s.clearStaffSession);
  const refreshShiftMetrics = useStaffStore((s) => s.refreshShiftMetrics);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    try {
      setIsRefreshing(true);
      await refreshShiftMetrics();
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error('[StaffHeader] Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out of Shift',
      `Are you sure you want to exit your counter shift for ${assignedBranchName || 'this branch'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authClient.signOut();
              clearStaffSession();
              router.replace('/(auth)/login');
            } catch (err) {
              console.error('[StaffHeader] Logout failed:', err);
              clearStaffSession();
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="bg-slate-900 px-4 pt-2 pb-3 border-b border-slate-800">
      <View className="flex-row items-center justify-between">
        {/* Branch Lock Identifier */}
        <View className="flex-1 mr-2">
          <Text className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest" numberOfLines={1}>
            {assignedBusinessName || 'NetWorth POS'}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <Text className="text-base font-extrabold text-white mr-1.5" numberOfLines={1}>
              {assignedBranchName || 'Branch Counter'}
            </Text>
            <View className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 flex-row items-center">
              <Text className="text-[10px] text-slate-300 font-bold">🔒 LOCKED</Text>
            </View>
          </View>
        </View>

        {/* Cashier Chip & Actions */}
        <View className="flex-row items-center gap-2">
          {/* Refresh Action */}
          <Pressable
            onPress={handleManualRefresh}
            disabled={isRefreshing}
            className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center border border-slate-700 active:opacity-70"
            hitSlop={6}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <RefreshCwIcon size={14} color="#94A3B8" />
            )}
          </Pressable>

          {/* Cashier profile attribution chip */}
          <View className="bg-slate-800/90 px-2.5 py-1.5 rounded-full border border-slate-700 flex-row items-center">
            <Text className="text-xs font-semibold text-emerald-300">
              👤 {staffProfile?.name || 'Sales Staff'}
            </Text>
          </View>

          {/* Logout Action */}
          <Pressable
            onPress={handleLogout}
            className="w-8 h-8 rounded-full bg-red-950/40 items-center justify-center border border-red-800/50 active:opacity-70"
            hitSlop={6}
          >
            <LogOutIcon size={14} color="#F87171" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
