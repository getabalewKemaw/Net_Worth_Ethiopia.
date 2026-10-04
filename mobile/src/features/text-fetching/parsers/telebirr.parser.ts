import type { NativeSmsRecord } from '../../../../modules/expo-sms-inbox';
import type { BankSmsParser, ParsedBankTransaction, TransactionFlow } from '@/types/text-fetching';
import { parseBirrAmount, cleanText, formatTimestamp, generateUUID } from './parser-utils';

export class TelebirrParser implements BankSmsParser {
  readonly provider = 'telebirr' as const;

  canParse(address: string, body: string): boolean {
    const cleanAddr = address.toLowerCase();
    const cleanBody = body.toLowerCase();
    return (
      cleanAddr === '127' ||
      cleanAddr.includes('telebirr') ||
      cleanBody.includes('telebirr') ||
      (cleanBody.includes('received etb') && cleanBody.includes('transaction number'))
    );
  }

  parse(sms: NativeSmsRecord): ParsedBankTransaction | null {
    const body = cleanText(sms.body);

    // 1. Determine Flow (Deposit vs Expense)
    let flow: TransactionFlow = 'unknown';
    const isReceived = /received\s+ETB/i.test(body) || /credited/i.test(body);
    const isTransferred = /transferred\s+ETB/i.test(body) || /paid\s+ETB/i.test(body);

    if (isReceived) flow = 'deposit';
    else if (isTransferred) flow = 'expense';

    // 2. Extract Amount
    const amountMatch = body.match(/(?:received|transferred|paid)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i);
    const amount = parseBirrAmount(amountMatch ? amountMatch[1] : null);
    if (!amount) return null;

    // 3. Extract Transaction Reference Number
    const txnMatch = body.match(/(?:transaction number:|txn:?)\s*([A-Za-z0-9]+)/i);
    const transactionRef = txnMatch ? txnMatch[1].trim() : `TB-${sms.date}-${sms.id}`;

    // 4. Extract Counterparty (Payer or Payee)
    let counterparty: string | null = null;
    if (flow === 'deposit') {
      const fromMatch = body.match(/from\s+([A-Za-z0-9\s\(\)\+]+?)\s+with transaction/i);
      counterparty = fromMatch ? fromMatch[1].trim() : null;
    } else {
      const toMatch = body.match(/to\s+([A-Za-z0-9\s\(\)\+]+?)\s+with transaction/i);
      counterparty = toMatch ? toMatch[1].trim() : null;
    }

    // 5. Extract Current Balance
    const balanceMatch = body.match(/(?:current balance is|balance is)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i);
    const currentBalance = parseBirrAmount(balanceMatch ? balanceMatch[1] : null);

    return {
      id: generateUUID(),
      rawSmsId: sms.id,
      provider: this.provider,
      senderAddress: sms.address,
      transactionFlow: flow,
      amount,
      currency: 'ETB',
      transactionRef,
      counterparty,
      accountMasked: null, // telebirr typically uses mobile number
      currentBalance,
      timestamp: formatTimestamp(sms.date),
      rawBody: sms.body,
      confidenceScore: 0.95,
      importStatus: 'pending',
      convertedEntityId: null,
    };
  }
}
