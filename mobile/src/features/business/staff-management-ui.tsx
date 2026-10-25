import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useBusinessStore } from '@/store/business-store';
import * as staffService from '@/service/staff';
import { localStaffRepo } from '@/repositories/local-staff.repo';
import type { StaffAssignment, StaffRole } from '@/types/staff';
import { UserIcon, PlusIcon, XIcon, CheckCircleIcon, SearchIcon } from '@/components/icons';

interface StaffWithBranch extends StaffAssignment {
  branchName?: string;
}

export function StaffManagementUI() {
  const colors = useTheme();
  const activeBusiness = useBusinessStore((s) => s.activeBusiness);
  const branches = useBusinessStore((s) => s.branches);

  const [staffList, setStaffList] = useState<StaffWithBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Assign Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [modalBranchId, setModalBranchId] = useState<string>('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalRole, setModalRole] = useState<StaffRole>('sales');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAllStaff = useCallback(async () => {
    if (!branches || branches.length === 0) {
      setStaffList([]);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const perBranch = await Promise.all(
        branches.map(async (b) => {
          try {
            const list = await staffService.fetchBranchStaff(b.id);
            return list.map((s) => ({ ...s, branchName: b.name }));
          } catch {
            const cached = await localStaffRepo.getStaffAssignmentsByBranch(b.id);
            return cached.map((c) => ({
              id: c.id,
              businessId: c.business_id,
              branchId: c.branch_id,
              userId: c.user_id,
              email: c.email,
              name: c.name,
              role: c.role as StaffRole,
              status: c.status as any,
              createdAt: c.created_at,
              updatedAt: c.updated_at,
              branchName: b.name,
            }));
          }
        })
      );

      const flattened = perBranch.flat();
      setStaffList(flattened);
    } catch (err) {
      console.error('[StaffManagement] Failed to load staff:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [branches]);

  useEffect(() => {
    setIsLoading(true);
    loadAllStaff();
  }, [loadAllStaff]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAllStaff();
  };

  const handleRevokeStaff = (staff: StaffWithBranch) => {
    Alert.alert(
      'Revoke Staff Access',
      `Are you sure you want to remove ${staff.name || staff.email} from ${staff.branchName || 'their branch'}? They will no longer be authorized to record transactions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await staffService.revokeStaff(staff.branchId, staff.id);
              await localStaffRepo.deleteStaffAssignment(staff.id);
              Alert.alert('Access Revoked', `${staff.email} has been removed.`);
              loadAllStaff();
            } catch (err: any) {
              Alert.alert('Revocation Failed', err.message || 'Could not revoke staff access.');
            }
          },
        },
      ]
    );
  };

  const openAssignModal = () => {
    setModalBranchId(branches[0]?.id || '');
    setModalEmail('');
    setModalName('');
    setModalRole('sales');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    const trimmedEmail = modalEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!modalBranchId) {
      Alert.alert('Branch Required', 'Please select a branch to assign the staff member to.');
      return;
    }

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      Alert.alert('Valid Email Required', 'Please enter a valid staff email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      await staffService.assignStaff(modalBranchId, {
        email: trimmedEmail,
        name: modalName.trim() || undefined,
        role: modalRole,
      });

      setShowAssignModal(false);
      const targetBranch = branches.find((b) => b.id === modalBranchId);
      Alert.alert(
        'Staff Assigned',
        `${trimmedEmail} has been assigned to ${targetBranch?.name || 'the branch'}. Their branch counter access will activate immediately when they sign in.`
      );
      loadAllStaff();
    } catch (err: any) {
      Alert.alert('Assignment Failed', err.message || 'Could not assign staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter((item) => {
      const matchBranch = selectedBranchFilter === 'all' || item.branchId === selectedBranchFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.email.toLowerCase().includes(q) ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.branchName && item.branchName.toLowerCase().includes(q));

      return matchBranch && matchQuery;
    });
  }, [staffList, selectedBranchFilter, searchQuery]);

  const activeCount = useMemo(() => staffList.filter((s) => s.status === 'active').length, [staffList]);
  const pendingCount = useMemo(() => staffList.filter((s) => s.status === 'pending').length, [staffList]);

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Top Header */}
      <View className="px-5 pt-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <Pressable className="self-start mb-2 active:opacity-70" onPress={() => router.back()}>
          <ThemedText style={{ color: colors.primary, fontWeight: '700' }}>← Back</ThemedText>
        </Pressable>

        <View className="flex-row items-center justify-between">
          <View>
            <ThemedText type="title" className="text-2xl font-extrabold">
              Staff & Roles
            </ThemedText>
            <ThemedText className="text-xs text-[#60646C]">
              {activeBusiness?.name || 'Company'} · Branch Counter Cashiers
            </ThemedText>
          </View>

          <Pressable
            onPress={openAssignModal}
            className="px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <PlusIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
            <ThemedText className="text-white font-bold text-xs">Assign Staff</ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* KPI Metric Cards */}
        <View className="px-5 mt-4 flex-row gap-2.5">
          <View className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
            <ThemedText className="text-[10px] font-bold text-[#60646C] uppercase">
              Total Cashiers
            </ThemedText>
            <ThemedText className="text-xl font-black mt-0.5">
              {staffList.length}
            </ThemedText>
          </View>

          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-2xl">
            <ThemedText className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
              Active Shift Staff
            </ThemedText>
            <ThemedText className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
              {activeCount}
            </ThemedText>
          </View>

          <View className="flex-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 p-3 rounded-2xl">
            <ThemedText className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
              Pending Invites
            </ThemedText>
            <ThemedText className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">
              {pendingCount}
            </ThemedText>
          </View>
        </View>

        {/* Search Input */}
        <View className="mx-5 mt-4 flex-row items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
          <SearchIcon size={16} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by cashier name, email, or branch..."
            placeholderTextColor="#64748B"
            className="flex-1 ml-2 text-xs text-slate-900 dark:text-white"
          />
        </View>

        {/* Branch Filter Pills */}
        {branches.length > 1 && (
          <View className="mt-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
              <Pressable
                onPress={() => setSelectedBranchFilter('all')}
                className={`py-1.5 px-3.5 rounded-full border ${
                  selectedBranchFilter === 'all'
                    ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <ThemedText
                  className={`text-xs font-bold ${
                    selectedBranchFilter === 'all'
                      ? 'text-white dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All Branches ({staffList.length})
                </ThemedText>
              </Pressable>

              {branches.map((b) => {
                const isSelected = selectedBranchFilter === b.id;
                const count = staffList.filter((s) => s.branchId === b.id).length;
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => setSelectedBranchFilter(b.id)}
                    className={`py-1.5 px-3.5 rounded-full border ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <ThemedText
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'text-white dark:text-slate-900'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {b.name} ({count})
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Staff Members List */}
        <View className="px-5 mt-4">
          <ThemedText className="text-xs font-bold uppercase tracking-wider text-[#60646C] mb-2.5">
            Authorized Cashiers ({filteredStaff.length})
          </ThemedText>

          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText className="text-xs text-[#60646C] mt-2">Loading staff roster...</ThemedText>
            </View>
          ) : filteredStaff.length === 0 ? (
            <View className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl items-center justify-center">
              <ThemedText className="text-3xl mb-2">👥</ThemedText>
              <ThemedText className="font-bold text-sm text-center">
                No staff cashiers found
              </ThemedText>
              <ThemedText className="text-xs text-[#60646C] text-center mt-1 mb-4">
                Assign sales cashiers by email to allow them to operate your branch counters.
              </ThemedText>
              <Pressable
                onPress={openAssignModal}
                className="px-4 py-2 rounded-xl"
                style={{ backgroundColor: colors.primary }}
              >
                <ThemedText className="text-white font-bold text-xs">+ Assign First Staff</ThemedText>
              </Pressable>
            </View>
          ) : (
            filteredStaff.map((staff) => (
              <View
                key={staff.id}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                  <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                    <View className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center">
                      <UserIcon size={16} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <ThemedText className="text-sm font-extrabold" numberOfLines={1}>
                        {staff.name || 'Sales Cashier'}
                      </ThemedText>
                      <ThemedText className="text-xs text-[#60646C]" numberOfLines={1}>
                        {staff.email}
                      </ThemedText>
                    </View>
                  </View>

                  <View
                    className={`px-2 py-0.5 rounded-full ${
                      staff.status === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    <ThemedText
                      className={`text-[10px] font-extrabold ${
                        staff.status === 'active'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {staff.status === 'active' ? '✓ ACTIVE' : '⏳ PENDING'}
                    </ThemedText>
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-2.5">
                  <View className="flex-row items-center gap-2">
                    <View className="bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      <ThemedText className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        🏬 {staff.branchName || 'Branch'}
                      </ThemedText>
                    </View>
                    <View className="bg-emerald-100/60 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                      <ThemedText className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        Role: Counter Sales
                      </ThemedText>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleRevokeStaff(staff)}
                    className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 active:opacity-75"
                  >
                    <ThemedText className="text-xs font-bold text-red-600 dark:text-red-400">
                      Remove
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Multi-Branch Assign Staff Modal */}
      <Modal visible={showAssignModal} animationType="slide" transparent onRequestClose={() => setShowAssignModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={styles.backdrop} onPress={() => setShowAssignModal(false)} />
          <View style={styles.sheet}>
            <View style={styles.handleBar} />

            <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center border border-emerald-500/30">
                  <UserIcon size={16} color="#10B981" />
                </View>
                <View>
                  <ThemedText className="text-lg font-extrabold text-white">Assign Staff Member</ThemedText>
                  <ThemedText className="text-xs text-emerald-400 font-semibold">Authorize Branch Counter Access</ThemedText>
                </View>
              </View>
              <Pressable onPress={() => setShowAssignModal(false)} hitSlop={8} className="p-1">
                <XIcon size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mt-3">
              {/* Branch Selector */}
              <View className="mb-3.5">
                <ThemedText className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                  Select Operating Branch *
                </ThemedText>
                <View className="flex-row flex-wrap gap-2">
                  {branches.map((b) => {
                    const isSelected = modalBranchId === b.id;
                    return (
                      <Pressable
                        key={b.id}
                        onPress={() => setModalBranchId(b.id)}
                        className={`py-2 px-3 rounded-xl border ${
                          isSelected ? 'bg-emerald-950/80 border-emerald-500' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <ThemedText className={`text-xs font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-400'}`}>
                          🏬 {b.name}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Email */}
              <View className="mb-3.5">
                <ThemedText className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                  Staff Email Address *
                </ThemedText>
                <TextInput
                  value={modalEmail}
                  onChangeText={setModalEmail}
                  placeholder="e.g. cashier.bole@gmail.com"
                  placeholderTextColor="#64748B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </View>

              {/* Nickname / Display Name */}
              <View className="mb-3.5">
                <ThemedText className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                  Staff Name / Nickname (Optional)
                </ThemedText>
                <TextInput
                  value={modalName}
                  onChangeText={setModalName}
                  placeholder="e.g. Chala (Day Shift)"
                  placeholderTextColor="#64748B"
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </View>

              {/* Role Selection */}
              <View className="mb-3.5">
                <ThemedText className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                  Counter Role
                </ThemedText>
                <Pressable
                  onPress={() => setModalRole('sales')}
                  className="bg-emerald-950/60 border border-emerald-500 py-2.5 px-3 rounded-xl flex-row items-center gap-2"
                >
                  <ThemedText className="text-base">🛒</ThemedText>
                  <View>
                    <ThemedText className="text-xs font-bold text-emerald-300">Sales Cashier</ThemedText>
                    <ThemedText className="text-[10px] text-slate-400">Distraction-free POS & Dube Settlement</ThemedText>
                  </View>
                </Pressable>
              </View>
            </ScrollView>

            {/* Actions */}
            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => setShowAssignModal(false)}
                className="flex-1 py-3.5 rounded-xl border border-slate-700 items-center justify-center active:opacity-70"
              >
                <ThemedText className="text-sm font-bold text-slate-300">Cancel</ThemedText>
              </Pressable>

              <Pressable
                onPress={handleAssignSubmit}
                disabled={isSubmitting}
                className="flex-2 py-3.5 px-6 rounded-xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row gap-2 active:opacity-80"
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <CheckCircleIcon size={16} color="#FFFFFF" />
                    <ThemedText className="text-sm font-black text-white">Assign Staff</ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: 12,
  },
});
