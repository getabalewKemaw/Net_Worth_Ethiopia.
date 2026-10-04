(globalThis as any).__DEV__ = true;

import { useTextFetchingStore } from '../store/text-fetching-store';
import { bankParserRegistry } from '../features/text-fetching/parsers/parser-registry';
import { MOCK_BANK_SMS_MESSAGES } from '../mocks/mock-bank-sms';
import type { DebtItem } from '../types/bidr';
import type { ParsedBankTransaction } from '../types/text-fetching';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function scoreDebtCandidate(transaction: ParsedBankTransaction, debt: DebtItem): number {
  const counterpartyNorm = transaction.counterparty ? normalize(transaction.counterparty) : '';
  const nameNorm = normalize(debt.customerName || '');
  const phoneNorm = normalize(debt.customerPhone || '');

  let score = 0;
  if (counterpartyNorm && (nameNorm.includes(counterpartyNorm) || counterpartyNorm.includes(nameNorm))) {
    score += 5;
  }
  if (phoneNorm && counterpartyNorm && (phoneNorm.includes(counterpartyNorm) || counterpartyNorm.includes(phoneNorm))) {
    score += 10;
  }
  if (Math.abs(debt.amount - transaction.amount) < 0.01) {
    score += 3;
  }
  return score;
}

export async function runConversionModalTests() {
  console.log('==============================================');
  console.log('STARTING PHASE 6: CONVERSION & SETTLEMENT TESTS');
  console.log('==============================================\n');

  // Test 1: Parse and verify deposit vs expense conversion data
  console.log('Test 1: Verifying prefilled conversion mappings...');
  const txns = bankParserRegistry.parseBatch(MOCK_BANK_SMS_MESSAGES);
  const depositTxn = txns.find((t) => t.transactionFlow === 'deposit')!;
  const expenseTxn = txns.find((t) => t.transactionFlow === 'expense')!;

  assert(depositTxn !== undefined, 'Should have at least 1 deposit transaction');
  assert(expenseTxn !== undefined, 'Should have at least 1 expense transaction');

  // Sale mapping check
  const prefilledSale = {
    amount: depositTxn.amount,
    customer: depositTxn.counterparty || undefined,
    paymentMethod: depositTxn.provider === 'telebirr' ? 'telebirr' : 'cbe',
    notes: `SMS Ref: ${depositTxn.transactionRef}`,
  };
  assert(prefilledSale.amount === 450, `Expected sale amount 450, got ${prefilledSale.amount}`);
  assert(
    Boolean(prefilledSale.customer?.includes('ABEBE KEBEDE')),
    `Customer name expected to include ABEBE KEBEDE, got ${prefilledSale.customer}`
  );
  assert(prefilledSale.paymentMethod === 'telebirr', 'Payment method should map to telebirr');
  console.log('PASS: Sale prefilled fields match SMS deposit data.\n');

  // Expense mapping check
  const prefilledExpense = {
    amount: expenseTxn.amount,
    category: 'Supplier',
    notes: `SMS Ref: ${expenseTxn.transactionRef}`,
  };
  assert(prefilledExpense.amount === 2500, `Expected expense amount 2500, got ${prefilledExpense.amount}`);
  console.log('PASS: Expense prefilled fields match SMS transfer data.\n');

  // Test 2: Debt matching algorithm
  console.log('Test 2: Testing Bidr customer debt matching score algorithm...');
  const mockDebts: DebtItem[] = [
    {
      id: 'debt-1',
      businessId: 'biz-1',
      branchId: 'branch-1',
      customerName: 'Abebe Kebede',
      customerPhone: '0911223344',
      amount: 450.0,
      description: 'Groceries dube',
      saleType: 'dube',
      paymentMethod: 'cash',
      status: 'pending',
      createdAt: '2026-10-01T10:00:00Z',
      updatedAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'debt-2',
      businessId: 'biz-1',
      branchId: 'branch-1',
      customerName: 'Chala Tolosa',
      customerPhone: '0922334455',
      amount: 1800.0,
      description: 'Flour sacks',
      saleType: 'dube',
      paymentMethod: 'cash',
      status: 'pending',
      createdAt: '2026-10-02T10:00:00Z',
      updatedAt: '2026-10-02T10:00:00Z',
    },
    {
      id: 'debt-3',
      businessId: 'biz-1',
      branchId: 'branch-1',
      customerName: 'Random Customer',
      customerPhone: '0999999999',
      amount: 100.0,
      description: 'Coffee',
      saleType: 'dube',
      paymentMethod: 'cash',
      status: 'pending',
      createdAt: '2026-10-03T10:00:00Z',
      updatedAt: '2026-10-03T10:00:00Z',
    },
  ];

  // Test match with depositTxn (from ABEBE KEBEDE, amount 450)
  const scoreDebt1 = scoreDebtCandidate(depositTxn, mockDebts[0]);
  const scoreDebt2 = scoreDebtCandidate(depositTxn, mockDebts[1]);
  const scoreDebt3 = scoreDebtCandidate(depositTxn, mockDebts[2]);

  assert(scoreDebt1 >= 8, `Expected high match score (>=8) for Abebe Kebede, got ${scoreDebt1}`);
  assert(scoreDebt2 === 0, `Expected score 0 for Chala Tolosa, got ${scoreDebt2}`);
  assert(scoreDebt3 === 0, `Expected score 0 for Random Customer, got ${scoreDebt3}`);
  console.log(`PASS: Debt matching score for Abebe Kebede is ${scoreDebt1} (name match + exact amount match).\n`);

  // Test 3: Settle debt conversion in store
  console.log('Test 3: Testing store markTransactionConverted as settled_debt...');
  await useTextFetchingStore.getState().scanInbox({ forceMock: true });
  const pendingDeposit = useTextFetchingStore.getState().transactions.find(
    (t) => t.transactionRef === depositTxn.transactionRef
  );
  assert(Boolean(pendingDeposit), 'Transaction should exist in store');
  if (!pendingDeposit) throw new Error('Transaction should exist');

  await useTextFetchingStore.getState().markTransactionConverted(
    pendingDeposit.id,
    'settled_debt',
    'debt-1'
  );

  const settledTxn = useTextFetchingStore.getState().transactions.find(
    (t) => t.id === pendingDeposit.id
  );
  assert(settledTxn?.importStatus === 'settled_debt', 'Status should be settled_debt');
  assert(settledTxn?.convertedEntityId === 'debt-1', 'convertedEntityId should point to debt-1');
  console.log('PASS: SMS transaction marked as settled_debt linked to debt-1.\n');

  console.log('==============================================');
  console.log('ALL PHASE 6 CONVERSION & SETTLEMENT TESTS PASSED!');
  console.log('==============================================');
}

runConversionModalTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
