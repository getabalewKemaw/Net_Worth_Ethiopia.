import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

// ==========================================
// 1. WEEKLY SALES BAR CHART (Clean & Responsive)
// ==========================================

export function SalesTrendAreaChart() {
  const dataPoints = [
    { label: 'Mon', val: '12k', heightPct: 62 },
    { label: 'Tue', val: '14.5k', heightPct: 75 },
    { label: 'Wed', val: '9.8k', heightPct: 50 },
    { label: 'Thu', val: '16.2k', heightPct: 84 },
    { label: 'Fri', val: '19k', peak: true, heightPct: 100 },
    { label: 'Sat', val: '15.4k', heightPct: 80 },
    { label: 'Sun', val: '18.5k', active: true, heightPct: 95 },
  ];

  return (
    <View style={styles.chartContainer}>
      {/* Bars Row */}
      <View style={styles.barsRow}>
        {dataPoints.map((pt, idx) => (
          <View key={idx} style={styles.barColumn}>
            {/* Value Label */}
            <ThemedText
              style={[
                styles.barValueText,
                pt.active && styles.activeValueText,
                pt.peak && styles.peakValueText,
              ]}
            >
              {pt.val}
            </ThemedText>

            {/* Bar Track & Fill */}
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${pt.heightPct}%`,
                    backgroundColor: pt.active
                      ? '#10B981'
                      : pt.peak
                      ? '#F59E0B'
                      : '#D1FAE5',
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
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <ThemedText style={styles.legendText}>Today (Active)</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <ThemedText style={styles.legendText}>Weekly Peak</ThemedText>
          </View>
        </View>

        <View style={styles.peakBadge}>
          <ThemedText style={styles.peakBadgeText}>Avg: 15.2k ETB/day</ThemedText>
        </View>
      </View>
    </View>
  );
}

// ==========================================
// 2. PAYMENT CHANNELS BREAKDOWN
// ==========================================

export function PaymentChannelDonutChart() {
  return (
    <View style={styles.paymentContainer}>
      {/* Multi-segment Progress Bar */}
      <View style={styles.segmentedBar}>
        <View style={[styles.segment, { width: '55%', backgroundColor: '#0284C7' }]} />
        <View style={[styles.segment, { width: '30%', backgroundColor: '#10B981' }]} />
        <View style={[styles.segment, { width: '15%', backgroundColor: '#F59E0B' }]} />
      </View>

      {/* Channels Grid */}
      <View style={styles.channelsList}>
        <View style={styles.channelRow}>
          <View style={styles.channelLeft}>
            <View style={[styles.channelDot, { backgroundColor: '#0284C7' }]} />
            <ThemedText style={styles.channelName}>Telebirr</ThemedText>
          </View>
          <ThemedText style={[styles.channelAmount, { color: '#0284C7' }]}>
            55% · 10,147 ETB
          </ThemedText>
        </View>

        <View style={styles.channelRow}>
          <View style={styles.channelLeft}>
            <View style={[styles.channelDot, { backgroundColor: '#10B981' }]} />
            <ThemedText style={styles.channelName}>CBE Birr</ThemedText>
          </View>
          <ThemedText style={[styles.channelAmount, { color: '#10B981' }]}>
            30% · 5,535 ETB
          </ThemedText>
        </View>

        <View style={styles.channelRow}>
          <View style={styles.channelLeft}>
            <View style={[styles.channelDot, { backgroundColor: '#F59E0B' }]} />
            <ThemedText style={styles.channelName}>Cash at Counter</ThemedText>
          </View>
          <ThemedText style={[styles.channelAmount, { color: '#D97706' }]}>
            15% · 2,768 ETB
          </ThemedText>
        </View>
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
    color: '#10B981',
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
    color: '#10B981',
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
    color: '#059669',
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
