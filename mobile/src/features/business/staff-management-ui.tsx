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
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useBusinessStore } from '@/store/business-store';
import { useStaffStore } from '@/store/staff-store';
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

  const assignStaff = useStaffStore((s) => s.assignStaff);
  const revokeStaff = useStaffStore((s) => s.revokeStaff);

  const handleRevokeStaff = (staff: StaffWithBranch) => {
    Alert.alert(
      'Revoke Staff Access',
      `Are you sure you want to remove ${staff.name || staff.email} from ${staff.branchName || 'this branch'}? Their counter access will be immediately revoked.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Access',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeStaff(staff.branchId, staff.id);
              await loadAllStaff();
              Alert.alert('Success', 'Staff access has been revoked.');
            } catch (err: any) {
              console.error('[StaffManagement] Revoke error:', err);
              Alert.alert('Error', err?.message || 'Could not revoke staff assignment.');
            }
          },
        },
      ]
    );
  };

  const openAssignModal = () => {
    if (branches && branches.length > 0) {
      setModalBranchId(branches[0].id);
    }
    setModalEmail('');
    setModalName('');
    setModalRole('sales');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    const trimmedEmail = modalEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      Alert.alert('Missing Email', 'Please enter a valid staff email address.');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email format.');
      return;
    }
    if (!modalBranchId) {
      Alert.alert('Missing Branch', 'Please select an operating branch for this staff member.');
      return;
    }

    const alreadyAssigned = staffList.some(
      (s) => s.branchId === modalBranchId && s.email.toLowerCase() === trimmedEmail
    );
    if (alreadyAssigned) {
      Alert.alert('Already Assigned', `This email is already assigned to the selected branch.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const targetBranch = branches.find((b) => b.id === modalBranchId);

      await assignStaff(
        modalBranchId,
        trimmedEmail,
        modalName.trim() || undefined,
        modalRole
      );

      setShowAssignModal(false);
      Alert.alert(
        'Staff Assigned',
        `Assigned ${trimmedEmail} to ${targetBranch?.name || 'the branch'}. They can now sign in and operate the counter.`
      );
      await loadAllStaff();
    } catch (err: any) {
      console.error('[StaffManagement] Assign error:', err);
      Alert.alert('Error', err?.message || 'Could not assign staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchBranch = selectedBranchFilter === 'all' || s.branchId === selectedBranchFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        s.email.toLowerCase().includes(q) ||
        (s.branchName && s.branchName.toLowerCase().includes(q));
      return matchBranch && matchQuery;
    });
  }, [staffList, selectedBranchFilter, searchQuery]);

  const activeCount = useMemo(() => staffList.filter((s) => s.status === 'active').length, [staffList]);
  const pendingCount = useMemo(() => staffList.filter((s) => s.status === 'pending').length, [staffList]);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText style={{ color: colors.primary, fontWeight: '700' }}>← Back</ThemedText>
        </Pressable>

        <View style={styles.headerRow}>
          <View>
            <ThemedText type="title" style={styles.headerTitle}>
              Staff & Roles
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {activeBusiness?.name || 'Company'} · Branch Counter Cashiers
            </ThemedText>
          </View>

          <Pressable
            onPress={openAssignModal}
            style={[styles.assignBtn, { backgroundColor: colors.primary }]}
          >
            <PlusIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
            <ThemedText style={styles.assignBtnText}>Assign Staff</ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
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
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <ThemedText style={styles.kpiLabel}>Total Cashiers</ThemedText>
            <ThemedText style={styles.kpiValueDark}>{staffList.length}</ThemedText>
          </View>

          <View style={[styles.kpiCard, styles.kpiCardGreen]}>
            <ThemedText style={styles.kpiLabelGreen}>Active Shift Staff</ThemedText>
            <ThemedText style={styles.kpiValueGreen}>{activeCount}</ThemedText>
          </View>

          <View style={[styles.kpiCard, styles.kpiCardAmber]}>
            <ThemedText style={styles.kpiLabelAmber}>Pending Invites</ThemedText>
            <ThemedText style={styles.kpiValueAmber}>{pendingCount}</ThemedText>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <SearchIcon size={16} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by cashier name, email, or branch..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        {/* Branch Filter Pills */}
        {branches.length > 1 && (
          <View style={{ marginTop: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
              <Pressable
                onPress={() => setSelectedBranchFilter('all')}
                style={[
                  styles.filterPill,
                  selectedBranchFilter === 'all'
                    ? { backgroundColor: '#065F46', borderColor: '#065F46' }
                    : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.filterPillText,
                    { color: selectedBranchFilter === 'all' ? '#FFFFFF' : '#475569' },
                  ]}
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
                    style={[
                      styles.filterPill,
                      isSelected
                        ? { backgroundColor: '#065F46', borderColor: '#065F46' }
                        : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.filterPillText,
                        { color: isSelected ? '#FFFFFF' : '#475569' },
                      ]}
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
        <View style={styles.staffListContainer}>
          <ThemedText style={styles.sectionHeaderTitle}>
            Authorized Cashiers ({filteredStaff.length})
          </ThemedText>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText style={styles.loadingText}>Loading staff roster...</ThemedText>
            </View>
          ) : filteredStaff.length === 0 ? (
            <View style={styles.emptyCard}>
              <ThemedText style={{ fontSize: 36, marginBottom: 8 }}>👥</ThemedText>
              <ThemedText style={styles.emptyTitle}>
                No staff cashiers found
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Assign sales cashiers by email to allow them to operate your branch counters.
              </ThemedText>
              <Pressable
                onPress={openAssignModal}
                style={[styles.firstAssignBtn, { backgroundColor: colors.primary }]}
              >
                <ThemedText style={styles.firstAssignBtnText}>+ Assign First Staff</ThemedText>
              </Pressable>
            </View>
          ) : (
            filteredStaff.map((staff) => (
              <View key={staff.id} style={styles.staffCard}>
                <View style={styles.staffCardHeader}>
                  <View style={styles.staffAvatarRow}>
                    <View style={styles.avatarCircle}>
                      <UserIcon size={16} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.staffNameText} numberOfLines={1}>
                        {staff.name || 'Sales Cashier'}
                      </ThemedText>
                      <ThemedText style={styles.staffEmailText} numberOfLines={1}>
                        {staff.email}
                      </ThemedText>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      staff.status === 'active'
                        ? { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }
                        : { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.statusPillText,
                        { color: staff.status === 'active' ? '#065F46' : '#92400E' },
                      ]}
                    >
                      {staff.status === 'active' ? '✓ ACTIVE' : '⏳ PENDING'}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.staffCardFooter}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.branchChip}>
                      <ThemedText style={styles.branchChipText}>
                        🏬 {staff.branchName || 'Branch'}
                      </ThemedText>
                    </View>
                    <View style={styles.roleChip}>
                      <ThemedText style={styles.roleChipText}>
                        Role: Counter Sales
                      </ThemedText>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleRevokeStaff(staff)}
                    style={styles.removeBtn}
                  >
                    <ThemedText style={styles.removeBtnText}>Remove</ThemedText>
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

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleLeft}>
                <View style={styles.modalIconCircle}>
                  <UserIcon size={16} color={colors.primary} />
                </View>
                <View>
                  <ThemedText style={styles.modalTitle}>Assign Staff Member</ThemedText>
                  <ThemedText style={[styles.modalSubtitle, { color: colors.primary }]}>
                    Authorize Branch Counter Access
                  </ThemedText>
                </View>
              </View>
              <Pressable onPress={() => setShowAssignModal(false)} hitSlop={8} style={{ padding: 4 }}>
                <XIcon size={20} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
              {/* Branch Selector */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.fieldLabel}>
                  Select Operating Branch *
                </ThemedText>
                <View style={styles.branchPickerRow}>
                  {branches.map((b) => {
                    const isSelected = modalBranchId === b.id;
                    return (
                      <Pressable
                        key={b.id}
                        onPress={() => setModalBranchId(b.id)}
                        style={[
                          styles.branchPickerChip,
                          isSelected && styles.branchPickerChipActive,
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.branchPickerChipText,
                            { color: isSelected ? '#064E3B' : '#475569' },
                          ]}
                        >
                          🏬 {b.name}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Email */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.fieldLabel}>
                  Staff Email Address *
                </ThemedText>
                <TextInput
                  value={modalEmail}
                  onChangeText={setModalEmail}
                  placeholder="e.g. cashier.bole@gmail.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.standardInput}
                />
              </View>

              {/* Nickname / Display Name */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.fieldLabel}>
                  Staff Name / Nickname (Optional)
                </ThemedText>
                <TextInput
                  value={modalName}
                  onChangeText={setModalName}
                  placeholder="e.g. Chala (Day Shift)"
                  placeholderTextColor="#94A3B8"
                  style={styles.standardInput}
                />
              </View>

              {/* Role Selection */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.fieldLabel}>Counter Role</ThemedText>
                <Pressable
                  onPress={() => setModalRole('sales')}
                  style={styles.modalRoleCard}
                >
                  <ThemedText style={{ fontSize: 18 }}>🛒</ThemedText>
                  <View>
                    <ThemedText style={styles.modalRoleTitle}>Sales Cashier</ThemedText>
                    <ThemedText style={styles.modalRoleSubtitle}>
                      Distraction-free POS & Dube Settlement
                    </ThemedText>
                  </View>
                </Pressable>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActionsRow}>
              <Pressable
                onPress={() => setShowAssignModal(false)}
                style={styles.cancelBtn}
              >
                <ThemedText style={styles.cancelBtnText}>Cancel</ThemedText>
              </Pressable>

              <Pressable
                onPress={handleAssignSubmit}
                disabled={isSubmitting}
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <CheckCircleIcon size={16} color="#FFFFFF" />
                    <ThemedText style={styles.modalSubmitBtnText}>Assign Staff</ThemedText>
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
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#60646C',
    marginTop: 2,
  },
  assignBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assignBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  kpiRow: {
    paddingHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  kpiCardGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  kpiCardAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60646C',
    textTransform: 'uppercase',
  },
  kpiLabelGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    textTransform: 'uppercase',
  },
  kpiLabelAmber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  kpiValueDark: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  kpiValueGreen: {
    fontSize: 20,
    fontWeight: '900',
    color: '#065F46',
    marginTop: 2,
  },
  kpiValueAmber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#B45309',
    marginTop: 2,
  },
  searchBar: {
    marginHorizontal: 20,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#0F172A',
    paddingVertical: 0,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  staffListContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#60646C',
    marginBottom: 10,
  },
  loadingBox: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#60646C',
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#0F172A',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#60646C',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  firstAssignBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  firstAssignBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  staffCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  staffCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  staffAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  staffNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  staffEmailText: {
    fontSize: 12,
    color: '#60646C',
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  staffCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  branchChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  branchChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  roleChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  formGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  branchPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  branchPickerChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  branchPickerChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  branchPickerChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  standardInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  modalRoleCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalRoleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#064E3B',
  },
  modalRoleSubtitle: {
    fontSize: 10,
    color: '#475569',
    marginTop: 1,
  },
  modalActionsRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  modalSubmitBtn: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
