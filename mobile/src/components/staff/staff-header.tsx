import React, { useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Branch Lock Identifier */}
        <View style={styles.branchLockContainer}>
          <Text style={styles.businessName} numberOfLines={1}>
            {assignedBusinessName || 'NetWorth POS'}
          </Text>
          <View style={styles.branchRow}>
            <Text style={styles.branchName} numberOfLines={1}>
              {assignedBranchName || 'Branch Counter'}
            </Text>
            <View style={styles.lockedPill}>
              <Text style={styles.lockedText}>🔒 LOCKED</Text>
            </View>
          </View>
        </View>

        {/* Cashier Chip & Actions */}
        <View style={styles.actionsRow}>
          {/* Refresh Action */}
          <Pressable
            onPress={handleManualRefresh}
            disabled={isRefreshing}
            style={styles.iconBtn}
            hitSlop={6}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#065F46" />
            ) : (
              <RefreshCwIcon size={14} color="#64748B" />
            )}
          </Pressable>

          {/* Cashier profile attribution chip */}
          <View style={styles.cashierChip}>
            <Text style={styles.cashierText}>
              👤 {staffProfile?.name || 'Sales Staff'}
            </Text>
          </View>

          {/* Logout Action */}
          <Pressable
            onPress={handleLogout}
            style={[styles.iconBtn, styles.logoutBtn]}
            hitSlop={6}
          >
            <LogOutIcon size={14} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  branchLockContainer: {
    flex: 1,
    marginRight: 8,
  },
  businessName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  branchName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 6,
  },
  lockedPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  cashierChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashierText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});
