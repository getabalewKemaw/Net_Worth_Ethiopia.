import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
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
            tintColor="#DC2626"
            colors={['#DC2626']}
          />
        }
      >
        {/* Expenses Hero Summary Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroCardHeader}>
            <View>
              <Text style={styles.heroCardTitle}>Branch Petty Operating Expenses</Text>
              <Text style={styles.heroCardSubtitle}>Paid out of counter cash / drawer</Text>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{expenses.length} Records Today</Text>
            </View>
          </View>

          <View style={styles.heroCardMetrics}>
            <View>
              <Text style={styles.metricLabel}>Total Expenses Deducted</Text>
              <Text style={styles.metricValueRed}>
                -{totalShiftExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
              </Text>
            </View>

            <View style={styles.drawerAdjustedBadge}>
              <Text style={styles.drawerAdjustedText}>Drawer Cash Adjusted</Text>
            </View>
          </View>
        </View>

        {/* Action Button: Record Expense */}
        <View style={styles.actionContainer}>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={styles.actionBtn}
          >
            <View style={styles.plusIconCircle}>
              <PlusIcon size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={styles.actionBtnText}>Record Petty Expense</Text>
          </Pressable>
        </View>

        {/* Shift Expenses Feed Header */}
        <View style={styles.feedHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.feedTitle}>Today's Petty Expenses</Text>
            <View style={styles.feedCountBadge}>
              <Text style={styles.feedCountText}>{expenses.length} recorded</Text>
            </View>
          </View>
          <Text style={styles.feedSubtitle}>Locked to this branch</Text>
        </View>

        {/* Expenses Feed */}
        {isLoading && expenses.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DC2626" />
            <Text style={styles.loadingText}>Loading branch expenses...</Text>
          </View>
        ) : expenses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>💸</Text>
            <Text style={styles.emptyTitle}>No expenses recorded today</Text>
            <Text style={styles.emptySubtitle}>
              Tap &quot;Record Petty Expense&quot; for packaging, supplies, or transport.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {expenses.map((item) => (
              <View key={item.id} style={styles.expenseItemCard}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <View style={styles.badgeRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {item.category || 'General'}
                      </Text>
                    </View>
                    <Text style={styles.timeText}>{item.time || 'Today'}</Text>
                  </View>

                  <Text style={styles.descText} numberOfLines={1}>
                    {item.description}
                  </Text>

                  {item.notes && (
                    <Text style={styles.noteText} numberOfLines={1}>
                      Note: {item.notes}
                    </Text>
                  )}

                  {item.recordedByName && (
                    <Text style={styles.cashierText}>
                      Cashier: {item.recordedByName}
                    </Text>
                  )}
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.amountText}>
                    -{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.etbLabel}>ETB</Text>
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
    color: '#DC2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
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
  metricValueRed: {
    fontSize: 22,
    fontWeight: '900',
    color: '#DC2626',
    marginTop: 2,
  },
  drawerAdjustedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  drawerAdjustedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  actionContainer: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#DC2626',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B91C1C',
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
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  feedHeaderRow: {
    marginHorizontal: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  feedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 8,
  },
  feedCountBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  feedCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  feedSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
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
    marginTop: 10,
  },
  expenseItemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B91C1C',
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  descText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  noteText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cashierText: {
    fontSize: 10,
    color: '#DC2626',
    marginTop: 4,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DC2626',
  },
  etbLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
