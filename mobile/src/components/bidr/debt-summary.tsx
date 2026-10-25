import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import {
  AlertCircleIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@/components/icons';
import type { DebtSummaryData, DebtFilterStatus } from '@/types/bidr';

interface DebtSummaryProps {
  summary: DebtSummaryData | null;
  deadlineInsights: {
    overdueCount: number;
    overdueTotal: number;
    dueWithinWeekCount: number;
    dueWithinWeekTotal: number;
  };
  onSelectFilter: (filter: DebtFilterStatus) => void;
}

export function DebtSummary({
  summary,
  deadlineInsights,
  onSelectFilter,
}: DebtSummaryProps) {
  const colors = useTheme();

  const totalPending = summary?.pendingAmount ?? summary?.totalPendingAmount ?? 0;
  const pendingCount = summary?.pendingCount ?? 0;
  const totalSettled = summary?.settledAmount ?? summary?.totalSettledAmount ?? 0;
  const overdueTotal = summary?.overdueAmount ?? summary?.totalOverdueAmount ?? deadlineInsights.overdueTotal;
  const overdueCount = summary?.overdueCount ?? deadlineInsights.overdueCount;
  const dueWithinWeekTotal = summary?.dueSoonAmount ?? deadlineInsights.dueWithinWeekTotal;
  const dueWithinWeekCount = summary?.dueSoonCount ?? deadlineInsights.dueWithinWeekCount;

  return (
    <View className="pt-2 pb-2">
      {/* Title Header */}
      <View className="px-5 pb-3">
        <Text
          style={{
            fontFamily: 'Lexend_800ExtraBold',
            fontSize: 22,
            fontWeight: '800',
            color: colors.text,
            letterSpacing: -0.4,
          }}
        >
          Dube notebook
        </Text>
        <Text
          style={{
            fontFamily: 'Lexend_400Regular',
            fontSize: 13,
            fontWeight: '400',
            color: colors.textSecondary,
            marginTop: 2,
          }}
        >
          Track and collect outstanding customer balances
        </Text>
      </View>

      {/* Stats Card (100% Native, Crash-Proof) */}
      <View className="px-5">
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: 'rgba(217, 119, 6, 0.18)',
            },
          ]}
        >
          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Top Row: Label & Active Records Counter */}
            <View className="flex-row items-center justify-between">
              <Text
                style={{
                  fontFamily: 'Lexend_600SemiBold',
                  fontSize: 12,
                  fontWeight: '600',
                  color: colors.textSecondary,
                }}
              >
                Active Dube records
              </Text>
              <View
                style={{
                  backgroundColor: 'rgba(217, 119, 6, 0.1)',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontFamily: 'Lexend_700Bold', fontSize: 11, fontWeight: '700', color: '#D97706' }}>
                  {pendingCount} {pendingCount === 1 ? 'record' : 'records'}
                </Text>
              </View>
            </View>

            {/* Hero Balance Amount */}
            <Text
              style={{
                fontFamily: 'Lexend_800ExtraBold',
                fontSize: 32,
                fontWeight: '800',
                color: colors.text,
                letterSpacing: -0.6,
                marginTop: 4,
              }}
            >
              {totalPending.toLocaleString()}{' '}
              <Text style={{ fontFamily: 'Lexend_600SemiBold', fontSize: 16, fontWeight: '600', color: colors.textSecondary }}>
                ETB
              </Text>
            </Text>

            {/* Hairline Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: colors.backgroundSelected || '#E2E8F0',
                marginVertical: 14,
              }}
            />

            {/* 3-Column Metrics (Overdue, 1-Week, Recovered) */}
            <View className="flex-row items-center justify-between">
              {/* Past Due */}
              <Pressable
                onPress={() => onSelectFilter('overdue')}
                className="flex-1 pr-2 active:opacity-75"
              >
                <View className="flex-row items-center gap-1.5 mb-1">
                  <AlertCircleIcon size={12} color={overdueCount > 0 ? '#DC2626' : colors.textSecondary} />
                  <Text
                    style={{
                      fontFamily: 'Lexend_600SemiBold',
                      fontSize: 11,
                      fontWeight: '600',
                      color: overdueCount > 0 ? '#DC2626' : colors.textSecondary,
                    }}
                  >
                    Past due
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: 'Lexend_700Bold',
                    fontSize: 14,
                    fontWeight: '700',
                    color: overdueCount > 0 ? '#DC2626' : colors.text,
                  }}
                >
                  {overdueTotal.toLocaleString()} <Text style={{ fontFamily: 'Lexend_500Medium', fontSize: 10, fontWeight: '500', color: colors.textSecondary }}>ETB</Text>
                </Text>
              </Pressable>

              {/* 1-Week Due */}
              <Pressable
                onPress={() => onSelectFilter('due_soon')}
                className="flex-1 px-2 border-l border-r active:opacity-75"
                style={{ borderColor: colors.backgroundSelected || '#E2E8F0' }}
              >
                <View className="flex-row items-center gap-1.5 mb-1">
                  <ClockIcon size={12} color={dueWithinWeekCount > 0 ? '#D97706' : colors.textSecondary} />
                  <Text
                    style={{
                      fontFamily: 'Lexend_600SemiBold',
                      fontSize: 11,
                      fontWeight: '600',
                      color: dueWithinWeekCount > 0 ? '#D97706' : colors.textSecondary,
                    }}
                  >
                    1-wk due
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: 'Lexend_700Bold',
                    fontSize: 14,
                    fontWeight: '700',
                    color: dueWithinWeekCount > 0 ? '#D97706' : colors.text,
                  }}
                >
                  {dueWithinWeekTotal.toLocaleString()} <Text style={{ fontFamily: 'Lexend_500Medium', fontSize: 10, fontWeight: '500', color: colors.textSecondary }}>ETB</Text>
                </Text>
              </Pressable>

              {/* Recovered */}
              <Pressable
                onPress={() => onSelectFilter('settled')}
                className="flex-1 pl-2 active:opacity-75"
              >
                <View className="flex-row items-center gap-1.5 mb-1">
                  <CheckCircleIcon size={12} color="#065F46" />
                  <Text
                    style={{
                      fontFamily: 'Lexend_600SemiBold',
                      fontSize: 11,
                      fontWeight: '600',
                      color: colors.textSecondary,
                    }}
                  >
                    Recovered
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: 'Lexend_700Bold',
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#065F46',
                  }}
                >
                  {totalSettled.toLocaleString()} <Text style={{ fontFamily: 'Lexend_500Medium', fontSize: 10, fontWeight: '500', color: colors.textSecondary }}>ETB</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  cardContent: {
    padding: 18,
  },
});
