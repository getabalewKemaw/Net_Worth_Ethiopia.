import type {
  FinancialSnapshot,
  FinancialSummary,
  TimeRangeFilter,
} from '../types/health';

/**
 * Computes aggregate summary metrics across a series of financial snapshots.
 */
export function calculateFinancialSummary(snapshots: FinancialSnapshot[]): FinancialSummary {
  if (!snapshots.length) {
    return {
      totalInflow: 0,
      totalOutflow: 0,
      netProfit: 0,
      avgProfitMarginPct: 0,
      averageDigitalRatio: 0,
    };
  }

  const totalInflow = snapshots.reduce((sum, s) => sum + s.grossInflow, 0);
  const totalOutflow = snapshots.reduce((sum, s) => sum + s.grossOutflow, 0);
  const netProfit = totalInflow - totalOutflow;
  const avgProfitMarginPct = totalInflow > 0 ? (netProfit / totalInflow) * 100 : 0;
  const avgDigital =
    snapshots.reduce((sum, s) => sum + s.digitalPaymentRatio, 0) / snapshots.length;

  return {
    totalInflow,
    totalOutflow,
    netProfit,
    avgProfitMarginPct: Math.round(avgProfitMarginPct * 10) / 10,
    averageDigitalRatio: Math.round(avgDigital * 10) / 10,
  };
}

/**
 * Compact ETB currency formatter (e.g. 1.2M, 284.5k, 500).
 */
export function formatCompactETB(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}k`;
  }
  return `${Math.round(amount)}`;
}

/**
 * Full currency ETB formatter with decimals.
 */
export function formatCurrencyETB(amount: number): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
}

/**
 * Determines loan readiness and trust tier for commercial bank evaluation.
 */
export function evaluateBankabilityTier(digitalRatio: number): {
  tier: string;
  badgeBg: string;
  badgeColor: string;
} {
  if (digitalRatio >= 70) {
    return {
      tier: 'Prime Bankable',
      badgeBg: '#ECFDF5',
      badgeColor: '#065F46',
    };
  }
  if (digitalRatio >= 40) {
    return {
      tier: 'Moderate Trail',
      badgeBg: '#EFF6FF',
      badgeColor: '#1D4ED8',
    };
  }
  return {
    tier: 'Developing',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
  };
}

/**
 * Slices snapshots according to selected timeframe.
 */
export function filterSnapshotsByTimeframe(
  snapshots: FinancialSnapshot[],
  timeframe: TimeRangeFilter
): FinancialSnapshot[] {
  if (!snapshots.length) return [];
  const count = snapshots.length;
  const currentYear = String(new Date().getFullYear());

  switch (timeframe) {
    case '1M':
      return snapshots.slice(Math.max(0, count - 1));
    case '3M':
      return snapshots.slice(Math.max(0, count - 3));
    case '6M':
      return snapshots.slice(Math.max(0, count - 6));
    case '1Y':
      return snapshots.slice(Math.max(0, count - 12));
    case 'YTD': {
      const ytd = snapshots.filter((s) => s.periodYear === currentYear);
      return ytd.length > 0 ? ytd : snapshots.slice(Math.max(0, count - 6));
    }
    case 'ALL':
    default:
      return snapshots;
  }
}
