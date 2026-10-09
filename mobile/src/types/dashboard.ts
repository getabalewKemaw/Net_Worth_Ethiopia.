export interface DailyTrendPoint {
  label: string;
  val: string;
  heightPct: number;
  active?: boolean;
  peak?: boolean;
}

export interface PaymentChannelItem {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  amountFormatted: string;
  color: string;
}

export interface DashboardActivity {
  id: string;
  type: 'sale' | 'expense' | 'dube';
  title: string;
  subtitle: string;
  amount: number;
  amountFormatted: string;
  amountColor: string;
  icon: string;
  iconBg: string;
  createdAt: string;
  timestamp: number;
}

export interface DashboardBranchMetric {
  id: string;
  name: string;
  city: string;
  sales: string;
  salesAmount: number;
  share: string;
  isCurrent: boolean;
}

export interface DashboardMetricsResult {
  todayRevenue: number;
  todayExpense: number;
  registeredDube: number;
  estimatedProfit: number;
  profitPercent: number;
  growthBadgeText: string;
  isGrowthPositive: boolean;

  weeklySalesPoints: DailyTrendPoint[];
  avgDailyRevenueText: string;
  hasWeeklySales: boolean;

  paymentChannels: PaymentChannelItem[];
  hasPaymentData: boolean;

  branchBreakdown: DashboardBranchMetric[];
  recentActivities: DashboardActivity[];
}
