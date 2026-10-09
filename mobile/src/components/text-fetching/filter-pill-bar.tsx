import React from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from 'react-native';
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

  // If no transactions exist, hide filter bar to keep page clean
  if (transactions.length === 0) {
    return null;
  }

  const statusOptions: Array<{ id: SmsImportStatus | 'all'; label: string; count?: number }> = [
    { id: 'pending', label: 'Pending', count: pendingCount },
    { id: 'all', label: 'All' },
    { id: 'converted_sale', label: 'Sales' },
    { id: 'converted_expense', label: 'Expenses' },
  ];

  const providers: Array<{ id: BankProvider | 'all'; label: string }> = [
    { id: 'all', label: 'All Banks' },
    { id: 'telebirr', label: 'telebirr' },
    { id: 'cbe', label: 'CBE' },
    { id: 'awash', label: 'Awash' },
    { id: 'boa', label: 'BOA' },
    { id: 'dashen', label: 'Dashen' },
  ];

  return (
    <View style={styles.container}>
      {/* 1. Sleek Status Segmented Control */}
      <View
        style={[
          styles.segmentedContainer,
          { backgroundColor: colors.backgroundSelected },
        ]}
      >
        {statusOptions.map((opt) => {
          const isSelected = selectedStatus === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => setStatusFilter(opt.id)}
              style={[
                styles.segmentBtn,
                isSelected && [
                  styles.segmentBtnActive,
                  { backgroundColor: colors.backgroundElement },
                ],
              ]}
            >
              <View style={styles.segmentInner}>
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: isSelected ? '#065F46' : colors.textSecondary,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                {Boolean(opt.count && opt.count > 0) && (
                  <View
                    style={[
                      styles.segmentBadge,
                      {
                        backgroundColor: isSelected ? '#ECFDF5' : '#E2E8F0',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentBadgeText,
                        { color: isSelected ? '#065F46' : '#64748B' },
                      ]}
                    >
                      {opt.count}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* 2. Compact Horizontal Bank Selector Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bankScrollContent}
      >
        {providers.map((p) => {
          const isSelected = selectedProvider === p.id;
          const config = p.id !== 'all' ? BANK_PROVIDERS[p.id] : null;

          return (
            <Pressable
              key={p.id}
              onPress={() => setProviderFilter(p.id)}
              style={[
                styles.bankChip,
                {
                  backgroundColor: isSelected
                    ? '#ECFDF5'
                    : colors.backgroundElement,
                  borderColor: isSelected
                    ? '#065F46'
                    : colors.backgroundSelected,
                },
              ]}
            >
              {config?.logo ? (
                <Image
                  source={config.logo}
                  style={styles.bankLogo}
                  resizeMode="cover"
                />
              ) : null}
              <Text
                style={[
                  styles.bankChipText,
                  {
                    color: isSelected ? '#065F46' : colors.textSecondary,
                    fontWeight: isSelected ? '800' : '500',
                  },
                ]}
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  segmentBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  segmentText: {
    fontSize: 12,
  },
  segmentBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  segmentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bankScrollContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  bankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  bankLogo: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  bankChipText: {
    fontSize: 11.5,
  },
});
