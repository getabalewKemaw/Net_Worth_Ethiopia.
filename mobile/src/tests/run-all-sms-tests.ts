(globalThis as any).__DEV__ = true;

import { runSmsParserTests } from './sms-parsers.test';
import { runDeduplicationAndGroupingTests } from './sms-deduplication.test';
import { runServiceAndStoreTests } from './sms-service-store.test';
import { runConversionModalTests } from './sms-conversion-modals.test';

async function runAllSmsTests() {
  console.log('\n############################################################');
  console.log('NETWORTH ETHIOPIA — SMS BANK FETCHING MASTER TEST RUNNER');
  console.log('############################################################\n');

  const startTotal = Date.now();

  try {
    console.log('>>> [1/4] Running Bank SMS Parsers & Edge Cases Suite...');
    runSmsParserTests();

    console.log('>>> [2/4] Running SQLite Deduplication & Stress Suite...');
    runDeduplicationAndGroupingTests();

    console.log('>>> [3/4] Running Text Fetching Service & Zustand Store Suite...');
    await runServiceAndStoreTests();

    console.log('>>> [4/4] Running Bookkeeping Conversion & Settlement Suite...');
    await runConversionModalTests();

    const totalElapsed = Date.now() - startTotal;
    console.log('\n############################################################');
    console.log(`ALL TEST SUITES PASSED PERFECTLY IN ${totalElapsed}ms!`);
    console.log('############################################################\n');
  } catch (error) {
    console.error('TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

runAllSmsTests();
