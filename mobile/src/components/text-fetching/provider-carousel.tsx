import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BANK_PROVIDERS } from '@/constants/text-fetching';
import { useTextFetchingStore } from '@/store/text-fetching-store';
import type { BankProvider, ProviderSummary } from '@/types/text-fetching';

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

const PROVIDER_ORDER: BankProvider[] = ['telebirr', 'cbe', 'awash', 'boa', 'dashen'];

export function ProviderCarousel() {
  const colors = useTheme();
  const { providerSummaries, selectedProvider, setProviderFilter } = useTextFetchingStore();

  const totalIn = Object.values(providerSummaries).reduce((sum, s) => sum + s.totalDeposits, 0);
  const totalOut = Object.values(providerSummaries).reduce((sum, s) => sum + s.totalExpenses, 0);
  const totalTxnCount = Object.values(providerSummaries).reduce(
    (sum, s) => sum + s.depositCount + s.expenseCount,
    0
  );

  // If there are no transactions, do not show the bulky carousel at all
  if (totalTxnCount === 0) {
    return null;
  }

  return (
    <View className="mb-3">
      {/* Sleek combined metric strip */}
      <View className="mx-4 mb-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View>
            <Text className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Inflow
            </Text>
            <Text className="text-xs font-black text-emerald-600 mt-0.5">
              +ETB {formatMoney(totalIn)}
            </Text>
          </View>
          <View className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          <View>
            <Text className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Outflow
            </Text>
            <Text className="text-xs font-black text-rose-500 mt-0.5">
              -ETB {formatMoney(totalOut)}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Net Cash Flow
          </Text>
          <Text className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
            ETB {formatMoney(totalIn - totalOut)}
          </Text>
        </View>
      </View>
    </View>
  );
}
