// Ensure React Native / Expo globals exist in Node test environment
(globalThis as any).__DEV__ = true;

import { useTextFetchingStore } from '../store/text-fetching-store';
import { textFetchingService, computeSummariesFromTransactions } from '../service/text-fetching';
import { bankParserRegistry } from '../features/text-fetching/parsers/parser-registry';
import { MOCK_BANK_SMS_MESSAGES } from '../mocks/mock-bank-sms';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

export async function runServiceAndStoreTests() {
  console.log('==============================================');
  console.log('STARTING PHASE 4: SERVICE & STORE TESTS');
  console.log('==============================================\n');

  // Test 1: textFetchingService.scanAndProcessInbox without native SMS binary (clean fallback)
  console.log('Test 1: Testing textFetchingService.scanAndProcessInbox() in non-native environment...');
  const serviceResult = await textFetchingService.scanAndProcessInbox(
    'test_biz_1',
    'test_branch_1'
  );

  // In Node test environment, native SMS is not present so it returns 0 scanned messages cleanly
  assert(serviceResult.scanned === 0, 'Should return 0 scanned without native binary');
  assert(serviceResult.parsed === 0, 'Should return 0 parsed without native binary');
  console.log('PASS: Gracefully returned 0 messages when native module is absent without mock pollution.\n');

  // Test 2: computeSummariesFromTransactions
  console.log('Test 2: Testing computeSummariesFromTransactions()...');
  const sampleTransactions = bankParserRegistry.parseBatch(MOCK_BANK_SMS_MESSAGES);
  const computedSummaries = computeSummariesFromTransactions(sampleTransactions);

  assert(computedSummaries.telebirr.depositCount === 2, 'telebirr should have 2 deposits');
  assert(computedSummaries.telebirr.expenseCount === 1, 'telebirr should have 1 expense');
  assert(computedSummaries.telebirr.totalDeposits === 1300, 'telebirr deposits should equal 1300');
  assert(computedSummaries.telebirr.totalExpenses === 2500, 'telebirr expenses should equal 2500');
  assert(
    computedSummaries.telebirr.latestBalance === 12450 ||
    computedSummaries.telebirr.latestBalance === 13300,
    `telebirr balance expected 12450 or 13300, got ${computedSummaries.telebirr.latestBalance}`
  );

  assert(computedSummaries.cbe.depositCount === 1, 'CBE should have 1 deposit');
  assert(computedSummaries.cbe.expenseCount === 1, 'CBE should have 1 expense');
  assert(computedSummaries.cbe.totalDeposits === 1800, 'CBE deposit should equal 1800');
  assert(computedSummaries.cbe.totalExpenses === 1200, 'CBE expense should equal 1200');
  console.log('PASS: Provider summary calculations computed accurately.\n');

  // Test 3: Hydrating store with parsed transactions
  console.log('Test 3: Testing store state & pending count calculation...');
  useTextFetchingStore.setState({
    transactions: sampleTransactions,
    providerSummaries: computedSummaries,
    selectedProvider: 'all',
    selectedStatus: 'all',
    lastScanTime: new Date().toISOString(),
  });

  const state = useTextFetchingStore.getState();
  assert(state.transactions.length === 8, `Store should hold 8 transactions, got ${state.transactions.length}`);
  assert(state.getPendingCount() === 8, 'All 8 transactions should initially be pending');
  console.log(`PASS: Store populated 8 transactions (pending count = ${state.getPendingCount()}).\n`);

  // Test 4: Provider & Status Filtering Selectors
  console.log('Test 4: Testing store filtering selectors...');
  useTextFetchingStore.getState().setProviderFilter('telebirr');
  let filtered = useTextFetchingStore.getState().getFilteredTransactions();
  assert(filtered.length === 3, `Expected 3 telebirr txns, got ${filtered.length}`);

  useTextFetchingStore.getState().setProviderFilter('cbe');
  filtered = useTextFetchingStore.getState().getFilteredTransactions();
  assert(filtered.length === 2, `Expected 2 cbe txns, got ${filtered.length}`);

  useTextFetchingStore.getState().setProviderFilter('all');
  filtered = useTextFetchingStore.getState().getFilteredTransactions();
  assert(filtered.length === 8, `Expected 8 txns with provider 'all', got ${filtered.length}`);
  console.log('PASS: Provider filter correctly filters transactions.\n');

  // Test 5: Dismiss and Status Conversions
  console.log('Test 5: Testing dismissTransaction & markTransactionConverted...');
  const firstTxn = useTextFetchingStore.getState().transactions[0];
  assert(firstTxn.importStatus === 'pending', 'First transaction should be pending');

  // Dismiss first transaction
  await useTextFetchingStore.getState().dismissTransaction(firstTxn.id);
  let updatedFirst = useTextFetchingStore.getState().transactions.find((t) => t.id === firstTxn.id);
  assert(updatedFirst?.importStatus === 'ignored', 'First transaction should now be ignored');
  assert(useTextFetchingStore.getState().getPendingCount() === 7, 'Pending count should decrease to 7');

  // Filter by status 'ignored'
  useTextFetchingStore.getState().setStatusFilter('ignored');
  let ignoredTxns = useTextFetchingStore.getState().getFilteredTransactions();
  assert(ignoredTxns.length === 1, `Expected 1 ignored txn, got ${ignoredTxns.length}`);

  // Convert second transaction to sale
  const secondTxn = useTextFetchingStore.getState().transactions[1];
  await useTextFetchingStore.getState().markTransactionConverted(
    secondTxn.id,
    'converted_sale',
    'sale_entity_123'
  );
  let updatedSecond = useTextFetchingStore.getState().transactions.find((t) => t.id === secondTxn.id);
  assert(updatedSecond?.importStatus === 'converted_sale', 'Second transaction should be converted_sale');
  assert(updatedSecond?.convertedEntityId === 'sale_entity_123', 'convertedEntityId should be recorded');
  assert(useTextFetchingStore.getState().getPendingCount() === 6, 'Pending count should decrease to 6');
  console.log('PASS: Dismiss and conversion actions update store reactively.\n');

  console.log('==============================================');
  console.log('ALL PHASE 4 SERVICE & STORE TESTS PASSED!');
  console.log('==============================================');
}

if (typeof require !== 'undefined' && (require as any).main === module) {
  runServiceAndStoreTests().catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}
