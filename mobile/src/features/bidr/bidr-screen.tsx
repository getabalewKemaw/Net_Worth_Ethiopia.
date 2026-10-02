import React, { useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HamburgerHeader } from '@/components/navigation/hamburger-drawer';
import { useTheme } from '@/hooks/use-theme';
import { useBidr } from '@/hooks/use-bidr';
import { DebtSummary } from '@/components/bidr/debt-summary';
import { DebtFilterBar } from '@/components/bidr/debt-filter-bar';
import { DebtCard } from '@/components/bidr/debt-card';
import { DebtDetailModal } from './debt-detail-modal';
import { SettleDebtModal } from './settle-debt-modal';
import { UpdateDebtModal } from './update-debt-modal';
import { AddDebtModal } from './add-debt-modal';
import {
  ShieldAlertIcon,
  RefreshCwIcon,
  SearchIcon,
  PlusIcon,
} from '@/components/icons';
import type { DebtItem } from '@/types/bidr';

export function BidrScreen() {
  const colors = useTheme();

  const {
    debts,
    filteredDebts,
    summary,
    loading,
    refreshing,
    error,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    deadlineInsights,
    onRefresh,
    handleCreateDebt,
    handleSettleDebt,
    handleUpdateDebt,
  } = useBidr();

  const [selectedDebt, setSelectedDebt] = useState<DebtItem | null>(null);
  const [settleModalDebt, setSettleModalDebt] = useState<DebtItem | null>(null);
  const [updateModalDebt, setUpdateModalDebt] = useState<DebtItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const counts = {
    total: debts.length,
    pending: debts.filter((d) => d.status === 'pending').length,
    overdue: summary?.overdueCount ?? deadlineInsights.overdueCount,
    dueSoon: summary?.dueSoonCount ?? deadlineInsights.dueWithinWeekCount,
    settled: debts.filter((d) => d.status === 'settled').length,
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Top Header Bar */}
      <HamburgerHeader activeTabId="bidr" />

      {/* Main List */}
      <FlatList
        data={filteredDebts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DebtCard
            debt={item}
            onPress={(d) => setSelectedDebt(d)}
            onSettle={(d) => setSettleModalDebt(d)}
          />
        )}
        ListHeaderComponent={
          <View>
            {/* Page Title & Clean Unboxed Credit Summary */}
            <DebtSummary
              summary={summary}
              deadlineInsights={deadlineInsights}
              onSelectFilter={(filter) => setFilterStatus(filter)}
            />

            {/* Search Toolbar & Horizontally Scrollable Segmented Filter */}
            <DebtFilterBar
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              counts={counts}
            />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#D97706" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.textSecondary,
                  marginTop: 12,
                }}
              >
                Loading Dube notebook...
              </Text>
            </View>
          ) : error ? (
            <View className="items-center justify-center py-16 px-6">
              <ShieldAlertIcon size={36} color="#EF4444" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: colors.text,
                  marginTop: 10,
                }}
              >
                Unable to load Dube records
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginTop: 4,
                  textAlign: 'center',
                  maxWidth: 280,
                }}
              >
                {error}
              </Text>
              <Pressable
                onPress={onRefresh}
                className="flex-row items-center gap-2 mt-4 px-4 py-2.5 rounded-xl border active:opacity-80"
                style={{
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                }}
              >
                <RefreshCwIcon size={14} color="#D97706" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#D97706' }}>
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="items-center justify-center py-16 px-6">
              <View
                className="w-14 h-14 rounded-full items-center justify-center border"
                style={{
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                }}
              >
                <SearchIcon size={24} color={colors.textSecondary} />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: colors.text,
                  marginTop: 12,
                }}
              >
                No Dube records found
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginTop: 4,
                  textAlign: 'center',
                  maxWidth: 260,
                }}
              >
                {searchQuery
                  ? `No records matching "${searchQuery}".`
                  : filterStatus !== 'all'
                  ? `There are no ${filterStatus.replace('_', ' ')} records right now.`
                  : 'No Dube records registered yet.'}
              </Text>

              {/* Action Button to Record Debt */}
              <Pressable
                onPress={() => setShowAddModal(true)}
                className="flex-row items-center gap-2 mt-5 px-5 py-3 rounded-2xl active:opacity-85"
                style={{ backgroundColor: '#D97706' }}
              >
                <PlusIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>
                  Record Dube
                </Text>
              </Pressable>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D97706"
            colors={['#D97706']}
          />
        }
        contentContainerStyle={{ paddingBottom: 110 }}
      />

      {/* Add Debt Modal */}
      <AddDebtModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onConfirm={handleCreateDebt}
      />

      {/* Debt Detail Modal */}
      <DebtDetailModal
        visible={!!selectedDebt}
        debt={selectedDebt}
        onClose={() => setSelectedDebt(null)}
        onSettle={(d) => setSettleModalDebt(d)}
        onEdit={(d) => setUpdateModalDebt(d)}
      />

      {/* Settle Debt Modal */}
      <SettleDebtModal
        visible={!!settleModalDebt}
        debt={settleModalDebt}
        onClose={() => setSettleModalDebt(null)}
        onConfirm={handleSettleDebt}
      />

      {/* Update Debt Modal */}
      <UpdateDebtModal
        visible={!!updateModalDebt}
        debt={updateModalDebt}
        onClose={() => setUpdateModalDebt(null)}
        onConfirm={handleUpdateDebt}
      />
    </SafeAreaView>
  );
}
