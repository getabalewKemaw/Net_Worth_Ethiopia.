import type { NativeSmsRecord } from '../../modules/expo-sms-inbox';

export type BankProvider = 'telebirr' | 'cbe' | 'awash' | 'boa' | 'dashen' | 'unknown';

export type TransactionFlow = 'deposit' | 'expense' | 'unknown';

export type SmsImportStatus =
  | 'pending'
  | 'converted_sale'
  | 'converted_expense'
  | 'settled_debt'
  | 'ignored';

export interface ParsedBankTransaction {
  id: string; // Client UUID
  rawSmsId: string;
  provider: BankProvider;
  senderAddress: string;
  transactionFlow: TransactionFlow;
  amount: number;
  currency: string; // 'ETB'
  transactionRef: string; // Unique transaction code (telebirr txn #, FT..., etc.)
  counterparty: string | null; // Payer or Payee name/phone
  accountMasked: string | null; // e.g. "1000****1234"
  currentBalance: number | null; // Remaining balance if reported
  timestamp: string; // ISO 8601 string
  rawBody: string;
  confidenceScore: number; // 0.0 - 1.0
  importStatus: SmsImportStatus;
  convertedEntityId: string | null;
}

export interface BankProviderConfig {
  id: BankProvider;
  displayName: string;
  brandColor: string;
  badgeBg: string;
  badgeTextColor: string;
  icon: string;
  logo?: any;
  identifiers: string[];
}

export interface ProviderSummary {
  provider: BankProvider;
  displayName: string;
  totalDeposits: number;
  totalExpenses: number;
  depositCount: number;
  expenseCount: number;
  latestBalance: number | null;
  lastTransactionAt: string | null;
}

export interface BankSmsParser {
  readonly provider: BankProvider;
  canParse(address: string, body: string): boolean;
  parse(sms: NativeSmsRecord): ParsedBankTransaction | null;
}
