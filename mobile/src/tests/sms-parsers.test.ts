import { bankParserRegistry } from '../features/text-fetching/parsers/parser-registry';
import { MOCK_BANK_SMS_MESSAGES } from '../mocks/mock-bank-sms';
import type { NativeSmsRecord } from '../../modules/expo-sms-inbox';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

export function runSmsParserTests() {
  console.log('==============================================');
  console.log('STARTING ETHIOPIAN BANK SMS PARSER & EDGE CASES TESTS');
  console.log('==============================================\n');

  // Test 1: telebirr Incoming (Deposit)
  console.log('Test 1: Parsing telebirr incoming payment...');
  const tb1 = bankParserRegistry.parseMessage({
    id: 't1',
    address: '127',
    body: 'Dear customer, you have received ETB 450.00 from 251911223344 (ABEBE KEBEDE) with transaction number: 2026100412345678 on 04/10/2026 14:22:10. Your current balance is ETB 12,450.00.',
    date: Date.now(),
  });
  assert(tb1 !== null && tb1.provider === 'telebirr' && tb1.amount === 450 && tb1.transactionFlow === 'deposit', 'tb1 failed');
  assert(tb1!.transactionRef === '2026100412345678', 'tb1 txnRef failed');
  console.log('PASS: telebirr incoming payment parsed.\n');

  // Test 2: telebirr Outgoing (Expense)
  console.log('Test 2: Parsing telebirr outgoing transfer...');
  const tb2 = bankParserRegistry.parseMessage({
    id: 't2',
    address: 'telebirr',
    body: 'Dear customer, you have transferred ETB 2,500.00 to 251922334455 (ETHIO TRADING PLC) with transaction number: 2026100498765432 on 04/10/2026 13:10:00. Your current balance is ETB 9,950.00.',
    date: Date.now(),
  });
  assert(tb2 !== null && tb2.provider === 'telebirr' && tb2.amount === 2500 && tb2.transactionFlow === 'expense', 'tb2 failed');
  console.log('PASS: telebirr outgoing transfer parsed.\n');

  // Test 3: telebirr Incoming without customer name (Phone only)
  console.log('Test 3: telebirr incoming without customer name (phone only)...');
  const tb3 = bankParserRegistry.parseMessage({
    id: 't3',
    address: '127',
    body: 'Dear customer, you have received ETB 150.00 from 251933445566 with transaction number: 2026100411223344 on 04/10/2026. Your current balance is ETB 10,100.00.',
    date: Date.now(),
  });
  assert(tb3 !== null && tb3.amount === 150 && Boolean(tb3.counterparty?.includes('251933445566')), 'tb3 failed');
  console.log('PASS: telebirr phone-only counterparty parsed.\n');

  // Test 4: telebirr in Amharic
  console.log('Test 4: telebirr incoming in Amharic...');
  const tbAmharic = bankParserRegistry.parseMessage({
    id: 't4',
    address: '127',
    body: 'ውድ ደንበኛ፣ ከ 251911223344 (ABEBE KEBEDE) ETB 500.00 ተቀብለዋል። የግብይት ቁጥር፡ 2026100499887766። አጠቃላይ ሂሳብዎ ETB 15,000.00 ነው።',
    date: Date.now(),
  });
  assert(tbAmharic !== null && tbAmharic.amount === 500 && tbAmharic.transactionFlow === 'deposit', 'tbAmharic failed');
  console.log('PASS: telebirr Amharic incoming payment parsed.\n');

  // Test 5: telebirr Outgoing in Amharic
  console.log('Test 5: telebirr outgoing transfer in Amharic...');
  const tbAmharicOut = bankParserRegistry.parseMessage({
    id: 't5',
    address: '127',
    body: 'ውድ ደንበኛ፣ ወደ 251944556677 ETB 350.00 ተላልፏል። የግብይት ቁጥር፡ 2026100455443322። ቀሪ ሂሳብ ETB 14,650.00 ነው።',
    date: Date.now(),
  });
  assert(tbAmharicOut !== null && tbAmharicOut.amount === 350 && tbAmharicOut.transactionFlow === 'expense', 'tbAmharicOut failed');
  console.log('PASS: telebirr Amharic outgoing payment parsed.\n');

  // Test 6: CBE Credit with Payer Name
  console.log('Test 6: Parsing CBE credit with payer name...');
  const cbe1 = bankParserRegistry.parseMessage({
    id: 't6',
    address: 'CBE',
    body: 'Dear Customer, Your account 1000****1234 has been credited with ETB 1,800.00 on 04/10/2026 by CHALA TOLOSA. Ref: FT26278ABCD1. Your current balance is ETB 45,200.50. Thank you for banking with CBE!',
    date: Date.now(),
  });
  assert(cbe1 !== null && cbe1.provider === 'cbe' && cbe1.amount === 1800 && cbe1.counterparty === 'CHALA TOLOSA', 'cbe1 failed');
  console.log('PASS: CBE credit notification parsed.\n');

  // Test 7: CBE Debit for Utilities
  console.log('Test 7: Parsing CBE debit for utilities...');
  const cbe2 = bankParserRegistry.parseMessage({
    id: 't7',
    address: 'CBE',
    body: 'Dear Customer, Your account 1000****1234 has been debited with ETB 1,200.00 on 04/10/2026 for SHOP UTILITIES PAYMENT. Ref: FT26279WXYZ2. Current Balance: ETB 44,000.50.',
    date: Date.now(),
  });
  assert(cbe2 !== null && cbe2.amount === 1200 && cbe2.transactionFlow === 'expense', 'cbe2 failed');
  console.log('PASS: CBE debit notification parsed.\n');

  // Test 8: CBE in Amharic
  console.log('Test 8: Parsing CBE in Amharic...');
  const cbeAmharic = bankParserRegistry.parseMessage({
    id: 't8',
    address: 'CBE',
    body: 'ውድ ደንበኛ፣ የሂሳብ ቁጥርዎ 1000****1234 በ ETB 3,500.00 ገቢ ሆኗል። Ref: FT26278ETHIO1. ቀሪ ሂሳብ ETB 47,500.50 ነው።',
    date: Date.now(),
  });
  assert(cbeAmharic !== null && cbeAmharic.amount === 3500 && cbeAmharic.transactionFlow === 'deposit', 'cbeAmharic failed');
  console.log('PASS: CBE Amharic credit parsed.\n');

  // Test 9: CBE Credit with Missing Counterparty (Direct Cash Deposit)
  console.log('Test 9: CBE credit with missing counterparty (cash deposit)...');
  const cbeAnonymous = bankParserRegistry.parseMessage({
    id: 't9',
    address: 'CBE',
    body: 'Dear Customer, Your account 1000****9999 has been credited with ETB 5,000.00 on 04/10/2026. Ref: FT26278CASH99. Your current balance is ETB 52,500.00.',
    date: Date.now(),
  });
  assert(cbeAnonymous !== null && cbeAnonymous.amount === 5000 && cbeAnonymous.transactionRef === 'FT26278CASH99', 'cbeAnonymous failed');
  console.log('PASS: CBE anonymous cash deposit parsed.\n');

  // Test 10: Awash Bank Credit
  console.log('Test 10: Parsing Awash Bank credit notification...');
  const aw1 = bankParserRegistry.parseMessage({
    id: 't10',
    address: 'AWASH',
    body: 'Dear Customer, your A/C 0132****5678 has been credited by ETB 3,200.00 from ALMAZ AYANA on 04-Oct-2026. Txn ID: AW261004991. Current Bal ETB 28,150.00.',
    date: Date.now(),
  });
  assert(aw1 !== null && aw1.provider === 'awash' && aw1.amount === 3200 && aw1.transactionRef === 'AW261004991', 'aw1 failed');
  console.log('PASS: Awash Bank credit parsed.\n');

  // Test 11: Awash Bank Debit
  console.log('Test 11: Parsing Awash Bank debit notification...');
  const aw2 = bankParserRegistry.parseMessage({
    id: 't11',
    address: 'AwashBank',
    body: 'Dear Customer, your A/C 0132****5678 has been debited by ETB 1,500.00 to ETHIO TELECOM on 04-Oct-2026. Txn ID: AW261004882. Current Bal ETB 26,650.00.',
    date: Date.now(),
  });
  assert(aw2 !== null && aw2.provider === 'awash' && aw2.amount === 1500 && aw2.transactionFlow === 'expense', 'aw2 failed');
  console.log('PASS: Awash Bank debit parsed.\n');

  // Test 12: Bank of Abyssinia Credit
  console.log('Test 12: Parsing Bank of Abyssinia credit notification...');
  const boa1 = bankParserRegistry.parseMessage({
    id: 't12',
    address: 'BOA',
    body: 'Dear Customer, ETB 1,250.00 has been credited to your account 2098****4321 on 04/10/2026. Sender: MIKIYAS BEKELE. Ref: BOA26100412. Available balance: ETB 14,800.00.',
    date: Date.now(),
  });
  assert(boa1 !== null && boa1.provider === 'boa' && boa1.amount === 1250 && boa1.counterparty === 'MIKIYAS BEKELE', 'boa1 failed');
  console.log('PASS: Bank of Abyssinia credit parsed.\n');

  // Test 13: Bank of Abyssinia Debit
  console.log('Test 13: Parsing Bank of Abyssinia debit notification...');
  const boa2 = bankParserRegistry.parseMessage({
    id: 't13',
    address: 'BOA',
    body: 'Dear Customer, ETB 600.00 has been debited from your account 2098****4321 on 04/10/2026. Ref: BOA26100499. Available balance: ETB 14,200.00.',
    date: Date.now(),
  });
  assert(boa2 !== null && boa2.provider === 'boa' && boa2.amount === 600 && boa2.transactionFlow === 'expense', 'boa2 failed');
  console.log('PASS: Bank of Abyssinia debit parsed.\n');

  // Test 14: Dashen Bank Credit
  console.log('Test 14: Parsing Dashen Bank credit notification...');
  const dash1 = bankParserRegistry.parseMessage({
    id: 't14',
    address: 'DashenBank',
    body: 'Dear Customer, you have received ETB 2,100.00 into your account 0034****9876 via Amole on 04/10/2026 from BEZA WORKU. Ref: DASH26100455. Current Balance: ETB 19,400.00.',
    date: Date.now(),
  });
  assert(dash1 !== null && dash1.provider === 'dashen' && dash1.amount === 2100 && dash1.counterparty === 'BEZA WORKU', 'dash1 failed');
  console.log('PASS: Dashen Bank credit parsed.\n');

  // Test 15: Dashen Bank Debit
  console.log('Test 15: Parsing Dashen Bank debit notification...');
  const dash2 = bankParserRegistry.parseMessage({
    id: 't15',
    address: 'Amole',
    body: 'Dear Customer, your account 0034****9876 has been debited by ETB 400.00 on 04/10/2026. Txn Ref: DASH26100411. Remaining balance: ETB 19,000.00.',
    date: Date.now(),
  });
  assert(dash2 !== null && dash2.provider === 'dashen' && dash2.amount === 400 && dash2.transactionFlow === 'expense', 'dash2 failed');
  console.log('PASS: Dashen Bank debit parsed.\n');

  // Test 16: Amount with Comma Formatting (e.g. ETB 125,450.00)
  console.log('Test 16: Edge case - Large amount with multiple commas...');
  const largeCommaSms = bankParserRegistry.parseMessage({
    id: 't16',
    address: 'CBE',
    body: 'Dear Customer, Your account 1000****1234 has been credited with ETB 125,450.00 on 04/10/2026 by INVESTOR CORP. Ref: FT26278BIG01.',
    date: Date.now(),
  });
  assert(largeCommaSms !== null && largeCommaSms.amount === 125450, 'largeCommaSms failed');
  console.log('PASS: Large comma-formatted amount parsed (125,450.00 -> 125450).\n');

  // Test 17: Amount without Commas or Decimals (e.g. ETB 1500)
  console.log('Test 17: Edge case - Integer amount without decimals or commas...');
  const integerSms = bankParserRegistry.parseMessage({
    id: 't17',
    address: '127',
    body: 'Dear customer, you have received ETB 1500 from 251911000111 with transaction number: 20261004INT01 on 04/10/2026.',
    date: Date.now(),
  });
  assert(integerSms !== null && integerSms.amount === 1500, 'integerSms failed');
  console.log('PASS: Integer amount parsed.\n');

  // Test 18: Small Micro-Amount (e.g. ETB 5.50)
  console.log('Test 18: Edge case - Small micro-transaction amount...');
  const microSms = bankParserRegistry.parseMessage({
    id: 't18',
    address: '127',
    body: 'Dear customer, you have transferred ETB 5.50 to 251988776655 with transaction number: 20261004MCR01.',
    date: Date.now(),
  });
  assert(microSms !== null && microSms.amount === 5.5, 'microSms failed');
  console.log('PASS: Small micro-amount parsed (5.50).\n');

  // Test 19: Unknown/Other Bank Fallback via GenericBankParser
  console.log('Test 19: Generic bank fallback parser...');
  const genericSms = bankParserRegistry.parseMessage({
    id: 't19',
    address: 'ZEMEN_BANK',
    body: 'Zemen Bank: Your account has been credited with ETB 7,800.00 on 04/10/2026. Ref: ZM26100499.',
    date: Date.now(),
  });
  assert(genericSms !== null && genericSms.amount === 7800 && genericSms.provider === 'unknown', 'genericSms failed');
  console.log('PASS: Generic bank parser correctly handles unlisted bank.\n');

  // Test 20: Non-Banking SMS Rejection - Personal Message
  console.log('Test 20: Rejecting personal friendly SMS...');
  const personal1 = bankParserRegistry.parseMessage({
    id: 'p1',
    address: '+251911998877',
    body: 'Selam Abebe, are you at the shop today? Let me know.',
    date: Date.now(),
  });
  assert(personal1 === null, 'Personal friendly SMS must be rejected');
  console.log('PASS: Personal friendly SMS safely ignored.\n');

  // Test 21: Non-Banking SMS Rejection - Security OTP
  console.log('Test 21: Rejecting OTP and Verification Codes...');
  const otpSms = bankParserRegistry.parseMessage({
    id: 'p2',
    address: '127',
    body: 'Your telebirr verification code is 894215. Do not share this OTP with anyone.',
    date: Date.now(),
  });
  assert(otpSms === null, 'OTP message must not be parsed as a bank transaction');
  console.log('PASS: OTP verification code safely rejected.\n');

  // Test 22: Non-Banking SMS Rejection - Marketing / Promo
  console.log('Test 22: Rejecting bank promotional advertisement...');
  const promoSms = bankParserRegistry.parseMessage({
    id: 'p3',
    address: 'CBE',
    body: 'Enjoy our new CBE mobile banking app with upgraded security and 24/7 customer service.',
    date: Date.now(),
  });
  assert(promoSms === null, 'Marketing advertisement must not be parsed as a bank transaction');
  console.log('PASS: Promotional advertisement safely rejected.\n');

  // Test 23: Batch Parsing Accuracy across 25+ Messages
  console.log('Test 23: Batch parsing accuracy across diverse combined stream...');
  const allDiverseMessages: NativeSmsRecord[] = [
    ...MOCK_BANK_SMS_MESSAGES,
    { id: 'm1', address: '127', body: 'Dear customer, you have received ETB 100.00 from 251900000001 with transaction number: TB202601 on 04/10/2026.', date: Date.now() },
    { id: 'm2', address: '127', body: 'ውድ ደንበኛ፣ ከ 251900000002 ETB 200.00 ተቀብለዋል። የግብይት ቁጥር፡ TB202602።', date: Date.now() },
    { id: 'm3', address: 'CBE', body: 'Dear Customer, Your account 1000****0003 has been credited with ETB 300.00 on 04/10/2026. Ref: FT26003.', date: Date.now() },
    { id: 'm4', address: 'AWASH', body: 'Dear Customer, your A/C 0132****0004 has been credited by ETB 400.00 from SENDER 4. Txn ID: AW004.', date: Date.now() },
    { id: 'm5', address: 'BOA', body: 'Dear Customer, ETB 500.00 has been credited to your account 2098****0005 on 04/10/2026. Ref: BOA005.', date: Date.now() },
    { id: 'm6', address: 'DashenBank', body: 'Dear Customer, you have received ETB 600.00 into your account 0034****0006 on 04/10/2026. Ref: DASH006.', date: Date.now() },
    { id: 'm7', address: '+251911111111', body: 'Hey bro, call me back later.', date: Date.now() },
    { id: 'm8', address: '127', body: 'Your telebirr PIN has been changed successfully.', date: Date.now() },
  ];

  const parsedDiverse = bankParserRegistry.parseBatch(allDiverseMessages);
  assert(parsedDiverse.length === 14, `Expected exactly 14 valid bank transactions (8 mock + 6 new), got ${parsedDiverse.length}`);
  console.log(`PASS: Batch parsed ${parsedDiverse.length} valid transactions, filtered out non-banking messages.\n`);

  console.log('==============================================');
  console.log('ALL 23 ETHIOPIAN BANK SMS PARSER & EDGE CASE TESTS PASSED!');
  console.log('==============================================\n');
}

if (typeof require !== 'undefined' && (require as any).main === module) {
  runSmsParserTests();
}

