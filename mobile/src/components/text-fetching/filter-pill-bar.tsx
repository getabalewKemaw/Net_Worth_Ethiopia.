import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useTextFetchingStore } from '@/store/text-fetching-store';
import { BANK_PROVIDERS } from '@/constants/text-fetching';
import type { BankProvider, SmsImportStatus } from '@/types/text-fetching';

const STATUS_PILLS: Array<{ id: SmsImportStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All Items' },
  { id: 'pending', label: 'Pending Action' },
  { id: 'converted_sale', label: 'Sales' },
  { id: 'converted_expense', label: 'Expenses' },
  { id: 'ignored', label: 'Ignored' },
];

const PROVIDER_PILLS: Array<{ id: BankProvider | 'all'; label: string; icon?: string }> = [
  { id: 'all', label: 'All Banks' },
  { id: 'telebirr', label: 'telebirr', icon: '📱' },
  { id: 'cbe', label: 'CBE', icon: '🏦' },
  { id: 'awash', label: 'Awash', icon: '🏛️' },
  { id: 'boa', label: 'BOA', icon: '🪙' },
  { id: 'dashen', label: 'Dashen', icon: '💳' },
];

export function FilterPillBar() {
  const colors = useTheme();
  const {
    selectedProvider,
    selectedStatus,
    setProviderFilter,
    setStatusFilter,
    getPendingCount,
  } = useTextFetchingStore();

  const pendingCount = getPendingCount();

  return (
    <View className="mb-2 gap-2">
      {/* Row 1: Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {STATUS_PILLS.map((pill) => {
          const isSelected = selectedStatus === pill.id;
          const isPendingPill = pill.id === 'pending';

          return (
            <Pressable
              key={pill.id}
              onPress={() => setStatusFilter(pill.id)}
              className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full border active:opacity-80"
              style={{
                backgroundColor: isSelected ? colors.primary : colors.backgroundElement,
                borderColor: isSelected ? colors.primary : colors.backgroundSelected,
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: isSelected ? '#FFFFFF' : '#64748B' }}
              >
                {pill.label}
              </Text>
              {isPendingPill && pendingCount > 0 && (
                <View
                  className="px-1.5 py-0.2 rounded-full"
                  style={{
                    backgroundColor: isSelected ? '#047857' : '#DCFCE7',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '800',
                      color: isSelected ? '#FFFFFF' : '#15803D',
                    }}
                  >
                    {pendingCount}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Row 2: Provider Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {PROVIDER_PILLS.map((pill) => {
          const isSelected = selectedProvider === pill.id;
          const config = pill.id !== 'all' ? BANK_PROVIDERS[pill.id] : null;

          return (
            <Pressable
              key={pill.id}
              onPress={() => setProviderFilter(pill.id)}
              className="flex-row items-center gap-1.5 px-3 py-1 rounded-xl border active:opacity-80"
              style={{
                backgroundColor: isSelected
                  ? config?.badgeBg || '#0F172A'
                  : colors.backgroundElement,
                borderColor: isSelected
                  ? config?.brandColor || '#0F172A'
                  : colors.backgroundSelected,
              }}
            >
              {pill.icon && <Text style={{ fontSize: 12 }}>{pill.icon}</Text>}
              <Text
                className="text-xs font-semibold"
                style={{
                  color: isSelected
                    ? config?.badgeTextColor || '#FFFFFF'
                    : '#64748B',
                }}
              >
                {pill.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
