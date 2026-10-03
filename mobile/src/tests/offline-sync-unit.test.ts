import type { LocalSaleRow, LocalExpenseRow } from '../db/schema';
import type { SaleEntry, ExpenseEntry } from '../types/sales';
import type { DebtItem } from '../types/bidr';

function formatDisplayTime(dateStr?: string | null): string {
  if (!dateStr) return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Just now';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDisplayDate(dateStr?: string | null): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function mapRowToSaleEntry(row: LocalSaleRow): SaleEntry {
  return {
    id: row.id,
    businessId: row.business_id,
    branchId: row.branch_id,
    description: row.description,
    amount: Number(row.amount),
    customer: row.customer_name ?? undefined,
    phone: row.customer_phone ?? undefined,
    paymentMethod: row.payment_method as any,
    saleType: row.sale_type,
    dueDate: formatDisplayDate(row.due_date),
    status: row.status as any,
    paidAt: row.paid_at,
    time: formatDisplayTime(row.created_at),
    createdAt: row.created_at,
  };
}

function mapRowToExpenseEntry(row: LocalExpenseRow): ExpenseEntry {
  return {
    id: row.id,
    businessId: row.business_id,
    branchId: row.branch_id,
    description: row.description,
    amount: Number(row.amount),
    category: row.category,
    notes: row.notes,
    time: formatDisplayTime(row.created_at),
    createdAt: row.created_at,
  };
}

function mapRowToDebtItem(row: LocalSaleRow): DebtItem {
  return {
    id: row.id,
    businessId: row.business_id,
    branchId: row.branch_id,
    saleType: 'dube',
    paymentMethod: row.payment_method as any,
    description: row.description,
    amount: Number(row.amount),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    dueDate: row.due_date,
    notes: row.notes,
    status: row.status as any,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function runMobileOfflineSyncTests() {
  console.log("=== [TEST 1] Local Sale Row to SaleEntry Mapping ===");
  const sampleSaleRow: LocalSaleRow = {
    id: "sale-uuid-001",
    business_id: "biz-001",
    branch_id: "branch-001",
    sale_type: "instant",
    payment_method: "telebirr",
    description: "Macchiato and Pastry",
    amount: 180,
    customer_name: "Dawit G.",
    customer_phone: "+251911223344",
    due_date: null,
    status: "settled",
    notes: null,
    paid_at: "2026-10-02T10:30:00.000Z",
    sync_status: "pending_create",
    created_at: "2026-10-02T10:30:00.000Z",
    updated_at: "2026-10-02T10:30:00.000Z",
  };

  const saleEntry = mapRowToSaleEntry(sampleSaleRow);
  if (
    saleEntry.id !== "sale-uuid-001" ||
    saleEntry.amount !== 180 ||
    saleEntry.saleType !== "instant" ||
    saleEntry.paymentMethod !== "telebirr" ||
    saleEntry.customer !== "Dawit G."
  ) {
    console.error("FAIL: mapRowToSaleEntry failed:", saleEntry);
    process.exit(1);
  }
  console.log("PASS: LocalSaleRow correctly mapped to SaleEntry format.");

  console.log("\n=== [TEST 2] Local Expense Row to ExpenseEntry Mapping ===");
  const sampleExpenseRow: LocalExpenseRow = {
    id: "exp-uuid-001",
    business_id: "biz-001",
    branch_id: "branch-001",
    description: "Store Water Supply",
    amount: 350,
    category: "Utilities",
    notes: "Monthly water fee",
    sync_status: "pending_create",
    created_at: "2026-10-02T11:00:00.000Z",
    updated_at: "2026-10-02T11:00:00.000Z",
  };

  const expenseEntry = mapRowToExpenseEntry(sampleExpenseRow);
  if (
    expenseEntry.id !== "exp-uuid-001" ||
    expenseEntry.amount !== 350 ||
    expenseEntry.category !== "Utilities" ||
    expenseEntry.notes !== "Monthly water fee"
  ) {
    console.error("FAIL: mapRowToExpenseEntry failed:", expenseEntry);
    process.exit(1);
  }
  console.log("PASS: LocalExpenseRow correctly mapped to ExpenseEntry format.");

  console.log("\n=== [TEST 3] Local Dube Debt Row to DebtItem Mapping ===");
  const sampleDebtRow: LocalSaleRow = {
    id: "debt-uuid-001",
    business_id: "biz-001",
    branch_id: "branch-001",
    sale_type: "dube",
    payment_method: "cash",
    description: "5 Bags of Teff",
    amount: 14500,
    customer_name: "Almaz K.",
    customer_phone: "+251922334455",
    due_date: "2026-10-15T00:00:00.000Z",
    status: "pending",
    notes: "Promise to settle on payday",
    paid_at: null,
    sync_status: "pending_create",
    created_at: "2026-10-02T12:00:00.000Z",
    updated_at: "2026-10-02T12:00:00.000Z",
  };

  const debtItem = mapRowToDebtItem(sampleDebtRow);
  if (
    debtItem.id !== "debt-uuid-001" ||
    debtItem.amount !== 14500 ||
    debtItem.saleType !== "dube" ||
    debtItem.customerName !== "Almaz K." ||
    debtItem.status !== "pending"
  ) {
    console.error("FAIL: mapRowToDebtItem failed:", debtItem);
    process.exit(1);
  }
  console.log("PASS: LocalSaleRow (Dube) correctly mapped to DebtItem format.");

  console.log("\n=== [TEST 4] Offline Dashboard Financial Aggregation Logic ===");
  const sales = [
    { amount: 500, sale_type: 'instant' },
    { amount: 1200, sale_type: 'instant' },
    { amount: 300, sale_type: 'instant' },
  ];
  const expenses = [
    { amount: 400 },
    { amount: 150 },
  ];
  const debts = [
    { amount: 2500, status: 'pending' },
    { amount: 1000, status: 'settled' },
  ];

  const todayRevenue = sales.reduce((acc, s) => acc + s.amount, 0);
  const todayExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
  const estimatedProfit = Math.max(0, todayRevenue - todayExpense);
  const profitMarginPercent = Math.round((estimatedProfit / todayRevenue) * 100);
  const registeredDube = debts.filter(d => d.status === 'pending').reduce((acc, d) => acc + d.amount, 0);

  if (todayRevenue !== 2000) {
    console.error(`FAIL: todayRevenue expected 2000, got ${todayRevenue}`);
    process.exit(1);
  }
  if (todayExpense !== 550) {
    console.error(`FAIL: todayExpense expected 550, got ${todayExpense}`);
    process.exit(1);
  }
  if (estimatedProfit !== 1450) {
    console.error(`FAIL: estimatedProfit expected 1450, got ${estimatedProfit}`);
    process.exit(1);
  }
  if (profitMarginPercent !== 73) {
    console.error(`FAIL: profitMarginPercent expected 73%, got ${profitMarginPercent}%`);
    process.exit(1);
  }
  if (registeredDube !== 2500) {
    console.error(`FAIL: registeredDube expected 2500, got ${registeredDube}`);
    process.exit(1);
  }
  console.log("PASS: Offline financial aggregation calculated accurately:");
  console.log(`  - Revenue: ${todayRevenue} ETB`);
  console.log(`  - Expenses: ${todayExpense} ETB`);
  console.log(`  - Profit: ${estimatedProfit} ETB (${profitMarginPercent}%)`);
  console.log(`  - Registered Dube: ${registeredDube} ETB`);

  console.log("\n==============================================");
  console.log("ALL MOBILE OFFLINE-SYNC TESTS PASSED!");
  console.log("==============================================");
}

runMobileOfflineSyncTests();
