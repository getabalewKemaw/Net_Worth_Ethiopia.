import { getDatabase } from '../db/client';
import type { LocalFinancialSnapshotRow } from '../db/schema';
import type { FinancialSnapshot, BranchFinancialMetric } from '../types/health';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function mapRowToSnapshot(row: LocalFinancialSnapshotRow): FinancialSnapshot {
  let branchMetrics: BranchFinancialMetric[] = [];
  try {
    if (row.branch_metrics_json) {
      branchMetrics = JSON.parse(row.branch_metrics_json);
    }
  } catch {
    branchMetrics = [];
  }

  return {
    id: row.id,
    businessId: row.business_id,
    branchId: row.branch_id,
    periodType: row.period_type,
    periodYear: row.period_year,
    periodMonth: row.period_month,
    periodLabel: row.period_label,
    startDate: row.start_date,
    endDate: row.end_date,
    grossInflow: Number(row.gross_inflow || 0),
    grossOutflow: Number(row.gross_outflow || 0),
    netProfit: Number(row.net_profit || 0),
    profitMarginPct: Number(row.profit_margin_pct || 0),
    growthMoMPct: row.growth_mom_pct !== null ? Number(row.growth_mom_pct) : null,
    growthYoYPct: row.growth_yoy_pct !== null ? Number(row.growth_yoy_pct) : null,
    transactionCount: Number(row.transaction_count || 0),
    avgTicketSize: Number(row.avg_ticket_size || 0),
    digitalPaymentRatio: Number(row.digital_payment_ratio || 0),
    telebirrVolume: Number(row.telebirr_volume || 0),
    cbeVolume: Number(row.cbe_volume || 0),
    cashVolume: Number(row.cash_volume || 0),
    dubeCollectedVolume: Number(row.dube_collected_volume || 0),
    dubeIssuedVolume: Number(row.dube_issued_volume || 0),
    debtRecoveryRatePct: Number(row.debt_recovery_rate_pct || 0),
    branchMetrics,
    isFinalized: Boolean(row.is_finalized),
  };
}

