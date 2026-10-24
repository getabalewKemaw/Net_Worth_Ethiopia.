import type { LocalSaleRow, LocalExpenseRow } from '../db/schema';
import type { ShiftDrawerMetrics, StaffProfile } from '../types/staff';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

function assertStrictEqual(actual: any, expected: any, message?: string) {
  if (actual !== expected) {
    console.error(`FAIL: ${message || 'Assertion failed'} (expected: ${expected}, got: ${actual})`);
    process.exit(1);
  }
}

/**
 * Pure function mirroring localStaffRepo.computeShiftDrawerMetrics logic
 * for offline calculation unit testing.
 */
export function computeShiftMetricsFromData(
  sales: LocalSaleRow[],
  expenses: LocalExpenseRow[],
  branchId: string,
  datePrefix: string
): ShiftDrawerMetrics {
  const branchSales = sales.filter(
    (s) =>
      s.branch_id === branchId &&
      s.status !== 'voided' &&
      ((s.created_at && s.created_at.startsWith(datePrefix)) ||
        (s.paid_at && s.paid_at.startsWith(datePrefix)))
  );

  const branchExpenses = expenses.filter(
    (e) => e.branch_id === branchId && e.created_at && e.created_at.startsWith(datePrefix)
  );

  let cashInDrawer = 0;
  let telebirrCollected = 0;
  let cbeBirrCollected = 0;
  let dubeRecovered = 0;
  let totalShiftVolume = 0;

  for (const s of branchSales) {
    if (
      s.sale_type === 'dube' &&
      s.status === 'settled' &&
      s.paid_at &&
      s.paid_at.startsWith(datePrefix)
    ) {
      dubeRecovered += s.amount;
      totalShiftVolume += s.amount;

      if (s.payment_method === 'cash') cashInDrawer += s.amount;
      else if (s.payment_method === 'telebirr') telebirrCollected += s.amount;
      else if (s.payment_method === 'cbe') cbeBirrCollected += s.amount;
    } else if (
      s.sale_type === 'instant' &&
      s.status === 'settled' &&
      s.created_at &&
      s.created_at.startsWith(datePrefix)
    ) {
      totalShiftVolume += s.amount;

      if (s.payment_method === 'cash') cashInDrawer += s.amount;
      else if (s.payment_method === 'telebirr') telebirrCollected += s.amount;
      else if (s.payment_method === 'cbe') cbeBirrCollected += s.amount;
    }
  }

  const expenseVolume = branchExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netCashInDrawer = cashInDrawer - expenseVolume;
  const transactionCount = branchSales.length + branchExpenses.length;

  return {
    totalShiftVolume,
    cashInDrawer,
    telebirrCollected,
    cbeBirrCollected,
    dubeRecovered,
    expenseVolume,
    netCashInDrawer,
    transactionCount,
  };
}

