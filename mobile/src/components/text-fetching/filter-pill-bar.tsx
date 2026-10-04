import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useTextFetchingStore } from '@/store/text-fetching-store';
import { BANK_PROVIDERS } from '@/constants/text-fetching';
import type { BankProvider, SmsImportStatus } from '@/types/text-fetching';

export function FilterPillBar() {
  const colors = useTheme();
  const {
    transactions,
    selectedProvider,
    selectedStatus,
    setProviderFilter,
    setStatusFilter,
    getPendingCount,
  } = useTextFetchingStore();

  const pendingCount = getPendingCount();

  // If no transactions exist, hide filter bar to keep page completely clean
  if (transactions.length === 0) {
    return null;
  }

  const providers: Array<{ id: BankProvider | 'all'; label: string; icon?: string }> = [
    { id: 'all', label: 'All Banks' },
    { id: 'telebirr', label: 'telebirr', icon: '📱' },
    { id: 'cbe', label: 'CBE', icon: '🏦' },
    { id: 'awash', label: 'Awash', icon: '🏛️' },
    { id: 'boa', label: 'BOA', icon: '🪙' },
    { id: 'dashen', label: 'Dashen', icon: '💳' },
  ];

  return (
    <View className="mb-2">
      {/* Primary Status Quick Tabs */}
      <View className="flex-row items-center justify-between px-4 mb-2">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setStatusFilter('all')}
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: selectedStatus === 'all' ? colors.primary : 'transparent',
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: selectedStatus === 'all' ? '#FFFFFF' : '#64748B' }}
            >
              All Items
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStatusFilter('pending')}
            className="flex-row items-center gap-1.5 px-3 py-1 rounded-full"
            style={{
              backgroundColor: selectedStatus === 'pending' ? colors.primary : 'transparent',
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: selectedStatus === 'pending' ? '#FFFFFF' : '#64748B' }}
            >
              Pending
            </Text>
            {pendingCount > 0 && (
              <View
                className="px-1.5 py-0.2 rounded-full"
                style={{
                  backgroundColor: selectedStatus === 'pending' ? '#047857' : '#DCFCE7',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    color: selectedStatus === 'pending' ? '#FFFFFF' : '#15803D',
                  }}
                >
                  {pendingCount}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => setStatusFilter('converted_sale')}
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: selectedStatus === 'converted_sale' ? colors.primary : 'transparent',
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: selectedStatus === 'converted_sale' ? '#FFFFFF' : '#64748B' }}
            >
              Sales
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStatusFilter('converted_expense')}
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: selectedStatus === 'converted_expense' ? colors.primary : 'transparent',
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: selectedStatus === 'converted_expense' ? '#FFFFFF' : '#64748B' }}
            >
              Expenses
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Bank Provider Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
      >
        {providers.map((p) => {
          const isSelected = selectedProvider === p.id;
          const config = p.id !== 'all' ? BANK_PROVIDERS[p.id] : null;

          return (
            <Pressable
              key={p.id}
              onPress={() => setProviderFilter(p.id)}
              className="flex-row items-center gap-1 px-3 py-1 rounded-full border active:opacity-80"
              style={{
                backgroundColor: isSelected
                  ? config?.badgeBg || '#0F172A'
                  : colors.backgroundElement,
                borderColor: isSelected
                  ? config?.brandColor || '#0F172A'
                  : colors.backgroundSelected,
              }}
            >
              {p.icon && <Text style={{ fontSize: 11 }}>{p.icon}</Text>}
              <Text
                className="text-xs font-medium"
                style={{
                  color: isSelected
                    ? config?.badgeTextColor || '#FFFFFF'
                    : '#64748B',
                }}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
