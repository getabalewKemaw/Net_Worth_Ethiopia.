import { isSQLiteAvailable } from '@/db/client';
import { localSalesRepo } from '@/repositories/local-sales.repo';
import { localExpensesRepo } from '@/repositories/local-expenses.repo';
import { localBidrRepo } from '@/repositories/local-bidr.repo';
import type {
  DailyTrendPoint,
  PaymentChannelItem,
  DashboardActivity,
  DashboardBranchMetric,
  DashboardMetricsResult,
} from '@/types/dashboard';
import type { SaleEntry, ExpenseEntry } from '@/types/sales';
import type { DebtItem } from '@/types/bidr';

export type {
  DailyTrendPoint,
  PaymentChannelItem,
  DashboardActivity,
  DashboardBranchMetric,
  DashboardMetricsResult,
};

export interface FallbackDashboardData {
  sales?: SaleEntry[];
  expenses?: ExpenseEntry[];
  debts?: DebtItem[];
}

function formatDisplayTime(dateStr?: string | null): string {
  if (!dateStr) return 'Just now';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Just now';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return timeStr;
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${timeStr}`;
}

/**
 * Pure calculation function that produces all aggregated dashboard metrics
 * from raw sales, expenses, debts, and branch datasets.
 */
export function computeDashboardMetricsFromData(
  rawSales: SaleEntry[],
  rawExpenses: ExpenseEntry[],
  rawDebts: DebtItem[],
  branches: any[] = [],
  activeBranchId?: string,
  overrides?: {
    todayRev?: number;
    todaySalesCount?: number;
    yesterdayRev?: number;
    todayExp?: number;
    pendingDube?: number;
  }
): DashboardMetricsResult {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Filter for active branch if set
  const branchSales = activeBranchId
    ? rawSales.filter((s) => s.branchId === activeBranchId)
    : rawSales;
  const branchExpenses = activeBranchId
    ? rawExpenses.filter((e) => e.branchId === activeBranchId)
    : rawExpenses;

  // 1. Revenue & Expense Aggregates
  let todayRev = overrides?.todayRev;
  let todaySalesCount = overrides?.todaySalesCount;
  let yesterdayRev = overrides?.yesterdayRev;
  let todayExp = overrides?.todayExp;
  let pendingDube = overrides?.pendingDube;

  if (todayRev === undefined || todaySalesCount === undefined) {
    const todaySales = branchSales.filter(
      (s) => s.createdAt && s.createdAt.slice(0, 10) === todayStr && s.saleType !== 'dube'
    );
    todayRev = todaySales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    todaySalesCount = todaySales.length;
  }

  if (yesterdayRev === undefined) {
    const yesterdaySales = branchSales.filter(
      (s) => s.createdAt && s.createdAt.slice(0, 10) === yesterdayStr && s.saleType !== 'dube'
    );
    yesterdayRev = yesterdaySales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  }

  if (todayExp === undefined) {
    const todayExpenses = branchExpenses.filter(
      (e) => e.createdAt && e.createdAt.slice(0, 10) === todayStr
    );
    todayExp = todayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }

  if (pendingDube === undefined) {
    const branchDebts = activeBranchId
      ? rawDebts.filter((d) => d.branchId === activeBranchId)
      : rawDebts;
    pendingDube = branchDebts
      .filter((d) => d.status === 'pending')
      .reduce((sum, d) => sum + Number(d.amount ?? 0), 0);
  }

  // 2. Profit Calculations
  const estimatedProfit = Math.max(0, todayRev - todayExp);
  const profitPercent = todayRev > 0 ? Math.round((estimatedProfit / todayRev) * 100) : 0;

  // 3. Growth Badge
  let growthBadgeText = 'Today';
  let isGrowthPositive = true;
  if (yesterdayRev > 0) {
    const diff = todayRev - yesterdayRev;
    const pct = Math.round((diff / yesterdayRev) * 100);
    growthBadgeText = diff >= 0 ? `↑ +${pct}% vs yday` : `↓ ${pct}% vs yday`;
    isGrowthPositive = diff >= 0;
  } else if (todaySalesCount > 0) {
    growthBadgeText = `${todaySalesCount} sale${todaySalesCount === 1 ? '' : 's'} today`;
    isGrowthPositive = true;
  }

  // 4. Weekly Sales Trend (Past 7 Days)
  const scopedSales = activeBranchId
    ? rawSales.filter((s) => s.branchId === activeBranchId)
    : rawSales;

  const weeklySalesPoints: DailyTrendPoint[] = [];
  let weeklyTotal = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    const daySales = scopedSales.filter(
      (s) => s.saleType !== 'dube' && s.createdAt && s.createdAt.slice(0, 10) === dateStr
    );
    const dayAmount = daySales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    weeklyTotal += dayAmount;

    let valStr = `${dayAmount}`;
    if (dayAmount >= 1000) {
      valStr = `${(dayAmount / 1000).toFixed(dayAmount >= 10000 ? 0 : 1)}k`;
    }

    weeklySalesPoints.push({
      label: dayLabel,
      val: valStr,
      heightPct: 4,
      active: i === 0,
      peak: false,
    });
  }

  const maxDayAmount = Math.max(
    ...weeklySalesPoints.map((pt, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      const dateStr = d.toISOString().slice(0, 10);
      return scopedSales
        .filter((s) => s.saleType !== 'dube' && s.createdAt && s.createdAt.slice(0, 10) === dateStr)
        .reduce((sum, s) => sum + Number(s.amount || 0), 0);
    })
  );

  weeklySalesPoints.forEach((pt, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dateStr = d.toISOString().slice(0, 10);
    const amt = scopedSales
      .filter((s) => s.saleType !== 'dube' && s.createdAt && s.createdAt.slice(0, 10) === dateStr)
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);

    if (maxDayAmount > 0) {
      pt.heightPct = amt > 0 ? Math.max(10, Math.round((amt / maxDayAmount) * 100)) : 4;
      pt.peak = amt === maxDayAmount && maxDayAmount > 0;
    }
  });

  const avgDaily = weeklyTotal / 7;
  const avgDailyRevenueText =
    weeklyTotal > 0
      ? avgDaily >= 1000
        ? `Avg: ${(avgDaily / 1000).toFixed(1)}k ETB/day`
        : `Avg: ${Math.round(avgDaily)} ETB/day`
      : 'No sales this week';
  const hasWeeklySales = weeklyTotal > 0;

  // 5. Payment Channels Breakdown
  const todayInstantSales = scopedSales.filter(
    (s) => s.saleType !== 'dube' && s.createdAt && s.createdAt.slice(0, 10) === todayStr
  );
  const channelSalesSource =
    todayInstantSales.length > 0 ? todayInstantSales : scopedSales.filter((s) => s.saleType !== 'dube');
  const totalChannelRev = channelSalesSource.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  let telebirrAmt = 0;
  let cbeAmt = 0;
  let cashAmt = 0;

  channelSalesSource.forEach((s) => {
    const method = String(s.paymentMethod || '').toLowerCase();
    const amt = Number(s.amount || 0);
    if (method === 'telebirr') {
      telebirrAmt += amt;
    } else if (method === 'cbe' || method === 'cbebirr' || method === 'bank_transfer') {
      cbeAmt += amt;
    } else {
      cashAmt += amt;
    }
  });

  const telebirrPct = totalChannelRev > 0 ? Math.round((telebirrAmt / totalChannelRev) * 100) : 0;
  const cbePct = totalChannelRev > 0 ? Math.round((cbeAmt / totalChannelRev) * 100) : 0;
  const cashPct = totalChannelRev > 0 ? Math.max(0, 100 - telebirrPct - cbePct) : 0;

  const paymentChannels: PaymentChannelItem[] = [
    {
      id: 'telebirr',
      name: 'Telebirr',
      percentage: telebirrPct,
      amount: telebirrAmt,
      amountFormatted: `${telebirrAmt.toLocaleString('en-US')} ETB`,
      color: '#0284C7',
    },
    {
      id: 'cbe',
      name: 'CBE Birr',
      percentage: cbePct,
      amount: cbeAmt,
      amountFormatted: `${cbeAmt.toLocaleString('en-US')} ETB`,
      color: '#065F46',
    },
    {
      id: 'cash',
      name: 'Cash at Counter',
      percentage: cashPct,
      amount: cashAmt,
      amountFormatted: `${cashAmt.toLocaleString('en-US')} ETB`,
      color: '#D97706',
    },
  ];
  const hasPaymentData = totalChannelRev > 0;

  // 6. Operating Branches Performance
  const totalBusinessInstantSales = rawSales
    .filter((s) => s.saleType !== 'dube')
    .reduce((sum, s) => sum + Number(s.amount || 0), 0);

  const branchBreakdown: DashboardBranchMetric[] = (branches || []).map((br) => {
    const bSales = rawSales
      .filter((s) => s.saleType !== 'dube' && s.branchId === br.id)
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);

    const sharePct =
      totalBusinessInstantSales > 0
        ? Math.round((bSales / totalBusinessInstantSales) * 100)
        : 0;

    return {
      id: br.id,
      name: br.name || 'Branch',
      city: br.location || br.city || br.address || 'Main Location',
      sales: `${bSales.toLocaleString('en-US')} ETB`,
      salesAmount: bSales,
      share: `${sharePct}%`,
      isCurrent: activeBranchId === br.id,
    };
  });

  // 7. Recent Activity Feed
  const branchNameMap = new Map<string, string>();
  (branches || []).forEach((b) => branchNameMap.set(b.id, b.name));

  const activities: DashboardActivity[] = [];

  // Add sales
  rawSales.slice(0, 10).forEach((s) => {
    const method = String(s.paymentMethod || '').toLowerCase();
    const isTelebirr = method === 'telebirr';
    const isCbe = method === 'cbe' || method === 'cbebirr' || method === 'bank_transfer';

    const branchName = s.branchId ? branchNameMap.get(s.branchId) || 'Branch' : 'Store';
    const timeFormatted = formatDisplayTime(s.createdAt);

    activities.push({
      id: `sale-${s.id}`,
      type: 'sale',
      title: s.description || (isTelebirr ? 'Telebirr Payment' : isCbe ? 'CBE Payment' : 'Cash Sale'),
      subtitle: `${branchName} · ${timeFormatted}`,
      amount: Number(s.amount),
      amountFormatted: `+${Number(s.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`,
      amountColor: '#059669',
      icon: isTelebirr ? '📱' : isCbe ? '🏦' : '💵',
      iconBg: isTelebirr ? '#EFF6FF' : isCbe ? '#F3E8FF' : '#ECFDF5',
      createdAt: s.createdAt || new Date().toISOString(),
      timestamp: s.createdAt ? new Date(s.createdAt).getTime() : Date.now(),
    });
  });

  // Add expenses
  rawExpenses.slice(0, 10).forEach((e) => {
    const branchName = e.branchId ? branchNameMap.get(e.branchId) || 'Branch' : 'Store';
    const timeFormatted = formatDisplayTime(e.createdAt);

    activities.push({
      id: `exp-${e.id}`,
      type: 'expense',
      title: e.description || (e.category ? `Expense: ${e.category}` : 'Operational Expense'),
      subtitle: `${branchName} · ${timeFormatted}`,
      amount: Number(e.amount),
      amountFormatted: `-${Number(e.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`,
      amountColor: '#D97706',
      icon: '💸',
      iconBg: '#FFFBEB',
      createdAt: e.createdAt || new Date().toISOString(),
      timestamp: e.createdAt ? new Date(e.createdAt).getTime() : Date.now(),
    });
  });

  // Add debts
  rawDebts.slice(0, 10).forEach((d) => {
    const timeFormatted = formatDisplayTime(d.createdAt);
    activities.push({
      id: `debt-${d.id}`,
      type: 'dube',
      title: `Credit: ${d.customerName || d.description || 'Customer'}`,
      subtitle: d.dueDate ? `Due ${d.dueDate} · ${timeFormatted}` : timeFormatted,
      amount: Number(d.amount),
      amountFormatted: `${Number(d.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`,
      amountColor: '#B45309',
      icon: '📜',
      iconBg: '#FEF3C7',
      createdAt: d.createdAt || new Date().toISOString(),
      timestamp: d.createdAt ? new Date(d.createdAt).getTime() : Date.now(),
    });
  });

  // Sort activities newest first
  activities.sort((a, b) => b.timestamp - a.timestamp);
  const recentActivities = activities.slice(0, 5);

  return {
    todayRevenue: todayRev,
    todayExpense: todayExp,
    registeredDube: pendingDube,
    estimatedProfit,
    profitPercent,
    growthBadgeText,
    isGrowthPositive,

    weeklySalesPoints,
    avgDailyRevenueText,
    hasWeeklySales,

    paymentChannels,
    hasPaymentData,

    branchBreakdown,
    recentActivities,
  };
}

/**
 * Main dashboard data loader that orchestrates queries between SQLite local repositories
 * and gracefully falls back to provided in-memory/Zustand store datasets.
 */
export async function fetchCompleteDashboardMetrics(
  businessId: string,
  activeBranchId?: string,
  branches: any[] = [],
  fallbackData?: FallbackDashboardData
): Promise<DashboardMetricsResult> {
  if (!businessId) {
    return computeDashboardMetricsFromData([], [], [], branches, activeBranchId);
  }

  let rawSales: SaleEntry[] = fallbackData?.sales || [];
  let rawExpenses: ExpenseEntry[] = fallbackData?.expenses || [];
  let rawDebts: DebtItem[] = fallbackData?.debts || [];

  let todayRev: number | undefined;
  let todaySalesCount: number | undefined;
  let yesterdayRev: number | undefined;
  let todayExp: number | undefined;
  let pendingDube: number | undefined;

  if (isSQLiteAvailable()) {
    try {
      const [
        todayRevMetric,
        ydayRevMetric,
        todayExpMetric,
        debtSummaryMetric,
        allSales,
        allExpenses,
        allDebts,
      ] = await Promise.all([
        localSalesRepo.getTodayRevenueMetric(businessId, activeBranchId),
        localSalesRepo.getYesterdayRevenueMetric(businessId, activeBranchId),
        localExpensesRepo.getTodayExpenseMetric(businessId, activeBranchId),
        localBidrRepo.getDebtSummaryMetric(businessId, activeBranchId),
        localSalesRepo.getSales(businessId, undefined, 200),
        localExpensesRepo.getExpenses(businessId, undefined, 50),
        localBidrRepo.getDebts(businessId, undefined, { limit: 50 }),
      ]);

      todayRev = todayRevMetric.revenue;
      todaySalesCount = todayRevMetric.saleCount;
      yesterdayRev = ydayRevMetric.revenue;
      todayExp = todayExpMetric.expenseTotal;
      pendingDube = debtSummaryMetric.totalPendingAmount;

      rawSales = allSales;
      rawExpenses = allExpenses;
      rawDebts = allDebts;
    } catch (err) {
      console.warn('[DashboardService] SQLite metrics query fallback:', err);
    }
  }

  return computeDashboardMetricsFromData(
    rawSales,
    rawExpenses,
    rawDebts,
    branches,
    activeBranchId,
    {
      todayRev,
      todaySalesCount,
      yesterdayRev,
      todayExp,
      pendingDube,
    }
  );
}
