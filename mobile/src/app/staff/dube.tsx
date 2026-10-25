import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
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
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StaffHeader onRefresh={handleRefresh} />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
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
        <View style={styles.heroCard}>
          <View style={styles.heroCardHeader}>
            <View>
              <Text style={styles.heroCardTitle}>Branch Customer Credit Notebook</Text>
              <Text style={styles.heroCardSubtitle}>Outstanding Dube Ledger</Text>
            </View>

            <View style={styles.activeDebtsPill}>
              <Text style={styles.activeDebtsPillText}>
                {debts.filter((d) => d.status === 'pending').length} Active Debts
              </Text>
            </View>
          </View>

          <View style={styles.heroCardMetrics}>
            <View>
              <Text style={styles.metricLabel}>Total Outstanding Credit</Text>
              <Text style={styles.metricValueLarge}>
                {totalActiveCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.metricLabel}>Recovered Today</Text>
              <Text style={styles.metricValueGreen}>
                +{(shiftMetrics?.dubeRecovered ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button: Issue Customer Dube */}
        <View style={styles.issueActionContainer}>
          <Pressable
            onPress={() => setShowIssueModal(true)}
            style={styles.issueActionBtn}
          >
            <View style={styles.plusIconCircle}>
              <PlusIcon size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={styles.issueActionText}>Issue Customer Dube</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchIcon size={16} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by customer name or phone..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          {(['all', 'pending', 'settled'] as DebtFilterStatus[]).map((st) => {
            const isSelected = filterStatus === st;
            const label = st === 'all' ? 'All' : st === 'pending' ? 'Active Credit' : 'Settled History';
            return (
              <Pressable
                key={st}
                onPress={() => setFilterStatus(st)}
                style={[
                  styles.filterPill,
                  isSelected ? styles.filterPillActive : styles.filterPillInactive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isSelected ? '#FFFFFF' : '#475569' },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Debt Cards Feed */}
        {isLoading && debts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#065F46" />
            <Text style={styles.loadingText}>Loading branch customer credit...</Text>
          </View>
        ) : debts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>👥</Text>
            <Text style={styles.emptyTitle}>No customer credit records found</Text>
            <Text style={styles.emptySubtitle}>
              Tap &quot;Issue Customer Dube&quot; to give store credit to trusted buyers.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {debts.map((item) => {
              const isSettled = item.status === 'settled';
              const overdue = !isSettled && isOverdue(item.dueDate);

              return (
                <View
                  key={item.id}
                  style={[
                    styles.debtCard,
                    isSettled && { opacity: 0.75 },
                    overdue && { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
                  ]}
                >
                  <View style={styles.debtCardHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.customerName} numberOfLines={1}>
                        {item.customerName || 'Customer'}
                      </Text>
                      {item.customerPhone && (
                        <Text style={styles.customerPhone}>
                          📞 {item.customerPhone}
                        </Text>
                      )}
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.debtAmount, { color: isSettled ? '#94A3B8' : '#B45309' }]}>
                        {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <View
                          style={[
                            styles.statusTag,
                            isSettled
                              ? { backgroundColor: '#F1F5F9' }
                              : overdue
                              ? { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' }
                              : { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusTagText,
                              {
                                color: isSettled ? '#64748B' : overdue ? '#B91C1C' : '#92400E',
                              },
                            ]}
                          >
                            {isSettled ? '✓ SETTLED' : overdue ? '⚠️ OVERDUE' : '⏳ ACTIVE'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.debtCardFooter}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      {item.description && (
                        <Text style={styles.debtDesc} numberOfLines={1}>
                          {item.description}
                        </Text>
                      )}
                      <Text style={styles.dueDateText}>
                        Due: {item.dueDate || 'No promised date'}
                      </Text>
                    </View>

                    {!isSettled && (
                      <Pressable
                        onPress={() => setSelectedDebtToSettle(item)}
                        style={styles.settleBtn}
                      >
                        <Text style={styles.settleBtnText}>Settle Debt</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  heroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  heroCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  activeDebtsPill: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  activeDebtsPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  heroCardMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metricValueLarge: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  metricValueGreen: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
    marginTop: 2,
  },
  issueActionContainer: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  issueActionBtn: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#065F46',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#064E3B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  plusIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  issueActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  searchContainer: {
    marginHorizontal: 16,
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
  filterPillsRow: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: '#065F46',
    borderColor: '#065F46',
  },
  filterPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 12,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  listContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  debtCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  debtCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  customerPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: '900',
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  debtCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  debtDesc: {
    fontSize: 12,
    color: '#334155',
  },
  dueDateText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  settleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#065F46',
    borderRadius: 10,
  },
  settleBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
