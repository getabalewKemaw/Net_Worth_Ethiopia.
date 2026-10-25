import React, { useState, useEffect, useCallback } from 'react';
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
      const branchSales = await localSalesRepo.getSales(
        assignedBusinessId,
        assignedBranchId,
        50
      );

      const todayIso = new Date().toISOString().slice(0, 10);
      const todayOnly = branchSales.filter(
        (s) => (s.createdAt || '').slice(0, 10) === todayIso
      );
      setSales(todayOnly);
    } catch (err) {
      console.error('[StaffSales] Error loading shift sales:', err);
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
        return { label: '📱 Telebirr', bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9' };
      case 'cbe_birr':
        return { label: '🏦 CBE Birr', bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' };
      case 'bank':
      case 'bank_transfer':
        return { label: '🏛️ Bank', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D' };
      case 'dube':
        return { label: '👥 Dube Credit', bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' };
      default:
        return { label: '💵 Cash', bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' };
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StaffHeader onRefresh={handleRefresh} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
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
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => setShowQuickSaleModal(true)}
            style={styles.primaryActionBtn}
          >
            <View style={styles.plusIconCircle}>
              <PlusIcon size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={styles.primaryActionText}>Quick Instant Sale</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/staff/dube' as any)}
            style={styles.secondaryActionBtn}
          >
            <Text style={{ fontSize: 16, marginRight: 6 }}>📝</Text>
            <Text style={styles.secondaryActionText}>Issue Dube</Text>
          </Pressable>
        </View>

        {/* Shift Sales Feed Header */}
        <View style={styles.feedHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.feedTitle}>Shift Sales Feed</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{sales.length} today</Text>
            </View>
          </View>
          <Text style={styles.feedSubtitle}>Auto-Attributed & Locked</Text>
        </View>

        {/* Sales Feed Content */}
        {isLoading && sales.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#065F46" />
            <Text style={styles.loadingText}>Loading counter sales...</Text>
          </View>
        ) : sales.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🛒</Text>
            <Text style={styles.emptyTitle}>No sales recorded this shift yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap &quot;Quick Instant Sale&quot; to checkout walk-in customers instantly.
            </Text>
            <Pressable
              onPress={() => setShowQuickSaleModal(true)}
              style={styles.firstSaleBtn}
            >
              <Text style={styles.firstSaleText}>+ Record First Sale</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.salesListContainer}>
            {sales.map((item) => {
              const badge = getPaymentBadge(item.paymentMethod || 'cash');
              return (
                <View key={item.id} style={styles.saleItemCard}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.methodBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                        <Text style={[styles.methodBadgeText, { color: badge.text }]}>
                          {badge.label}
                        </Text>
                      </View>
                      <Text style={styles.saleTimeText}>{item.time || 'Today'}</Text>
                    </View>

                    <Text style={styles.saleDescText} numberOfLines={1}>
                      {item.description || 'Instant Sale'}
                    </Text>

                    {item.customer && (
                      <Text style={styles.saleCustomerText} numberOfLines={1}>
                        Customer: {item.customer}
                      </Text>
                    )}

                    {item.recordedByName && (
                      <Text style={styles.cashierAttributionText}>
                        Cashier: {item.recordedByName}
                      </Text>
                    )}
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.saleAmountText}>
                      +{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={styles.etbLabel}>ETB</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  actionRow: {
    marginHorizontal: 16,
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  primaryActionBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#065F46',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryActionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryActionText: {
    color: '#1E293B',
    fontWeight: '700',
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
  countBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
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
    fontWeight: '500',
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
    marginBottom: 16,
  },
  firstSaleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
  },
  firstSaleText: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 12,
  },
  salesListContainer: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  saleItemCard: {
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
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  saleTimeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  saleDescText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  saleCustomerText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cashierAttributionText: {
    fontSize: 10,
    color: '#065F46',
    marginTop: 4,
    fontWeight: '600',
  },
  saleAmountText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#065F46',
  },
  etbLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
