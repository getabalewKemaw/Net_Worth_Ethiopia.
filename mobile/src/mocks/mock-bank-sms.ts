import type { NativeSmsRecord } from '../../modules/expo-sms-inbox';

/**
 * Realistic Ethiopian banking and mobile money SMS samples
 * for development, Web/iOS testing, and demonstration.
 */
export const MOCK_BANK_SMS_MESSAGES: NativeSmsRecord[] = [
  {
    id: 'mock-sms-1',
    address: '127',
    body: 'Dear customer, you have received ETB 450.00 from 251911223344 (ABEBE KEBEDE) with transaction number: 2026100412345678 on 04/10/2026 14:22:10. Your current balance is ETB 12,450.00.',
    date: Date.now() - 1000 * 60 * 15, // 15 mins ago
  },
  {
    id: 'mock-sms-2',
    address: 'CBE',
    body: 'Dear Customer, Your account 1000****1234 has been credited with ETB 1,800.00 on 04/10/2026 by CHALA TOLOSA. Ref: FT26278ABCD1. Your current balance is ETB 45,200.50. Thank you for banking with CBE!',
    date: Date.now() - 1000 * 60 * 45, // 45 mins ago
  },
  {
    id: 'mock-sms-3',
    address: 'telebirr',
    body: 'Dear customer, you have transferred ETB 2,500.00 to 251922334455 (ETHIO TRADING PLC) with transaction number: 2026100498765432 on 04/10/2026 13:10:00. Your current balance is ETB 9,950.00.',
    date: Date.now() - 1000 * 60 * 120, // 2 hours ago
  },
  {
    id: 'mock-sms-4',
    address: 'AWASH',
    body: 'Dear Customer, your A/C 0132****5678 has been credited by ETB 3,200.00 from ALMAZ AYANA on 04-Oct-2026. Txn ID: AW261004991. Current Bal ETB 28,150.00.',
    date: Date.now() - 1000 * 60 * 240, // 4 hours ago
  },
  {
    id: 'mock-sms-5',
    address: 'CBE',
    body: 'Dear Customer, Your account 1000****1234 has been debited with ETB 1,200.00 on 04/10/2026 for SHOP UTILITIES PAYMENT. Ref: FT26279WXYZ2. Current Balance: ETB 44,000.50.',
    date: Date.now() - 1000 * 60 * 360, // 6 hours ago
  },
  {
    id: 'mock-sms-6',
    address: 'BOA',
    body: 'Dear Customer, ETB 1,250.00 has been credited to your account 2098****4321 on 04/10/2026. Sender: MIKIYAS BEKELE. Ref: BOA26100412. Available balance: ETB 14,800.00.',
    date: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
  },
  {
    id: 'mock-sms-7',
    address: '127',
    body: 'Dear customer, you have received ETB 850.00 from 251944556677 (HELEN TEKLE) with transaction number: 2026100477889900 on 04/10/2026 09:15:30. Your current balance is ETB 13,300.00.',
    date: Date.now() - 1000 * 60 * 60 * 16, // 16 hours ago
  },
  {
    id: 'mock-sms-8',
    address: 'DashenBank',
    body: 'Dear Customer, you have received ETB 2,100.00 into your account 0034****9876 via Amole on 04/10/2026 from BEZA WORKU. Ref: DASH26100455. Current Balance: ETB 19,400.00.',
    date: Date.now() - 1000 * 60 * 60 * 22, // 22 hours ago
  },
];
