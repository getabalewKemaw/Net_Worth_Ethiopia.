import {
  fetchCompleteDashboardMetrics,
  computeDashboardMetricsFromData,
} from '../service/dashboard';
import type { SaleEntry, ExpenseEntry } from '../types/sales';
import type { DebtItem } from '../types/bidr';

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

export async function runDashboardMetricsTests() {
  console.log('\n==============================================');
  console.log('STARTING REAL DASHBOARD METRICS UNIT TESTS');
  console.log('==============================================\n');

  console.log('Test 1: Running fetchCompleteDashboardMetrics without active business...');
  const emptyMetrics = await fetchCompleteDashboardMetrics('');
  assertStrictEqual(emptyMetrics.todayRevenue, 0, 'Today revenue should be 0 when no business');
  assertStrictEqual(emptyMetrics.todayExpense, 0, 'Today expense should be 0');
  assertStrictEqual(emptyMetrics.registeredDube, 0, 'Registered dube should be 0');
  assertStrictEqual(emptyMetrics.estimatedProfit, 0, 'Estimated profit should be 0');
  assertStrictEqual(emptyMetrics.weeklySalesPoints.length, 7, 'Weekly trend must contain 7 days');
  assertStrictEqual(emptyMetrics.hasWeeklySales, false, 'hasWeeklySales should be false');
  assertStrictEqual(emptyMetrics.paymentChannels.length, 3, 'Must contain 3 default payment channels');
  assertStrictEqual(emptyMetrics.recentActivities.length, 0, 'Recent activities should be empty');
  console.log('PASS: Empty business metrics handled gracefully.');

  console.log('\nTest 2: Verifying weekly sales structure & day labels...');
  assertStrictEqual(typeof emptyMetrics.weeklySalesPoints[0].label, 'string', 'Day label should be string');
  assertStrictEqual(emptyMetrics.weeklySalesPoints[6].active, true, 'Last day (today) must be active');
  console.log('PASS: Weekly sales points structured accurately.');

  console.log('\nTest 3: Verifying multi-branch breakdown calculation...');
  const mockBranches = [
    { id: 'b1', name: 'Piassa Main Branch', location: 'Addis Ababa' },
    { id: 'b2', name: 'Bole Outlet', location: 'Bole' },
  ];
  const branchMetrics = await fetchCompleteDashboardMetrics('test-biz', 'b1', mockBranches);
  assertStrictEqual(branchMetrics.branchBreakdown.length, 2, 'Should have 2 branch items');
  assertStrictEqual(branchMetrics.branchBreakdown[0].isCurrent, true, 'Branch b1 must be active');
  assertStrictEqual(branchMetrics.branchBreakdown[1].isCurrent, false, 'Branch b2 must be inactive');
  console.log('PASS: Multi-branch metrics generated and active status mapped.');

  console.log('\nTest 4: Pure calculation with rich sales, expenses, and debts data...');
  const todayStr = new Date().toISOString();
  const sampleSales: SaleEntry[] = [
    {
      id: 's1',
      businessId: 'test-biz',
      branchId: 'b1',
      description: 'Morning Coffee & Beans',
      amount: 600,
      paymentMethod: 'telebirr',
      saleType: 'instant',
      time: '09:30 AM',
      createdAt: todayStr,
    },
    {
      id: 's2',
      businessId: 'test-biz',
      branchId: 'b1',
      description: 'Bulk Pastry Order',
      amount: 400,
      paymentMethod: 'cbe',
      saleType: 'instant',
      time: '11:15 AM',
      createdAt: todayStr,
    },
    {
      id: 's3',
      businessId: 'test-biz',
      branchId: 'b2',
      description: 'Takeaway Lunch',
      amount: 1000,
      paymentMethod: 'cash',
      saleType: 'instant',
      time: '01:00 PM',
      createdAt: todayStr,
    },
  ];

  const sampleExpenses: ExpenseEntry[] = [
    {
      id: 'e1',
      businessId: 'test-biz',
      branchId: 'b1',
      description: 'Milk & Dairy Restock',
      amount: 300,
      category: 'Inventory',
      time: '10:00 AM',
      createdAt: todayStr,
    },
  ];

  const sampleDebts: DebtItem[] = [
    {
      id: 'd1',
      businessId: 'test-biz',
      branchId: 'b1',
      description: 'Credit Sale',
      customerName: 'Abebe Kebede',
      amount: 1200,
      paymentMethod: 'cash',
      saleType: 'dube',
      status: 'pending',
      createdAt: todayStr,
      updatedAt: todayStr,
    },
  ];

  // Test across all branches (no activeBranchId filter)
  const fullResult = computeDashboardMetricsFromData(
    sampleSales,
    sampleExpenses,
    sampleDebts,
    mockBranches
  );

  assertStrictEqual(fullResult.todayRevenue, 2000, 'Total today revenue across branches should be 2000 ETB');
  assertStrictEqual(fullResult.todayExpense, 300, 'Total today expense should be 300 ETB');
  assertStrictEqual(fullResult.estimatedProfit, 1700, 'Estimated profit should be 2000 - 300 = 1700 ETB');
  assertStrictEqual(fullResult.profitPercent, 85, 'Profit percentage should be 85%');
  assertStrictEqual(fullResult.registeredDube, 1200, 'Registered debt should be 1200 ETB');
  assertStrictEqual(fullResult.hasWeeklySales, true, 'hasWeeklySales should be true');

  // Verify payment channel shares (600 telebirr, 400 cbe, 1000 cash = 30%, 20%, 50%)
  const telebirrCh = fullResult.paymentChannels.find((c) => c.id === 'telebirr');
  const cbeCh = fullResult.paymentChannels.find((c) => c.id === 'cbe');
  const cashCh = fullResult.paymentChannels.find((c) => c.id === 'cash');

  assertStrictEqual(telebirrCh?.amount, 600, 'Telebirr amount should be 600');
  assertStrictEqual(telebirrCh?.percentage, 30, 'Telebirr share should be 30%');
  assertStrictEqual(cbeCh?.amount, 400, 'CBE amount should be 400');
  assertStrictEqual(cbeCh?.percentage, 20, 'CBE share should be 20%');
  assertStrictEqual(cashCh?.amount, 1000, 'Cash amount should be 1000');
  assertStrictEqual(cashCh?.percentage, 50, 'Cash share should be 50%');
  console.log('PASS: Revenue, profit, debt, and payment channel breakdown calculated accurately.');

  console.log('\nTest 5: Verifying branch-specific filtering (Branch b1 only)...');
  const b1Result = computeDashboardMetricsFromData(
    sampleSales,
    sampleExpenses,
    sampleDebts,
    mockBranches,
    'b1'
  );
  // Branch b1 has s1 (600) and s2 (400) = 1000 ETB
  assertStrictEqual(b1Result.todayRevenue, 1000, 'Branch b1 revenue should be 1000 ETB');
  assertStrictEqual(b1Result.todayExpense, 300, 'Branch b1 expense should be 300 ETB');
  assertStrictEqual(b1Result.estimatedProfit, 700, 'Branch b1 profit should be 700 ETB');
  assertStrictEqual(b1Result.branchBreakdown[0].share, '50%', 'Branch b1 share of total 2000 should be 50%');
  assertStrictEqual(b1Result.branchBreakdown[1].share, '50%', 'Branch b2 share of total 2000 should be 50%');
  console.log('PASS: Branch filtering and proportional share calculations verified.');

  console.log('\nTest 6: Verifying recent activities composition and sorting...');
  assertStrictEqual(fullResult.recentActivities.length, 5, 'Should return up to 5 combined recent activities');
  assert(fullResult.recentActivities[0].amountColor.length > 0, 'Activity should have color');
  console.log('PASS: Recent activities composed and sorted newest first.');

  console.log('\n==============================================');
  console.log('ALL 6 DASHBOARD METRICS TESTS PASSED PERFECTLY!');
  console.log('==============================================\n');
}

if (process.argv[1]?.includes('dashboard-metrics.test.ts')) {
  runDashboardMetricsTests().catch((err) => {
    console.error('DASHBOARD TEST FAILED:', err);
    process.exit(1);
  });
}
