import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { DailyTrendPoint, PaymentChannelItem } from '@/types/dashboard';

export type { DailyTrendPoint, PaymentChannelItem };

// ==========================================
// 1. WEEKLY SALES BAR CHART (Clean & Responsive)
// ==========================================

export interface SalesTrendChartProps {
  dataPoints?: DailyTrendPoint[];
  avgText?: string;
  hasData?: boolean;
}

export function SalesTrendAreaChart({
  dataPoints,
  avgText,
  hasData = true,
}: SalesTrendChartProps) {
  const defaultPoints: DailyTrendPoint[] = [
    { label: 'Mon', val: '0', heightPct: 4 },
    { label: 'Tue', val: '0', heightPct: 4 },
    { label: 'Wed', val: '0', heightPct: 4 },
    { label: 'Thu', val: '0', heightPct: 4 },
    { label: 'Fri', val: '0', heightPct: 4 },
    { label: 'Sat', val: '0', heightPct: 4 },
    { label: 'Sun', val: '0', heightPct: 4, active: true },
  ];

  const points = dataPoints && dataPoints.length > 0 ? dataPoints : defaultPoints;

  return (
    <View style={styles.chartContainer}>
      {/* Bars Row */}
      <View style={styles.barsRow}>
        {points.map((pt, idx) => (
          <View key={idx} style={styles.barColumn}>
            {/* Value Label */}
            <ThemedText
              style={[
                styles.barValueText,
                pt.active && styles.activeValueText,
                pt.peak && styles.peakValueText,
              ]}
              numberOfLines={1}
            >
              {pt.val}
            </ThemedText>

            {/* Bar Track & Fill */}
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${Math.max(4, Math.min(100, pt.heightPct))}%`,
                    backgroundColor: pt.active
                      ? '#065F46'
                      : pt.peak
                      ? '#D97706'
                      : pt.heightPct > 4
                      ? '#A7F3D0'
                      : '#E2E8F0',
                  },
                ]}
              />
            </View>

            {/* Day Label */}
            <ThemedText
              style={[
                styles.dayLabel,
                pt.active && styles.activeDayLabel,
              ]}
            >
              {pt.label}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Chart Footer Legend */}
      <View style={styles.chartFooter}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#065F46' }]} />
            <ThemedText style={styles.legendText}>Today (Active)</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
            <ThemedText style={styles.legendText}>Weekly Peak</ThemedText>
          </View>
        </View>

        <View style={styles.peakBadge}>
          <ThemedText style={styles.peakBadgeText}>
            {avgText || (hasData ? 'Avg: 0 ETB/day' : 'No sales this week')}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

// ==========================================
// 2. PAYMENT CHANNELS BREAKDOWN
// ==========================================

export interface PaymentChannelChartProps {
  channels?: PaymentChannelItem[];
  hasData?: boolean;
}

export function PaymentChannelDonutChart({
  channels,
  hasData = true,
}: PaymentChannelChartProps) {
  const defaultChannels: PaymentChannelItem[] = [
    {
      id: 'telebirr',
      name: 'Telebirr',
      percentage: 0,
      amount: 0,
      amountFormatted: '0 ETB',
      color: '#0284C7',
    },
    {
      id: 'cbe',
      name: 'CBE Birr',
      percentage: 0,
      amount: 0,
      amountFormatted: '0 ETB',
      color: '#065F46',
    },
    {
      id: 'cash',
      name: 'Cash at Counter',
      percentage: 0,
      amount: 0,
      amountFormatted: '0 ETB',
      color: '#D97706',
    },
  ];

  const displayChannels = channels && channels.length > 0 ? channels : defaultChannels;

  // Filter channels that have percentage > 0 for progress bar
  const activeSegments = displayChannels.filter((c) => c.percentage > 0);

  return (
    <View style={styles.paymentContainer}>
      {/* Multi-segment Progress Bar */}
      <View style={styles.segmentedBar}>
        {hasData && activeSegments.length > 0 ? (
          activeSegments.map((c) => (
            <View
              key={c.id}
              style={[
                styles.segment,
                {
                  width: `${c.percentage}%`,
                  backgroundColor: c.color,
                },
              ]}
            />
          ))
        ) : (
          <View style={[styles.segment, { width: '100%', backgroundColor: '#E2E8F0' }]} />
        )}
      </View>

      {/* Channels Grid */}
      <View style={styles.channelsList}>
        {displayChannels.map((c) => (
          <View key={c.id} style={styles.channelRow}>
            <View style={styles.channelLeft}>
              <View style={[styles.channelDot, { backgroundColor: c.color }]} />
              <ThemedText style={styles.channelName}>{c.name}</ThemedText>
            </View>
            <ThemedText style={[styles.channelAmount, { color: c.color }]}>
              {c.percentage}% · {c.amountFormatted}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    width: '100%',
    paddingTop: 12,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barValueText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
  },
  activeValueText: {
    color: '#065F46',
    fontWeight: '800',
  },
  peakValueText: {
    color: '#D97706',
    fontWeight: '800',
  },
  barTrack: {
    width: 14,
    height: 90,
    justifyContent: 'flex-end',
    borderRadius: 7,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
  },
  activeDayLabel: {
    color: '#065F46',
    fontWeight: '800',
  },
  chartFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  peakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
  },
  peakBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },

  // Payment Channel Styles
  paymentContainer: {
    width: '100%',
    gap: 14,
  },
  segmentedBar: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
  channelsList: {
    gap: 10,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  channelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  channelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  channelName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  channelAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
});
