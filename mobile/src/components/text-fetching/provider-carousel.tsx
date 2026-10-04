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

  // Aggregate totals across all banks
  const totalIn = Object.values(providerSummaries).reduce((sum, s) => sum + s.totalDeposits, 0);
  const totalOut = Object.values(providerSummaries).reduce((sum, s) => sum + s.totalExpenses, 0);
  const totalTxnCount = Object.values(providerSummaries).reduce(
    (sum, s) => sum + s.depositCount + s.expenseCount,
    0
  );

  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between px-4 mb-2">
        <Text className="text-xs font-black tracking-wider uppercase text-slate-400 dark:text-slate-500">
          Bank & Mobile Money Accounts
        </Text>
        <Text className="text-xs font-bold text-slate-400">
          {totalTxnCount} total records
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {/* All Providers Card */}
        <Pressable
          onPress={() => setProviderFilter('all')}
          className="p-3.5 rounded-2xl border active:opacity-90"
          style={{
            minWidth: 155,
            backgroundColor: selectedProvider === 'all' ? '#0F172A' : colors.backgroundElement,
            borderColor: selectedProvider === 'all' ? '#0F172A' : colors.backgroundSelected,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: selectedProvider === 'all' ? 0.15 : 0.04,
            shadowRadius: 6,
            elevation: selectedProvider === 'all' ? 3 : 1,
          }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-8 h-8 rounded-full items-center justify-center bg-slate-800 dark:bg-slate-700">
              <Text style={{ fontSize: 16 }}>💼</Text>
            </View>
            <View
              className="px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: selectedProvider === 'all' ? '#334155' : '#F1F5F9',
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '800',
                  color: selectedProvider === 'all' ? '#F8FAFC' : '#475569',
                }}
              >
                ALL BANKS
              </Text>
            </View>
          </View>

          <Text
            className="text-xs font-semibold mb-1"
            style={{ color: selectedProvider === 'all' ? '#94A3B8' : '#64748B' }}
          >
            Combined Net
          </Text>
          <Text
            className="text-base font-black mb-2"
            style={{ color: selectedProvider === 'all' ? '#FFFFFF' : '#0F172A' }}
          >
            ETB {formatMoney(totalIn - totalOut)}
          </Text>

          <View className="flex-row items-center justify-between pt-2 border-t border-slate-700/20 dark:border-slate-800">
            <Text className="text-[10px] font-bold text-emerald-500">
              +{formatMoney(totalIn)}
            </Text>
            <Text className="text-[10px] font-bold text-rose-500">
              -{formatMoney(totalOut)}
            </Text>
          </View>
        </Pressable>

        {/* Individual Provider Cards */}
        {PROVIDER_ORDER.map((providerKey) => {
          const config = BANK_PROVIDERS[providerKey];
          const summary: ProviderSummary = providerSummaries[providerKey] || {
            provider: providerKey,
            displayName: config.displayName,
            totalDeposits: 0,
            totalExpenses: 0,
            depositCount: 0,
            expenseCount: 0,
            latestBalance: null,
            lastTransactionAt: null,
          };

          const isSelected = selectedProvider === providerKey;

          return (
            <Pressable
              key={providerKey}
              onPress={() => setProviderFilter(isSelected ? 'all' : providerKey)}
              className="p-3.5 rounded-2xl border active:opacity-90"
              style={{
                minWidth: 165,
                backgroundColor: isSelected ? config.badgeBg : colors.backgroundElement,
                borderColor: isSelected ? config.brandColor : colors.backgroundSelected,
                borderWidth: isSelected ? 2 : 1,
                shadowColor: config.brandColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isSelected ? 0.2 : 0.04,
                shadowRadius: 6,
                elevation: isSelected ? 3 : 1,
              }}
            >
              {/* Header: Icon + Badge */}
              <View className="flex-row items-center justify-between mb-2">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: config.badgeBg }}
                >
                  <Text style={{ fontSize: 16 }}>{config.icon}</Text>
                </View>
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: config.badgeBg }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '800',
                      color: config.badgeTextColor,
                    }}
                  >
                    {summary.depositCount + summary.expenseCount} TXNS
                  </Text>
                </View>
              </View>

              {/* Bank Name */}
              <Text
                className="text-xs font-bold text-slate-800 dark:text-slate-200"
                numberOfLines={1}
              >
                {config.displayName}
              </Text>

              {/* Reported Balance or Inflow Total */}
              <Text
                className="text-sm font-black mt-0.5 mb-2"
                style={{ color: isSelected ? config.brandColor : '#0F172A' }}
              >
                {summary.latestBalance !== null
                  ? `Bal: ETB ${formatMoney(summary.latestBalance)}`
                  : `In: ETB ${formatMoney(summary.totalDeposits)}`}
              </Text>

              {/* Deposits & Expenses Flow */}
              <View className="flex-row items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-slate-800">
                <Text className="text-[10px] font-bold text-emerald-600">
                  +{formatMoney(summary.totalDeposits)}
                </Text>
                <Text className="text-[10px] font-bold text-rose-500">
                  -{formatMoney(summary.totalExpenses)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