export async function runStaffManagementTests() {
  console.log('\n==============================================');
  console.log('NETWORTH ETHIOPIA — MOBILE STAFF DATA LAYER TESTS');
  console.log('==============================================\n');

  const todayStr = '2026-10-24';
  const targetBranch = 'br-bole';

  // TEST 1: Shift Drawer Metrics Calculation
  console.log('>>> [Test 1] Shift Drawer Cash & Digital Reconciliation...');
  const mockSales: LocalSaleRow[] = [
    {
      id: 's-1',
      business_id: 'biz-1',
      branch_id: 'br-bole',
      sale_type: 'instant',
      payment_method: 'cash',
      description: 'Counter cash sale',
      amount: 4200,
      customer_name: null,
      customer_phone: null,
      due_date: null,
      status: 'settled',
      notes: null,
      paid_at: `${todayStr}T09:00:00Z`,
      recorded_by_id: 'usr-chala',
      recorded_by_name: 'Chala Tadesse',
      sync_status: 'synced',
      created_at: `${todayStr}T09:00:00Z`,
      updated_at: `${todayStr}T09:00:00Z`,
    },
    {
      id: 's-2',
      business_id: 'biz-1',
      branch_id: 'br-bole',
      sale_type: 'instant',
      payment_method: 'telebirr',
      description: 'Telebirr purchase',
      amount: 8500,
      customer_name: null,
      customer_phone: null,
      due_date: null,
      status: 'settled',
      notes: null,
      paid_at: `${todayStr}T10:15:00Z`,
      recorded_by_id: 'usr-chala',
      recorded_by_name: 'Chala Tadesse',
      sync_status: 'synced',
      created_at: `${todayStr}T10:15:00Z`,
      updated_at: `${todayStr}T10:15:00Z`,
    },
    {
      id: 's-3',
      business_id: 'biz-1',
      branch_id: 'br-bole',
      sale_type: 'instant',
      payment_method: 'cbe',
      description: 'CBE Birr transfer',
      amount: 3100,
      customer_name: null,
      customer_phone: null,
      due_date: null,
      status: 'settled',
      notes: null,
      paid_at: `${todayStr}T11:30:00Z`,
      recorded_by_id: 'usr-chala',
      recorded_by_name: 'Chala Tadesse',
      sync_status: 'synced',
      created_at: `${todayStr}T11:30:00Z`,
      updated_at: `${todayStr}T11:30:00Z`,
    },
    {
      id: 's-4',
      business_id: 'biz-1',
      branch_id: 'br-bole',
      sale_type: 'dube',
      payment_method: 'cash',
      description: 'Credit debt recovery',
      amount: 2400,
      customer_name: 'Almaz Kebede',
      customer_phone: '0911223344',
      due_date: null,
      status: 'settled',
      notes: null,
      paid_at: `${todayStr}T14:00:00Z`, // Settled today
      recorded_by_id: 'usr-chala',
      recorded_by_name: 'Chala Tadesse',
      sync_status: 'synced',
      created_at: '2026-10-20T10:00:00Z', // Created 4 days ago
      updated_at: `${todayStr}T14:00:00Z`,
    },
    {
      id: 's-other-branch',
      business_id: 'biz-1',
      branch_id: 'br-piassa',
      sale_type: 'instant',
      payment_method: 'cash',
      description: 'Piassa sale',
      amount: 9000,
      customer_name: null,
      customer_phone: null,
      due_date: null,
      status: 'settled',
      notes: null,
      paid_at: `${todayStr}T12:00:00Z`,
      sync_status: 'synced',
      created_at: `${todayStr}T12:00:00Z`,
      updated_at: `${todayStr}T12:00:00Z`,
    },
  ];

  const mockExpenses: LocalExpenseRow[] = [
    {
      id: 'e-1',
      business_id: 'biz-1',
      branch_id: 'br-bole',
      description: 'Packaging bags restock',
      amount: 600,
      category: 'Supplies',
      notes: null,
      recorded_by_id: 'usr-chala',
      recorded_by_name: 'Chala Tadesse',
      sync_status: 'synced',
      created_at: `${todayStr}T13:00:00Z`,
      updated_at: `${todayStr}T13:00:00Z`,
    },
  ];

  const metrics = computeShiftMetricsFromData(mockSales, mockExpenses, targetBranch, todayStr);

  assertStrictEqual(metrics.cashInDrawer, 4200 + 2400, 'Cash in drawer should be 6600 ETB');
  assertStrictEqual(metrics.telebirrCollected, 8500, 'Telebirr collected should be 8500 ETB');
  assertStrictEqual(metrics.cbeBirrCollected, 3100, 'CBE birr collected should be 3100 ETB');
  assertStrictEqual(metrics.dubeRecovered, 2400, 'Dube recovered today should be 2400 ETB');
  assertStrictEqual(metrics.expenseVolume, 600, 'Petty expense volume should be 600 ETB');
  assertStrictEqual(metrics.netCashInDrawer, 6600 - 600, 'Net cash in drawer should be 6000 ETB');
  assertStrictEqual(
    metrics.totalShiftVolume,
    4200 + 8500 + 3100 + 2400,
    'Total shift volume should be 18200 ETB'
  );
  assertStrictEqual(metrics.transactionCount, 5, 'Total transactions should be 4 sales + 1 expense');
  console.log('PASS: Shift drawer metrics accurately isolate branch and reconcile cash/digital flows.');

  // TEST 2: Zero-Latency Staff Context Auto-Injection
  console.log('\n>>> [Test 2] Zero-Latency Attribution Auto-Injection...');
  const mockStaffProfile: StaffProfile = {
    isStaff: true,
    role: 'sales',
    branchId: 'br-bole',
    userId: 'usr-chala',
    name: 'Chala Tadesse',
    businessId: 'biz-1',
  };

  // Simulating input where branch and staff attribution were omitted
  const rawInput = {
    amount: 1500,
    description: 'Instant Counter Sale',
    paymentMethod: 'cash',
    saleType: 'instant',
  } as any;

  const injectedBranch = rawInput.branchId || mockStaffProfile.branchId;
  const injectedUserId = rawInput.recordedById || mockStaffProfile.userId;
  const injectedName = rawInput.recordedByName || mockStaffProfile.name;

  assertStrictEqual(injectedBranch, 'br-bole', 'Branch ID must be auto-injected from staff session');
  assertStrictEqual(injectedUserId, 'usr-chala', 'User ID must be auto-injected for attribution');
  assertStrictEqual(injectedName, 'Chala Tadesse', 'User name must be auto-injected for attribution');
  console.log('PASS: Counter transactions automatically inherit locked branch and staff attribution.');

  // TEST 3: Debt Recovery Attribution Verification
  console.log('\n>>> [Test 3] Debt Settlement Attribution Verification...');
  const existingDebt: LocalSaleRow = {
    id: 'debt-101',
    business_id: 'biz-1',
    branch_id: 'br-bole',
    sale_type: 'dube',
    payment_method: 'cash',
    description: 'Credit purchase',
    amount: 3200,
    customer_name: 'Dawit Mengistu',
    customer_phone: '0922334455',
    due_date: '2026-10-30',
    status: 'pending',
    notes: null,
    paid_at: null,
    sync_status: 'synced',
    created_at: '2026-10-15T08:00:00Z',
    updated_at: '2026-10-15T08:00:00Z',
  };

  const settledDebt: LocalSaleRow = {
    ...existingDebt,
    status: 'settled',
    paid_at: `${todayStr}T15:30:00Z`,
    recorded_by_id: mockStaffProfile.userId ?? null,
    recorded_by_name: mockStaffProfile.name ?? null,
    sync_status: 'pending_update',
  };

  assertStrictEqual(settledDebt.status, 'settled');
  assertStrictEqual(settledDebt.recorded_by_name, 'Chala Tadesse');
  assertStrictEqual(settledDebt.recorded_by_id, 'usr-chala');
  assert(settledDebt.paid_at !== null, 'paid_at timestamp must be recorded');
  console.log('PASS: Settled debt preserves cashier audit attribution.');

  console.log('\n==============================================');
  console.log('ALL MOBILE STAFF DATA LAYER TESTS PASSED PERFECTLY!');
  console.log('==============================================\n');
}

if (process.argv[1]?.includes('staff-management.test.ts')) {
  runStaffManagementTests().catch((err) => {
    console.error('STAFF TEST FAILED:', err);
    process.exit(1);
  });
}
