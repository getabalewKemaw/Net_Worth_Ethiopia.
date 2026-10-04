import { bankParserRegistry } from '../features/text-fetching/parsers/parser-registry';
import { MOCK_BANK_SMS_MESSAGES } from '../mocks/mock-bank-sms';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

export function runSmsParserTests() {
  console.log('==============================================');
  console.log('STARTING ETHIOPIAN BANK SMS PARSER TESTS');
  console.log('==============================================\n');

  // Test 1: telebirr Incoming (Deposit)
  console.log('Test 1: Parsing telebirr incoming payment...');
  const tbInSms = {
    id: 't1',
    address: '127',
    body: 'Dear customer, you have received ETB 450.00 from 251911223344 (ABEBE KEBEDE) with transaction number: 2026100412345678 on 04/10/2026 14:22:10. Your current balance is ETB 12,450.00.',
    date: Date.now(),
  };
  const tbInParsed = bankParserRegistry.parseMessage(tbInSms);
  assert(tbInParsed !== null, 'telebirr incoming message should be parsed');
  assert(tbInParsed!.provider === 'telebirr', 'Provider should be telebirr');
  assert(tbInParsed!.transactionFlow === 'deposit', 'Flow should be deposit');
  assert(tbInParsed!.amount === 450, `Amount should be 450, got ${tbInParsed!.amount}`);
  assert(tbInParsed!.transactionRef === '2026100412345678', `Txn ref should match, got ${tbInParsed!.transactionRef}`);
  assert(tbInParsed!.currentBalance === 12450, `Balance should be 12450, got ${tbInParsed!.currentBalance}`);
  console.log('PASS: telebirr incoming payment successfully parsed.\n');

  // Test 2: telebirr Outgoing (Expense)
  console.log('Test 2: Parsing telebirr outgoing transfer...');
  const tbOutSms = {
    id: 't2',
    address: 'telebirr',
    body: 'Dear customer, you have transferred ETB 2,500.00 to 251922334455 (ETHIO TRADING PLC) with transaction number: 2026100498765432 on 04/10/2026 13:10:00. Your current balance is ETB 9,950.00.',
    date: Date.now(),
  };
  const tbOutParsed = bankParserRegistry.parseMessage(tbOutSms);
  assert(tbOutParsed !== null, 'telebirr outgoing message should be parsed');
  assert(tbOutParsed!.transactionFlow === 'expense', 'Flow should be expense');
  assert(tbOutParsed!.amount === 2500, `Amount should be 2500, got ${tbOutParsed!.amount}`);
  assert(tbOutParsed!.transactionRef === '2026100498765432', 'Txn ref should match');
  console.log('PASS: telebirr outgoing transfer successfully parsed.\n');

  // Test 3: CBE Credit (Deposit)
  console.log('Test 3: Parsing CBE credit notification...');
  const cbeInSms = {
    id: 't3',
    address: 'CBE',
    body: 'Dear Customer, Your account 1000****1234 has been credited with ETB 1,800.00 on 04/10/2026 by CHALA TOLOSA. Ref: FT26278ABCD1. Your current balance is ETB 45,200.50. Thank you for banking with CBE!',
    date: Date.now(),
  };
  const cbeInParsed = bankParserRegistry.parseMessage(cbeInSms);
  assert(cbeInParsed !== null, 'CBE credit message should be parsed');
  assert(cbeInParsed!.provider === 'cbe', 'Provider should be cbe');
  assert(cbeInParsed!.transactionFlow === 'deposit', 'Flow should be deposit');
  assert(cbeInParsed!.amount === 1800, `Amount should be 1800, got ${cbeInParsed!.amount}`);
  assert(cbeInParsed!.accountMasked === '1000****1234', `Account should be 1000****1234, got ${cbeInParsed!.accountMasked}`);
  assert(cbeInParsed!.transactionRef === 'FT26278ABCD1', `Txn ref should be FT26278ABCD1, got ${cbeInParsed!.transactionRef}`);
  assert(cbeInParsed!.counterparty === 'CHALA TOLOSA', `Counterparty should be CHALA TOLOSA, got ${cbeInParsed!.counterparty}`);
  console.log('PASS: CBE credit notification successfully parsed.\n');

  // Test 4: CBE Debit (Expense)
  console.log('Test 4: Parsing CBE debit notification...');
  const cbeOutSms = {
    id: 't4',
    address: 'CBEBirr',
    body: 'Dear Customer, Your account 1000****1234 has been debited with ETB 1,200.00 on 04/10/2026 for SHOP UTILITIES PAYMENT. Ref: FT26279WXYZ2. Current Balance: ETB 44,000.50.',
    date: Date.now(),
  };
  const cbeOutParsed = bankParserRegistry.parseMessage(cbeOutSms);
  assert(cbeOutParsed !== null, 'CBE debit message should be parsed');
  assert(cbeOutParsed!.transactionFlow === 'expense', 'Flow should be expense');
  assert(cbeOutParsed!.amount === 1200, `Amount should be 1200, got ${cbeOutParsed!.amount}`);
  console.log('PASS: CBE debit notification successfully parsed.\n');

  // Test 5: Awash Bank Credit
  console.log('Test 5: Parsing Awash Bank credit notification...');
  const awashSms = {
    id: 't5',
    address: 'AWASH',
    body: 'Dear Customer, your A/C 0132****5678 has been credited by ETB 3,200.00 from ALMAZ AYANA on 04-Oct-2026. Txn ID: AW261004991. Current Bal ETB 28,150.00.',
    date: Date.now(),
  };
  const awashParsed = bankParserRegistry.parseMessage(awashSms);
  assert(awashParsed !== null, 'Awash message should be parsed');
  assert(awashParsed!.provider === 'awash', 'Provider should be awash');
  assert(awashParsed!.amount === 3200, `Amount should be 3200, got ${awashParsed!.amount}`);
  assert(awashParsed!.transactionRef === 'AW261004991', 'Txn ref should match');
  console.log('PASS: Awash Bank credit successfully parsed.\n');

  // Test 6: Bank of Abyssinia (BOA)
  console.log('Test 6: Parsing Bank of Abyssinia notification...');
  const boaSms = {
    id: 't6',
    address: 'BOA',
    body: 'Dear Customer, ETB 1,250.00 has been credited to your account 2098****4321 on 04/10/2026. Sender: MIKIYAS BEKELE. Ref: BOA26100412. Available balance: ETB 14,800.00.',
    date: Date.now(),
  };
  const boaParsed = bankParserRegistry.parseMessage(boaSms);
  assert(boaParsed !== null, 'BOA message should be parsed');
  assert(boaParsed!.provider === 'boa', 'Provider should be boa');
  assert(boaParsed!.amount === 1250, `Amount should be 1250, got ${boaParsed!.amount}`);
  assert(boaParsed!.transactionRef === 'BOA26100412', 'Txn ref should match');
  console.log('PASS: Bank of Abyssinia successfully parsed.\n');

  // Test 7: Batch Parsing of Mock Dataset
  console.log('Test 7: Batch parsing all mock messages...');
  const batchParsed = bankParserRegistry.parseBatch(MOCK_BANK_SMS_MESSAGES);
  assert(batchParsed.length === MOCK_BANK_SMS_MESSAGES.length, `Expected ${MOCK_BANK_SMS_MESSAGES.length} parsed items, got ${batchParsed.length}`);
  console.log(`PASS: Batch parsed ${batchParsed.length} transactions with zero errors.\n`);

  // Test 8: Non-Banking SMS Rejection (Privacy verification)
  console.log('Test 8: Rejecting non-banking personal SMS...');
  const personalSms = {
    id: 'p1',
    address: '+251911000000',
    body: 'Hi bro, let us meet for lunch at Bole at 1pm.',
    date: Date.now(),
  };
  const personalParsed = bankParserRegistry.parseMessage(personalSms);
  assert(personalParsed === null, 'Personal SMS must NOT be parsed as bank transaction');
  console.log('PASS: Non-banking SMS safely ignored.\n');

  console.log('==============================================');
  console.log('ALL ETHIOPIAN BANK SMS PARSER TESTS PASSED!');
  console.log('==============================================\n');
}

runSmsParserTests();