export const localHealthRepo = {
  /**
   * Retrieves snapshots from local SQLite database ordered chronologically.
   */
  async getSnapshots(
    businessId: string,
    branchId?: string | null,
    periodType: string = 'monthly',
    limit: number = 12
  ): Promise<FinancialSnapshot[]> {
    const db = await getDatabase();

    let query = `
      SELECT * FROM local_financial_snapshot
      WHERE business_id = ? AND period_type = ?
    `;
    const params: any[] = [businessId, periodType];

    if (branchId) {
      query += ` AND branch_id = ?`;
      params.push(branchId);
    } else {
      query += ` AND branch_id IS NULL`;
    }

    query += ` ORDER BY start_date ASC LIMIT ?`;
    params.push(limit);

    const rows = await db.getAllAsync<LocalFinancialSnapshotRow>(query, params);
    return rows.map(mapRowToSnapshot);
  },

  /**
   * Atomically saves or updates a batch of snapshots into SQLite.
   */
  async saveSnapshotsAtomic(snapshots: FinancialSnapshot[]): Promise<void> {
    if (!snapshots.length) return;

    const db = await getDatabase();
    const nowIso = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      for (const s of snapshots) {
        await db.runAsync(
          `
          INSERT INTO local_financial_snapshot (
            id, business_id, branch_id, period_type, period_year, period_month,
            period_label, start_date, end_date, gross_inflow, gross_outflow,
            net_profit, profit_margin_pct, growth_mom_pct, growth_yoy_pct,
            transaction_count, avg_ticket_size, digital_payment_ratio,
            telebirr_volume, cbe_volume, cash_volume, dube_collected_volume,
            dube_issued_volume, debt_recovery_rate_pct, branch_metrics_json,
            is_finalized, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            gross_inflow = excluded.gross_inflow,
            gross_outflow = excluded.gross_outflow,
            net_profit = excluded.net_profit,
            profit_margin_pct = excluded.profit_margin_pct,
            growth_mom_pct = excluded.growth_mom_pct,
            growth_yoy_pct = excluded.growth_yoy_pct,
            transaction_count = excluded.transaction_count,
            avg_ticket_size = excluded.avg_ticket_size,
            digital_payment_ratio = excluded.digital_payment_ratio,
            telebirr_volume = excluded.telebirr_volume,
            cbe_volume = excluded.cbe_volume,
            cash_volume = excluded.cash_volume,
            dube_collected_volume = excluded.dube_collected_volume,
            dube_issued_volume = excluded.dube_issued_volume,
            debt_recovery_rate_pct = excluded.debt_recovery_rate_pct,
            branch_metrics_json = excluded.branch_metrics_json,
            is_finalized = excluded.is_finalized,
            updated_at = excluded.updated_at;
          `,
          [
            s.id,
            s.businessId,
            s.branchId,
            s.periodType,
            s.periodYear,
            s.periodMonth,
            s.periodLabel,
            s.startDate,
            s.endDate,
            s.grossInflow,
            s.grossOutflow,
            s.netProfit,
            s.profitMarginPct,
            s.growthMoMPct,
            s.growthYoYPct,
            s.transactionCount,
            s.avgTicketSize,
            s.digitalPaymentRatio,
            s.telebirrVolume,
            s.cbeVolume,
            s.cashVolume,
            s.dubeCollectedVolume,
            s.dubeIssuedVolume,
            s.debtRecoveryRatePct,
            JSON.stringify(s.branchMetrics || []),
            s.isFinalized ? 1 : 0,
            nowIso,
            nowIso,
          ]
        );
      }
    });
  },

  /**
   * Computes in-flight live metrics for the current calendar month directly from local SQLite.
   * Ensures instant offline response without waiting for a server sync.
   */
  async computeLiveCurrentMonth(
    businessId: string,
    branchId?: string | null,
    branches: any[] = []
  ): Promise<FinancialSnapshot> {
    const db = await getDatabase();
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const periodLabel = `${MONTH_NAMES[monthIndex]} ${year}`;
    const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0)).toISOString();
    const endDate = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999)).toISOString();

    const currentMonthPrefix = `${year}-${monthStr}%`;

    // Query sales for current month
    let salesQuery = `
      SELECT * FROM local_sale 
      WHERE business_id = ? 
        AND (created_at LIKE ? OR strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime'))
    `;
    const salesParams: any[] = [businessId, currentMonthPrefix];

    if (branchId) {
      salesQuery += ` AND branch_id = ?`;
      salesParams.push(branchId);
    }

    const sales = await db.getAllAsync<any>(salesQuery, salesParams);

    // Query expenses for current month
    let expQuery = `
      SELECT * FROM local_expense 
      WHERE business_id = ? 
        AND (created_at LIKE ? OR strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime'))
    `;
    const expParams: any[] = [businessId, currentMonthPrefix];

    if (branchId) {
      expQuery += ` AND branch_id = ?`;
      expParams.push(branchId);
    }

    const expenses = await db.getAllAsync<any>(expQuery, expParams);

    // Compute metrics
    const instantSales = sales.filter((s) => s.sale_type !== 'dube');
    const dubeSettled = sales.filter((s) => s.sale_type === 'dube' && s.status === 'settled');
    const dubeIssued = sales.filter((s) => s.sale_type === 'dube');

    const instantTotal = instantSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const dubeSettledTotal = dubeSettled.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const grossInflow = instantTotal + dubeSettledTotal;

    const grossOutflow = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netProfit = grossInflow - grossOutflow;
    const profitMarginPct = grossInflow > 0 ? (netProfit / grossInflow) * 100 : 0;

    const transactionCount = instantSales.length + dubeSettled.length;
    const avgTicketSize = transactionCount > 0 ? grossInflow / transactionCount : 0;

    let telebirrVolume = 0;
    let cbeVolume = 0;
    let cashVolume = 0;

    for (const s of instantSales) {
      const method = String(s.payment_method || '').toLowerCase();
      const amt = Number(s.amount || 0);
      if (method === 'telebirr') telebirrVolume += amt;
      else if (method === 'cbe' || method === 'cbebirr' || method === 'bank_transfer') cbeVolume += amt;
      else cashVolume += amt;
    }

    const digitalPaymentRatio =
      grossInflow > 0 ? ((telebirrVolume + cbeVolume) / grossInflow) * 100 : 0;

    const dubeCollectedVolume = dubeSettledTotal;
    const dubeIssuedVolume = dubeIssued.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const debtRecoveryRatePct =
      dubeIssuedVolume > 0 ? Math.min(100, (dubeCollectedVolume / dubeIssuedVolume) * 100) : 100;

    // Multi-branch metrics
    const branchMetrics: BranchFinancialMetric[] = (branches || []).map((br) => {
      const bSales = sales.filter((s) => s.branch_id === br.id && s.sale_type !== 'dube');
      const bDubeSettled = sales.filter((s) => s.branch_id === br.id && s.sale_type === 'dube' && s.status === 'settled');
      const bInflow =
        bSales.reduce((sum, s) => sum + Number(s.amount || 0), 0) +
        bDubeSettled.reduce((sum, s) => sum + Number(s.amount || 0), 0);

      const bExpenses = expenses.filter((e) => e.branch_id === br.id);
      const bOutflow = bExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const bProfit = bInflow - bOutflow;
      const bShare = grossInflow > 0 ? Math.round((bInflow / grossInflow) * 100) : 0;

      return {
        branchId: br.id,
        branchName: br.name || 'Branch',
        city: br.location || br.city || undefined,
        inflow: bInflow,
        outflow: bOutflow,
        profit: bProfit,
        sharePct: bShare,
      };
    });

    return {
      id: `live-${year}-${monthStr}-${branchId || 'all'}`,
      businessId,
      branchId: branchId ?? null,
      periodType: 'monthly',
      periodYear: String(year),
      periodMonth: monthStr,
      periodLabel,
      startDate,
      endDate,
      grossInflow,
      grossOutflow,
      netProfit,
      profitMarginPct,
      growthMoMPct: null,
      growthYoYPct: null,
      transactionCount,
      avgTicketSize,
      digitalPaymentRatio,
      telebirrVolume,
      cbeVolume,
      cashVolume,
      dubeCollectedVolume,
      dubeIssuedVolume,
      debtRecoveryRatePct,
      branchMetrics,
      isFinalized: false,
    };
  },
};
