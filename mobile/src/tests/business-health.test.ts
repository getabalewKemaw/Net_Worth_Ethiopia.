import type { FinancialSnapshot } from '../types/health';
import {
  calculateFinancialSummary,
  formatCompactETB,
  formatCurrencyETB,
  evaluateBankabilityTier,
  filterSnapshotsByTimeframe,
} from '../service/health-calc';
import { mapRowToSnapshot } from '../repositories/local-health.repo';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

function assertStrictEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    console.error(`FAIL: ${message} (expected: ${expected}, got: ${actual})`);
    process.exit(1);
  }
}

export async function runBusinessHealthTests() {
  console.log('\n==============================================');
  console.log('STARTING MOBILE BUSINESS HEALTH UNIT TESTS');
  console.log('==============================================\n');

  console.log('Test 1: Verifying calculateFinancialSummary aggregation...');
  const mockSnapshots: FinancialSnapshot[] = [
    {
      id: 'snap-1',
      businessId: 'biz-1',
      branchId: null,
      periodType: 'monthly',
      periodYear: '2026',
      periodMonth: '05',
      periodLabel: 'May 2026',
      startDate: '2026-05-01T00:00:00Z',
      endDate: '2026-05-31T23:59:59Z',
      grossInflow: 100000,
      grossOutflow: 60000,
      netProfit: 40000,
      profitMarginPct: 40.0,
      growthMoMPct: 10.0,
      growthYoYPct: null,
      transactionCount: 200,
      avgTicketSize: 500,
      digitalPaymentRatio: 75.0,
      telebirrVolume: 50000,
      cbeVolume: 25000,
      cashVolume: 25000,
      dubeCollectedVolume: 10000,
      dubeIssuedVolume: 10000,
      debtRecoveryRatePct: 100,
      branchMetrics: [],
      isFinalized: true,
    },
    {
      id: 'snap-2',
      businessId: 'biz-1',
      branchId: null,
      periodType: 'monthly',
      periodYear: '2026',
      periodMonth: '06',
      periodLabel: 'Jun 2026',
      startDate: '2026-06-01T00:00:00Z',
      endDate: '2026-06-30T23:59:59Z',
      grossInflow: 200000,
      grossOutflow: 120000,
      netProfit: 80000,
      profitMarginPct: 40.0,
      growthMoMPct: 100.0,
      growthYoYPct: null,
      transactionCount: 400,
      avgTicketSize: 500,
      digitalPaymentRatio: 85.0,
      telebirrVolume: 120000,
      cbeVolume: 50000,
      cashVolume: 30000,
      dubeCollectedVolume: 20000,
      dubeIssuedVolume: 20000,
      debtRecoveryRatePct: 100,
      branchMetrics: [],
      isFinalized: true,
    },
  ];

  const summary = calculateFinancialSummary(mockSnapshots);
  assertStrictEqual(summary.totalInflow, 300000, 'Total inflow must sum gross inflows');
  assertStrictEqual(summary.totalOutflow, 180000, 'Total outflow must sum gross outflows');
  assertStrictEqual(summary.netProfit, 120000, 'Net profit must equal inflow - outflow');
  assertStrictEqual(summary.avgProfitMarginPct, 40.0, 'Average margin must be 40%');
  assertStrictEqual(summary.averageDigitalRatio, 80.0, 'Average digital ratio must be 80%');

  const emptySummary = calculateFinancialSummary([]);
  assertStrictEqual(emptySummary.totalInflow, 0, 'Empty snapshots should have 0 inflow');
  assertStrictEqual(emptySummary.netProfit, 0, 'Empty snapshots should have 0 profit');
  console.log('PASS: calculateFinancialSummary handles multi-period and empty datasets.');

  console.log('\nTest 2: Verifying mapRowToSnapshot SQLite transformation...');
  const rawRow = {
    id: 'snap-local-1',
    business_id: 'biz-addis',
    branch_id: null,
    period_type: 'monthly',
    period_year: '2026',
    period_month: '07',
    period_label: 'Jul 2026',
    start_date: '2026-07-01T00:00:00Z',
    end_date: '2026-07-31T23:59:59Z',
    gross_inflow: 150000,
    gross_outflow: 90000,
    net_profit: 60000,
    profit_margin_pct: 40.0,
    growth_mom_pct: 12.5,
    growth_yoy_pct: null,
    transaction_count: 320,
    avg_ticket_size: 468.75,
    digital_payment_ratio: 78.4,
    telebirr_volume: 85000,
    cbe_volume: 32600,
    cash_volume: 32400,
    dube_collected_volume: 15000,
    dube_issued_volume: 18000,
    debt_recovery_rate_pct: 83.33,
    branch_metrics_json: JSON.stringify([
      {
        branchId: 'br-1',
        branchName: 'Piassa Store',
        inflow: 100000,
        outflow: 60000,
        profit: 40000,
        sharePct: 67,
      },
    ]),
    is_finalized: 1,
    created_at: '2026-07-31T23:59:59Z',
    updated_at: '2026-07-31T23:59:59Z',
  };

  const snapshot = mapRowToSnapshot(rawRow as any);
  assertStrictEqual(snapshot.id, 'snap-local-1', 'ID must match');
  assertStrictEqual(snapshot.grossInflow, 150000, 'Gross inflow must be parsed as number');
  assertStrictEqual(snapshot.netProfit, 60000, 'Net profit must be parsed as number');
  assertStrictEqual(snapshot.isFinalized, true, 'isFinalized must be true');
  assertStrictEqual(snapshot.branchMetrics.length, 1, 'Should parse branch metrics JSON');
  assertStrictEqual(snapshot.branchMetrics[0].branchName, 'Piassa Store', 'Branch name must match');
  console.log('PASS: SQLite row mapping and JSON branch parsing verified.');

  console.log('\nTest 3: Verifying timeframe filtering (1M, 3M, 6M)...');
  const dummyList: any[] = [
    { id: '1', periodYear: '2025' },
    { id: '2', periodYear: '2025' },
    { id: '3', periodYear: '2026' },
    { id: '4', periodYear: '2026' },
    { id: '5', periodYear: '2026' },
    { id: '6', periodYear: '2026' },
    { id: '7', periodYear: '2026' },
    { id: '8', periodYear: '2026' },
  ];

  const slice1M = filterSnapshotsByTimeframe(dummyList, '1M');
  assertStrictEqual(slice1M.length, 1, '1M should return 1 snapshot');
  assertStrictEqual(slice1M[0].id, '8', '1M should return the newest snapshot');

  const slice3M = filterSnapshotsByTimeframe(dummyList, '3M');
  assertStrictEqual(slice3M.length, 3, '3M should return 3 snapshots');
  assertStrictEqual(slice3M[0].id, '6', '3M slice starts at id 6');

  const slice6M = filterSnapshotsByTimeframe(dummyList, '6M');
  assertStrictEqual(slice6M.length, 6, '6M should return 6 snapshots');
  assertStrictEqual(slice6M[0].id, '3', '6M slice starts at id 3');
  console.log('PASS: Timeframe slicing verified.');

  console.log('\nTest 4: Verifying bankability trust tiers...');
  assertStrictEqual(evaluateBankabilityTier(75).tier, 'Prime Bankable', '>=70% should be Prime Bankable');
  assertStrictEqual(evaluateBankabilityTier(55).tier, 'Moderate Trail', '40-70% should be Moderate Trail');
  assertStrictEqual(evaluateBankabilityTier(25).tier, 'Developing', '<40% should be Developing');
  console.log('PASS: Loan officer trust tiers categorized correctly.');

  console.log('\nTest 5: Verifying Ethiopian currency formatting...');
  assertStrictEqual(formatCompactETB(1500000), '1.5M', '1.5M formatted');
  assertStrictEqual(formatCompactETB(284500), '284.5k', '284.5k formatted');
  assertStrictEqual(formatCompactETB(850), '850', '850 formatted');
  assert(formatCurrencyETB(1000).includes('ETB'), 'Currency must include ETB symbol');
  console.log('PASS: Currency formatters verified.');

  console.log('\n==============================================');
  console.log('ALL 5 MOBILE BUSINESS HEALTH TESTS PASSED!');
  console.log('==============================================\n');
}

if (process.argv[1]?.includes('business-health.test.ts')) {
  runBusinessHealthTests().catch((err) => {
    console.error('BUSINESS HEALTH TEST FAILED:', err);
    process.exit(1);
  });
}
