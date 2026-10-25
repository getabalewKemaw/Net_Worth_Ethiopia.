import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  Text,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import {
  SearchIcon,
  XIcon,
  ArrowUpDownIcon,
  CheckIcon,
} from '@/components/icons';
import { BIDR_FILTER_TABS } from '@/constants/bidr';
import type { DebtFilterStatus, DebtSortOption } from '@/types/bidr';

interface DebtFilterBarProps {
  filterStatus: DebtFilterStatus;
  setFilterStatus: (status: DebtFilterStatus) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: DebtSortOption;
  setSortBy: (sort: DebtSortOption) => void;
  counts: {
    total: number;
    pending: number;
    overdue: number;
    dueSoon: number;
    settled: number;
  };
}

const SORT_OPTIONS: { id: DebtSortOption; label: string; desc: string }[] = [
  { id: 'due_asc', label: 'Earliest due date first', desc: 'Urgent deadlines appear at top' },
  { id: 'due_desc', label: 'Latest due date first', desc: 'Distant deadlines appear first' },
  { id: 'created_desc', label: 'Most recently added', desc: 'Newest credit records first' },
  { id: 'created_asc', label: 'Oldest added first', desc: 'Earliest credit records first' },
  { id: 'amount_desc', label: 'Highest amount first', desc: 'Largest customer balances first' },
  { id: 'amount_asc', label: 'Lowest amount first', desc: 'Smallest customer balances first' },
];

export function DebtFilterBar({
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  counts,
}: DebtFilterBarProps) {
  const colors = useTheme();
  const [showSortModal, setShowSortModal] = useState(false);

  const getCountForTab = (key: DebtFilterStatus) => {
    switch (key) {
      case 'all': return counts.total;
      case 'pending': return counts.pending;
      case 'overdue': return counts.overdue;
      case 'due_soon': return counts.dueSoon;
      case 'settled': return counts.settled;
      default: return 0;
    }
  };

  const filterTabs = BIDR_FILTER_TABS.map((tab) => ({
    id: tab.key,
    label: tab.label,
    count: getCountForTab(tab.key),
    alert: tab.key === 'overdue' ? counts.overdue > 0 : tab.key === 'due_soon' ? counts.dueSoon > 0 : false,
  }));

  return (
    <View className="pt-2 pb-3 px-5 gap-2.5">
      {/* Search Bar + Sort Action Row */}
      <View className="flex-row items-center gap-2.5">
        <View
          className="flex-1 flex-row items-center px-3.5 h-11 rounded-2xl border"
          style={{
            backgroundColor: colors.backgroundElement,
            borderColor: colors.backgroundSelected,
          }}
        >
          <SearchIcon size={16} color={colors.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search customer, phone, item..."
            placeholderTextColor={colors.textSecondary}
            className="flex-1 ml-2.5 text-[14px] py-0"
            style={{ color: colors.text, fontFamily: 'Lexend_400Regular' }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <XIcon size={16} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Sort Button */}
        <Pressable
          onPress={() => setShowSortModal(true)}
          className="w-11 h-11 rounded-2xl items-center justify-center border active:opacity-80"
          style={{
            backgroundColor: colors.backgroundElement,
            borderColor: colors.backgroundSelected,
          }}
          accessibilityLabel="Sort options"
        >
          <ArrowUpDownIcon size={16} color="#D97706" />
        </Pressable>
      </View>

      {/* Unified Segmented Wrapper Container */}
      <View
        className="p-1 rounded-2xl border"
        style={{
          backgroundColor: colors.backgroundSelected,
          borderColor: colors.backgroundSelected,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 4, paddingVertical: 1, paddingHorizontal: 2 }}
        >
          {filterTabs.map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setFilterStatus(tab.id)}
                className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl active:opacity-85"
                style={{
                  backgroundColor: isActive ? colors.backgroundElement : 'transparent',
                  shadowColor: isActive ? '#000000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isActive ? 0.06 : 0,
                  shadowRadius: 3,
                  elevation: isActive ? 1 : 0,
                }}
              >
                <Text
                  style={{
                    fontFamily: isActive ? 'Lexend_700Bold' : 'Lexend_500Medium',
                    fontSize: 13,
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#D97706' : colors.textSecondary,
                  }}
                >
                  {tab.label}
                </Text>

                {tab.count > 0 && (
                  <View
                    className="px-1.5 py-0.5 rounded-md"
                    style={{
                      backgroundColor: tab.alert
                        ? tab.id === 'overdue'
                          ? 'rgba(239, 68, 68, 0.12)'
                          : 'rgba(217, 119, 6, 0.12)'
                        : isActive
                        ? 'rgba(217, 119, 6, 0.12)'
                        : 'rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Lexend_700Bold',
                        fontSize: 10,
                        fontWeight: '700',
                        color: tab.alert
                          ? tab.id === 'overdue'
                            ? '#DC2626'
                            : '#D97706'
                          : isActive
                          ? '#D97706'
                          : colors.textSecondary,
                      }}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setShowSortModal(false)}
        >
          <Pressable
            className="rounded-t-[32px] border p-6 pb-8"
            style={{
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <View className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full self-center mb-4" />

            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <Text style={{ fontFamily: 'Lexend_800ExtraBold', fontSize: 16, fontWeight: '800', color: colors.text }}>
                Sort Dube records
              </Text>
              <Pressable onPress={() => setShowSortModal(false)} hitSlop={6}>
                <XIcon size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View className="py-2 gap-1">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => {
                      setSortBy(opt.id);
                      setShowSortModal(false);
                    }}
                    className="flex-row items-center justify-between p-3.5 rounded-2xl active:bg-slate-100 dark:active:bg-slate-800"
                    style={{
                      backgroundColor: isSelected ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
                    }}
                  >
                    <View className="flex-1 pr-2">
                      <Text
                        style={{
                          fontFamily: 'Lexend_600SemiBold',
                          fontSize: 14,
                          fontWeight: '700',
                          color: isSelected ? '#D97706' : colors.text,
                        }}
                      >
                        {opt.label}
                      </Text>
                      <Text style={{ fontFamily: 'Lexend_400Regular', fontSize: 12, fontWeight: '400', color: colors.textSecondary, marginTop: 1 }}>
                        {opt.desc}
                      </Text>
                    </View>
                    {isSelected && <CheckIcon size={16} color="#D97706" />}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
