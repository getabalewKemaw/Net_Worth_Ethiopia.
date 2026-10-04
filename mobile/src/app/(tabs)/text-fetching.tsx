import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HamburgerHeader } from '@/components/navigation/hamburger-drawer';
import { useTheme } from '@/hooks/use-theme';
import { useTextFetchingStore } from '@/store/text-fetching-store';
import { useBidrStore } from '@/store/bidr-store';
import { useBusinessStore } from '@/store/business-store';
import { ScanHeader } from '@/components/text-fetching/scan-header';
import { ProviderCarousel } from '@/components/text-fetching/provider-carousel';
import { FilterPillBar } from '@/components/text-fetching/filter-pill-bar';
import { TransactionCard } from '@/components/text-fetching/transaction-card';
import { ConvertSaleModal } from '@/features/text-fetching/modals/convert-to-sale-modal';
import { ConvertExpenseModal } from '@/features/text-fetching/modals/convert-to-expense-modal';
import { MatchBidrModal } from '@/features/text-fetching/modals/match-bidr-modal';
import { PlusIcon } from '@/components/icons';
import type { ParsedBankTransaction } from '@/types/text-fetching';

export default function TextFetchingScreen() {
  const colors = useTheme();
  const {
    transactions,
    isScanning,
    scanInbox,
    loadSavedTransactions,
    dismissTransaction,
    setProviderFilter,
    setStatusFilter,
    getFilteredTransactions,
    selectedProvider,
    selectedStatus,
  } = useTextFetchingStore();

  const { activeBusiness, activeBranch } = useBusinessStore();
  const { fetchData: fetchDebts } = useBidrStore();

  // Active conversion modal state
  const [saleModalTxn, setSaleModalTxn] = useState<ParsedBankTransaction | null>(null);
  const [expenseModalTxn, setExpenseModalTxn] = useState<ParsedBankTransaction | null>(null);
  const [bidrModalTxn, setBidrModalTxn] = useState<ParsedBankTransaction | null>(null);

  // Load saved transactions and active debts on initial screen mount
  useEffect(() => {
    loadSavedTransactions();
    if (activeBusiness?.id) {
      fetchDebts(activeBusiness.id, activeBranch?.id).catch(() => {});
    }
  }, [loadSavedTransactions, fetchDebts, activeBusiness?.id, activeBranch?.id]);

  // Trigger scan with user feedback
  const handleScan = useCallback(async () => {
    try {
      const result = await scanInbox();
      if (result.parsed > 0) {
        Alert.alert(
          'SMS Scan Complete',
          `Scanned ${result.scanned} SMS messages.\nFound ${result.parsed} bank transactions (${result.inserted} new).`
        );
      } else {
        Alert.alert(
          'No Bank SMS Detected',
          'No new banking SMS messages found from telebirr, CBE, Awash, BOA, or Dashen Bank.'
        );
      }
    } catch (err: any) {
      Alert.alert('Scan Failed', err?.message || 'Could not scan SMS inbox.');
    }
  }, [scanInbox]);

  const handleConvertToSale = useCallback((txn: ParsedBankTransaction) => {
    setSaleModalTxn(txn);
  }, []);

  const handleConvertToExpense = useCallback((txn: ParsedBankTransaction) => {
    setExpenseModalTxn(txn);
  }, []);

  const handleMatchBidr = useCallback((txn: ParsedBankTransaction) => {
    setBidrModalTxn(txn);
  }, []);

  const handleDismiss = useCallback(
    (txn: ParsedBankTransaction) => {
      dismissTransaction(txn.id);
    },
    [dismissTransaction]
  );

  const filteredTransactions = getFilteredTransactions();
  const hasActiveFilter = selectedProvider !== 'all' || selectedStatus !== 'all';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}
    >
      {/* Top Header with Hamburger Navigation */}
      <HamburgerHeader activeTabId="text-fetching" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isScanning}
            onRefresh={handleScan}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Top Scan Controls & Status */}
        <ScanHeader onScan={handleScan} />

        {/* Compact Cashflow Strip (Only when records exist) */}
        <ProviderCarousel />

        {/* Minimalist Filter Bar (Only when records exist) */}
        <FilterPillBar />

        {/* Transaction Cards List */}
        <View className="mt-1">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((txn) => (
              <TransactionCard
                key={txn.id}
                transaction={txn}
                onConvertToSale={handleConvertToSale}
                onConvertToExpense={handleConvertToExpense}
                onMatchBidr={handleMatchBidr}
                onDismiss={handleDismiss}
              />
            ))
          ) : (
            /* Clean Empty State */
            <View
              className="mx-4 mt-6 p-8 rounded-3xl items-center border"
              style={{
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
              }}
            >
              <View className="w-16 h-16 rounded-2xl items-center justify-center bg-slate-100 dark:bg-slate-800 mb-4">
                <Text style={{ fontSize: 32 }}>📬</Text>
              </View>

              <Text className="text-base font-black text-slate-800 dark:text-slate-100 text-center mb-1.5">
                {transactions.length === 0
                  ? 'No Bank SMS Transactions'
                  : 'No Matching Transactions'}
              </Text>

              <Text className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs mb-5 leading-5">
                {transactions.length === 0
                  ? 'Sync your SIM card SMS inbox to automatically import customer payments and bank transfers from telebirr, CBE, Awash, BOA, and Dashen.'
                  : 'Try clearing your bank or status filters to view all imported transactions.'}
              </Text>

              {transactions.length === 0 ? (
                <Pressable
                  onPress={handleScan}
                  className="flex-row items-center gap-2 px-5 py-3 rounded-2xl active:opacity-85 shadow-sm"
                  style={{ backgroundColor: colors.primary }}
                >
                  <PlusIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                  <Text className="text-xs font-black text-white uppercase tracking-wider">
                    Scan SMS Inbox
                  </Text>
                </Pressable>
              ) : hasActiveFilter ? (
                <Pressable
                  onPress={() => {
                    setProviderFilter('all');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                >
                  <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Reset Active Filters
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bookkeeping Conversion Modals */}
      <ConvertSaleModal
        visible={Boolean(saleModalTxn)}
        transaction={saleModalTxn}
        onClose={() => setSaleModalTxn(null)}
      />

      <ConvertExpenseModal
        visible={Boolean(expenseModalTxn)}
        transaction={expenseModalTxn}
        onClose={() => setExpenseModalTxn(null)}
      />

      <MatchBidrModal
        visible={Boolean(bidrModalTxn)}
        transaction={bidrModalTxn}
        onClose={() => setBidrModalTxn(null)}
      />
    </SafeAreaView>
  );
}
