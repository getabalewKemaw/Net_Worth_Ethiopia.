// Ensure React Native / Expo globals exist in Node test environment
(globalThis as any).__DEV__ = true;

import { useTextFetchingStore } from '../store/text-fetching-store';
import { textFetchingService, computeSummariesFromTransactions } from '../service/text-fetching';
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

  // Test 1: textFetchingService.scanAndProcessInbox with mock data
  console.log('Test 1: Testing textFetchingService.scanAndProcessInbox()...');
  const serviceResult = await textFetchingService.scanAndProcessInbox(
    'test_biz_1',
    'test_branch_1',
    { forceMock: true }
  );

  assert(serviceResult.scanned === MOCK_BANK_SMS_MESSAGES.length, 'Should scan all mock messages');
  assert(serviceResult.parsed === 8, `Expected 8 parsed transactions, got ${serviceResult.parsed}`);
  assert(serviceResult.isMock === true, 'isMock should be true');
  assert(serviceResult.transactions.length === 8, 'Should return 8 transactions');
  console.log(`PASS: Scanned ${serviceResult.scanned}, parsed ${serviceResult.parsed} transactions.\n`);

  // Test 2: computeSummariesFromTransactions
  console.log('Test 2: Testing computeSummariesFromTransactions()...');
  const computedSummaries = computeSummariesFromTransactions(serviceResult.transactions);

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
  console.log('PASS: Provider summary calculations match mock data.\n');

  // Test 3: useTextFetchingStore initial state & scanInbox action
  console.log('Test 3: Testing useTextFetchingStore.getState().scanInbox()...');
  const store = useTextFetchingStore.getState();

  assert(store.transactions.length === 0, 'Initial transactions should be empty');
  assert(store.selectedProvider === 'all', 'Default provider filter should be "all"');
  assert(store.selectedStatus === 'all', 'Default status filter should be "all"');

  const scanResult = await useTextFetchingStore.getState().scanInbox({
    businessId: 'test_biz_1',
    branchId: 'test_branch_1',
    forceMock: true,
  });

  const stateAfterScan = useTextFetchingStore.getState();
  assert(scanResult.parsed === 8, `Store scan should parse 8, got ${scanResult.parsed}`);
  assert(stateAfterScan.transactions.length === 8, 'Store should hold 8 transactions');
  assert(stateAfterScan.isScanning === false, 'isScanning should reset to false');
  assert(stateAfterScan.lastScanTime !== null, 'lastScanTime should be recorded');
  assert(stateAfterScan.getPendingCount() === 8, 'All 8 transactions should initially be pending');
  console.log(`PASS: Store scanned and populated 8 transactions (pending count = ${stateAfterScan.getPendingCount()}).\n`);

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

  // Test 6: Toggle Mock Mode
  console.log('Test 6: Testing toggleMockMode...');
  const currentMockState = useTextFetchingStore.getState().useMockData;
  useTextFetchingStore.getState().toggleMockMode();
  assert(useTextFetchingStore.getState().useMockData !== currentMockState, 'Mock state should toggle');
  useTextFetchingStore.getState().toggleMockMode(true);
  assert(useTextFetchingStore.getState().useMockData === true, 'Mock state forced to true');
  console.log('PASS: toggleMockMode switches state correctly.\n');

  console.log('==============================================');
  console.log('ALL PHASE 4 SERVICE & STORE TESTS PASSED!');
  console.log('==============================================');
}

runServiceAndStoreTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
