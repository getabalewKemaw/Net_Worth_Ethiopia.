import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
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

  const totalPending = summary?.totalPendingAmount ?? 0;
  const pendingCount = summary?.pendingCount ?? 0;
  const totalSettled = summary?.totalSettledAmount ?? 0;
  const { overdueCount, overdueTotal, dueWithinWeekCount, dueWithinWeekTotal } = deadlineInsights;

  return (
    <View className="pt-2 pb-2">
      {/* Title Header */}
      <View className="px-5 pb-3">
        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: colors.text,
            letterSpacing: -0.4,
          }}
        >
          Customer Credit
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '400',
            color: colors.textSecondary,
            marginTop: 2,
          }}
        >
          Track and collect outstanding customer balances
        </Text>
      </View>

      {/* Subtle, Soft Light Gradient Stats Card */}
      <View className="px-5">
        <View style={styles.cardContainer}>
          {/* Gentle, Whisper-Soft Light Gradient Background */}
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="softHeroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <Stop offset="60%" stopColor="#F8FAFC" stopOpacity="1" />
                <Stop offset="100%" stopColor="#F0FDF4" stopOpacity="0.8" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" rx="20" fill="url(#softHeroGradient)" />
          </Svg>

          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Top Row: Label & Active Records Counter */}
            <View className="flex-row items-center justify-between">
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: colors.textSecondary,
                }}
              >
                Active customer credit
              </Text>
              <View
                style={{
                  backgroundColor: 'rgba(6, 95, 70, 0.08)',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#065F46' }}>
                  {pendingCount} {pendingCount === 1 ? 'record' : 'records'}
                </Text>
              </View>
            </View>

            {/* Hero Balance Amount */}
            <Text
              style={{
                fontSize: 32,
                fontWeight: '800',
                color: colors.text,
                letterSpacing: -0.6,
                marginTop: 4,
              }}
            >
              {totalPending.toLocaleString()}{' '}
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary }}>
                ETB
              </Text>
            </Text>

            {/* Hairline Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: '#E2E8F0',
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
                    fontSize: 14,
                    fontWeight: '700',
                    color: overdueCount > 0 ? '#DC2626' : colors.text,
                  }}
                >
                  {overdueTotal.toLocaleString()} <Text style={{ fontSize: 10, fontWeight: '500', color: colors.textSecondary }}>ETB</Text>
                </Text>
              </Pressable>

              {/* 1-Week Due */}
              <Pressable
                onPress={() => onSelectFilter('due_soon')}
                className="flex-1 px-2 border-l border-r active:opacity-75"
                style={{ borderColor: '#E2E8F0' }}
              >
                <View className="flex-row items-center gap-1.5 mb-1">
                  <ClockIcon size={12} color={dueWithinWeekCount > 0 ? '#D97706' : colors.textSecondary} />
                  <Text
                    style={{
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
                    fontSize: 14,
                    fontWeight: '700',
                    color: dueWithinWeekCount > 0 ? '#D97706' : colors.text,
                  }}
                >
                  {dueWithinWeekTotal.toLocaleString()} <Text style={{ fontSize: 10, fontWeight: '500', color: colors.textSecondary }}>ETB</Text>
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
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#065F46',
                  }}
                >
                  {totalSettled.toLocaleString()} <Text style={{ fontSize: 10, fontWeight: '500', color: colors.textSecondary }}>ETB</Text>
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
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.12)',
  },
  cardContent: {
    padding: 18,
  },
});
