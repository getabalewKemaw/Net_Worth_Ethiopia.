import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { FinancialSnapshot } from '@/types/health';

function formatCompactETB(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}k`;
  }
  return `${Math.round(amount)}`;
}

function formatFullETB(amount: number): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
}

// ========================================================
// 1. INFLOW VS OUTFLOW DUAL BAR CHART
// ========================================================

export interface InflowOutflowChartProps {
  snapshots: FinancialSnapshot[];
  onSelectPeriod?: (snapshot: FinancialSnapshot) => void;
}

export function InflowOutflowBarChart({ snapshots, onSelectPeriod }: InflowOutflowChartProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!snapshots || snapshots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No financial records found for this period.</ThemedText>
      </View>
    );
  }

  // Calculate highest volume to scale bar heights
  const maxVal = Math.max(
    ...snapshots.map((s) => Math.max(s.grossInflow, s.grossOutflow)),
    1000 // avoid division by zero
  );

  const selectedSnapshot =
    snapshots.find((s) => s.id === selectedId) || snapshots[snapshots.length - 1];

  return (
    <View style={styles.chartCard}>
      {/* Active Month Tooltip / Callout */}
      {selectedSnapshot && (
        <View style={styles.calloutBanner}>
          <View style={styles.calloutHeader}>
            <ThemedText style={styles.calloutTitle}>{selectedSnapshot.periodLabel}</ThemedText>
            <View
              style={[
                styles.marginBadge,
                { backgroundColor: selectedSnapshot.netProfit >= 0 ? '#ECFDF5' : '#FEF2F2' },
              ]}
            >
              <ThemedText
                style={[
                  styles.marginBadgeText,
                  { color: selectedSnapshot.netProfit >= 0 ? '#065F46' : '#DC2626' },
                ]}
              >
                {selectedSnapshot.profitMarginPct.toFixed(1)}% Margin
              </ThemedText>
            </View>
          </View>

          <View style={styles.calloutMetricsRow}>
            <View style={styles.calloutMetric}>
              <ThemedText style={styles.calloutMetricLabel}>Inflow</ThemedText>
              <ThemedText style={[styles.calloutMetricValue, { color: '#065F46' }]}>
                {formatCompactETB(selectedSnapshot.grossInflow)}
              </ThemedText>
            </View>
            <View style={styles.calloutDivider} />
            <View style={styles.calloutMetric}>
              <ThemedText style={styles.calloutMetricLabel}>Outflow</ThemedText>
              <ThemedText style={[styles.calloutMetricValue, { color: '#D97706' }]}>
                {formatCompactETB(selectedSnapshot.grossOutflow)}
              </ThemedText>
            </View>
            <View style={styles.calloutDivider} />
            <View style={styles.calloutMetric}>
              <ThemedText style={styles.calloutMetricLabel}>Net Profit</ThemedText>
              <ThemedText
                style={[
                  styles.calloutMetricValue,
                  { color: selectedSnapshot.netProfit >= 0 ? '#047857' : '#DC2626' },
                ]}
              >
                {selectedSnapshot.netProfit >= 0 ? '+' : ''}
                {formatCompactETB(selectedSnapshot.netProfit)}
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* Dual Bar Graphic */}
      <View style={styles.barsContainer}>
        {snapshots.map((item) => {
          const isSelected = item.id === (selectedSnapshot?.id ?? '');
          const inflowHeightPct = Math.max(6, Math.round((item.grossInflow / maxVal) * 100));
          const outflowHeightPct = Math.max(6, Math.round((item.grossOutflow / maxVal) * 100));

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedId(item.id);
                onSelectPeriod?.(item);
              }}
              style={[styles.monthColumn, isSelected && styles.monthColumnSelected]}
            >
              {/* Dual Bars Row */}
              <View style={styles.dualBarsWrapper}>
                {/* Inflow Bar (Green) */}
                <View style={styles.singleBarTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${inflowHeightPct}%`,
                        backgroundColor: isSelected ? '#065F46' : '#10B981',
                      },
                    ]}
                  />
                </View>

                {/* Outflow Bar (Amber) */}
                <View style={styles.singleBarTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${outflowHeightPct}%`,
                        backgroundColor: isSelected ? '#D97706' : '#F59E0B',
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Month Label */}
              <ThemedText
                style={[styles.monthLabel, isSelected && styles.monthLabelSelected]}
                numberOfLines={1}
              >
                {item.periodMonth ? item.periodLabel.split(' ')[0] : item.periodYear}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#065F46' }]} />
          <ThemedText style={styles.legendText}>Gross Inflow</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
          <ThemedText style={styles.legendText}>Gross Outflow</ThemedText>
        </View>
        <ThemedText style={styles.legendSubtext}>Tap any month for audit detail</ThemedText>
      </View>
    </View>
  );
}

// ========================================================
// 2. PROFIT VELOCITY & MOM GROWTH INDICATOR
// ========================================================

export interface ProfitVelocityProps {
  snapshots: FinancialSnapshot[];
}

export function ProfitVelocityTrendChart({ snapshots }: ProfitVelocityProps) {
  if (!snapshots || snapshots.length === 0) return null;

  // Find historical peak
  let peakSnapshot = snapshots[0];
  for (const s of snapshots) {
    if (s.netProfit > peakSnapshot.netProfit) {
      peakSnapshot = s;
    }
  }

  const latest = snapshots[snapshots.length - 1];
  const momGrowth = latest.growthMoMPct;
  const isUp = momGrowth !== null && momGrowth >= 0;

  return (
    <View style={styles.velocityCard}>
      <View style={styles.velocityHeader}>
        <View>
          <ThemedText style={styles.velocitySectionTitle}>Profit Trajectory</ThemedText>
          <ThemedText style={styles.velocitySubtitle}>
            Monthly net cash retention across active branches
          </ThemedText>
        </View>

        {momGrowth !== null && (
          <View style={[styles.growthPill, { backgroundColor: isUp ? '#ECFDF5' : '#FEF2F2' }]}>
            <ThemedText style={[styles.growthPillText, { color: isUp ? '#065F46' : '#DC2626' }]}>
              {isUp ? '▲ +' : '▼ '}
              {Math.abs(momGrowth).toFixed(1)}% MoM
            </ThemedText>
          </View>
        )}
      </View>

      {/* Spark Steps Bar */}
      <View style={styles.sparkRow}>
        {snapshots.map((s) => {
          const isPeak = s.id === peakSnapshot.id;
          const isPositive = s.netProfit >= 0;
          return (
            <View key={s.id} style={styles.sparkCol}>
              <View
                style={[
                  styles.sparkBar,
                  {
                    height: Math.max(12, Math.min(48, Math.round((Math.abs(s.netProfit) / (peakSnapshot.netProfit || 1)) * 48))),
                    backgroundColor: isPeak
                      ? '#065F46'
                      : isPositive
                      ? '#34D399'
                      : '#F87171',
                  },
                ]}
              />
              <ThemedText style={styles.sparkLabel} numberOfLines={1}>
                {s.periodMonth ? s.periodLabel.split(' ')[0] : s.periodYear}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {/* Peak Callout Footer */}
      <View style={styles.peakFooter}>
        <View style={styles.peakBadge}>
          <ThemedText style={styles.peakBadgeIcon}>★</ThemedText>
          <ThemedText style={styles.peakBadgeText}>
            Peak: {peakSnapshot.periodLabel} ({formatCompactETB(peakSnapshot.netProfit)} ETB)
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

// ========================================================
// 3. BANKABILITY & TRUST FOOTPRINT DIAL
// ========================================================

export interface DigitalFootprintProps {
  latestSnapshot?: FinancialSnapshot;
  averageDigitalRatio?: number;
}

export function DigitalFootprintDial({
  latestSnapshot,
  averageDigitalRatio = 0,
}: DigitalFootprintProps) {
  const digitalPct = Math.round(
    latestSnapshot ? latestSnapshot.digitalPaymentRatio : averageDigitalRatio
  );
  const recoveryPct = latestSnapshot ? Math.round(latestSnapshot.debtRecoveryRatePct) : 100;

  let trustTier = 'Developing';
  let tierBg = '#FEF3C7';
  let tierColor = '#B45309';

  if (digitalPct >= 70) {
    trustTier = 'Prime Bankable';
    tierBg = '#ECFDF5';
    tierColor = '#065F46';
  } else if (digitalPct >= 40) {
    trustTier = 'Moderate Trail';
    tierBg = '#EFF6FF';
    tierColor = '#1D4ED8';
  }

  return (
    <View style={styles.trustCard}>
      <View style={styles.trustHeader}>
        <View style={styles.trustHeaderLeft}>
          <ThemedText style={styles.trustTitle}>Bankability & Digital Footprint</ThemedText>
          <ThemedText style={styles.trustSubtitle}>
            Verifiable transaction trails for commercial loan audit
          </ThemedText>
        </View>
        <View style={[styles.tierBadge, { backgroundColor: tierBg }]}>
          <ThemedText style={[styles.tierBadgeText, { color: tierColor }]}>{trustTier}</ThemedText>
        </View>
      </View>

      {/* Dual Progress Bars */}
      <View style={styles.progressContainer}>
        {/* Metric 1: Digital Payment Trail */}
        <View style={styles.progressItem}>
          <View style={styles.progressLabelRow}>
            <ThemedText style={styles.progressLabel}>Digital Payment Ratio (Telebirr + CBE)</ThemedText>
            <ThemedText style={styles.progressValue}>{digitalPct}%</ThemedText>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.max(4, digitalPct))}%`, backgroundColor: '#0284C7' },
              ]}
            />
          </View>
          <ThemedText style={styles.progressHint}>
            Direct SMS confirmation verifiable by loan committee
          </ThemedText>
        </View>

        {/* Metric 2: Credit / Dube Recovery */}
        <View style={styles.progressItem}>
          <View style={styles.progressLabelRow}>
            <ThemedText style={styles.progressLabel}>Customer Credit (Dube) Recovery Rate</ThemedText>
            <ThemedText style={styles.progressValue}>{recoveryPct}%</ThemedText>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.max(4, recoveryPct))}%`, backgroundColor: '#059669' },
              ]}
            />
          </View>
          <ThemedText style={styles.progressHint}>
            Low default risk demonstrates operational discipline
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  calloutBanner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  marginBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  marginBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  calloutMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calloutMetric: {
    flex: 1,
    alignItems: 'center',
  },
  calloutDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  calloutMetricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  calloutMetricValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: 8,
    paddingBottom: 4,
  },
  monthColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingHorizontal: 2,
  },
  monthColumnSelected: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  dualBarsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 105,
    gap: 3,
  },
  singleBarTrack: {
    width: 11,
    height: '100%',
    justifyContent: 'flex-end',
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 5,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
  },
  monthLabelSelected: {
    color: '#065F46',
    fontWeight: '800',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  legendSubtext: {
    fontSize: 10,
    color: '#94A3B8',
  },

  // Velocity Styles
  velocityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  velocityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  velocitySectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  velocitySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  growthPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sparkRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
    paddingVertical: 4,
  },
  sparkCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  sparkBar: {
    width: 14,
    borderRadius: 4,
  },
  sparkLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  peakFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    alignItems: 'flex-start',
  },
  peakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  peakBadgeIcon: {
    fontSize: 11,
    color: '#D97706',
    marginRight: 4,
  },
  peakBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },

  // Trust Footprint Styles
  trustCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  trustHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  trustHeaderLeft: {
    flex: 1,
    paddingRight: 8,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  trustSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressContainer: {
    gap: 14,
  },
  progressItem: {},
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
});
