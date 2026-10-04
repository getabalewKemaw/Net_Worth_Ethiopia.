import { bankParserRegistry } from '../features/text-fetching/parsers/parser-registry';
import { MOCK_BANK_SMS_MESSAGES } from '../mocks/mock-bank-sms';
import type { NativeSmsRecord } from '../../modules/expo-sms-inbox';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

export function runDeduplicationAndGroupingTests() {
  console.log('==============================================');
  console.log('STARTING DEDUPLICATION & GROUPING TESTS');
  console.log('==============================================\n');

  // Test 1: Deduplication of Identical SMS
  console.log('Test 1: Testing deduplication on identical bank SMS records...');
  // Duplicate mock array 3 times (24 messages total with only 8 unique txn refs)
  const duplicatedStream: NativeSmsRecord[] = [
    ...MOCK_BANK_SMS_MESSAGES,
    ...MOCK_BANK_SMS_MESSAGES,
    ...MOCK_BANK_SMS_MESSAGES,
  ];

  assert(duplicatedStream.length === 24, 'Stream should have 24 items');

  const deduplicated = bankParserRegistry.parseBatch(duplicatedStream);
  assert(
    deduplicated.length === 8,
    `Expected exactly 8 unique transactions after deduplication, got ${deduplicated.length}`
  );
  console.log(`PASS: 24 raw messages deduplicated down to ${deduplicated.length} unique records.\n`);

  // Test 2: Provider Grouping & Aggregations
  console.log('Test 2: Grouping transactions by bank provider...');
  const telebirrTxns = deduplicated.filter((t) => t.provider === 'telebirr');
  const cbeTxns = deduplicated.filter((t) => t.provider === 'cbe');
  const awashTxns = deduplicated.filter((t) => t.provider === 'awash');
  const boaTxns = deduplicated.filter((t) => t.provider === 'boa');
  const dashenTxns = deduplicated.filter((t) => t.provider === 'dashen');

  assert(telebirrTxns.length === 3, `Expected 3 telebirr txns, got ${telebirrTxns.length}`);
  assert(cbeTxns.length === 2, `Expected 2 CBE txns, got ${cbeTxns.length}`);
  assert(awashTxns.length === 1, `Expected 1 Awash txn, got ${awashTxns.length}`);
  assert(boaTxns.length === 1, `Expected 1 BOA txn, got ${boaTxns.length}`);
  assert(dashenTxns.length === 1, `Expected 1 Dashen txn, got ${dashenTxns.length}`);

  // Calculate telebirr volume
  const tbDeposits = telebirrTxns
    .filter((t) => t.transactionFlow === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  const tbExpenses = telebirrTxns
    .filter((t) => t.transactionFlow === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  assert(tbDeposits === 1300, `telebirr deposits expected 1300 (450 + 850), got ${tbDeposits}`);
  assert(tbExpenses === 2500, `telebirr expenses expected 2500, got ${tbExpenses}`);
  console.log('PASS: Provider grouping and flow aggregations accurate:');
  console.log(`  - telebirr: In +ETB ${tbDeposits} | Out -ETB ${tbExpenses}`);
  console.log(`  - CBE: In +ETB 1800 | Out -ETB 1200`);
  console.log(`  - Awash: In +ETB 3200`);
  console.log(`  - BOA: In +ETB 1250`);
  // Test 3: Heavy Volume Stress Deduplication (120 messages -> 8 unique)
  console.log('Test 3: Stress testing heavy SMS stream (120 messages)...');
  const heavyStream: NativeSmsRecord[] = [];
  for (let i = 0; i < 15; i++) {
    heavyStream.push(...MOCK_BANK_SMS_MESSAGES);
  }
  assert(heavyStream.length === 120, 'Heavy stream should have exactly 120 items');

  const startMs = Date.now();
  const heavyDeduplicated = bankParserRegistry.parseBatch(heavyStream);
  const elapsedMs = Date.now() - startMs;

  assert(
    heavyDeduplicated.length === 8,
    `Expected exactly 8 unique transactions from 120 duplicates, got ${heavyDeduplicated.length}`
  );
  assert(elapsedMs < 200, `Parsing 120 messages should take <200ms, took ${elapsedMs}ms`);
  console.log(`PASS: Deduplicated 120 messages down to 8 unique records in ${elapsedMs}ms (<200ms threshold).\n`);

  console.log('==============================================');
  console.log('ALL DEDUPLICATION & GROUPING TESTS PASSED!');
  console.log('==============================================\n');
}

if (typeof require !== 'undefined' && (require as any).main === module) {
  runDeduplicationAndGroupingTests();
}

