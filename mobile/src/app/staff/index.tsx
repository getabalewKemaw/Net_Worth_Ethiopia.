import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStaffStore } from '@/store/staff-store';
import { authClient } from '@/lib/auth-client';
import { router } from 'expo-router';

export default function StaffIndexScreen() {
  const staffProfile = useStaffStore((s) => s.staffProfile);
  const assignedBranchName = useStaffStore((s) => s.assignedBranchName);
  const assignedBusinessName = useStaffStore((s) => s.assignedBusinessName);
  const clearStaffSession = useStaffStore((s) => s.clearStaffSession);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      clearStaffSession();
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900 px-6 py-4 justify-between">
      <View>
        {/* Top Header / Branch Lock Banner */}
        <View className="flex-row items-center justify-between py-3 border-b border-slate-800">
          <View>
            <Text className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              {assignedBusinessName || 'NetWorth Ethiopia'}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-lg font-bold text-white mr-2">
                {assignedBranchName || 'Assigned Branch'}
              </Text>
              <Text className="text-sm">🔒</Text>
            </View>
          </View>
          <View className="bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <Text className="text-xs font-medium text-slate-300">
              👤 {staffProfile?.name || 'Cashier (Sales)'}
            </Text>
          </View>
        </View>

        {/* Counter Status Notice */}
        <View className="mt-8 bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
          <Text className="text-emerald-400 font-semibold text-base mb-2">
            ✓ Branch Locked POS Counter
          </Text>
          <Text className="text-slate-300 text-sm leading-relaxed mb-4">
            You are authenticated as counter sales staff. Your shift sales, petty expenses, and customer credit (Dube) operations are strictly isolated to this location.
          </Text>
          <View className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-800/40">
            <Text className="text-xs text-emerald-300">
              Role: Sales Counter Staff · Zero profit metrics exposed · Transparent branch attribution active.
            </Text>
          </View>
        </View>
      </View>

      {/* Logout button */}
      <View className="pb-6">
        <Pressable
          onPress={handleLogout}
          className="w-full bg-red-500/20 py-4 rounded-xl border border-red-500/30 items-center active:opacity-80"
        >
          <Text className="text-red-400 font-semibold text-base">Sign Out of Shift</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
