import type { NativeSmsRecord } from '../../../../modules/expo-sms-inbox';
import type { BankSmsParser, ParsedBankTransaction, TransactionFlow } from '@/types/text-fetching';
import { parseBirrAmount, cleanText, formatTimestamp, generateUUID } from './parser-utils';

export class AwashParser implements BankSmsParser {
  readonly provider = 'awash' as const;

  canParse(address: string, body: string): boolean {
    const cleanAddr = address.toLowerCase();
    const cleanBody = body.toLowerCase();
    return (
      cleanAddr === 'awash' ||
      cleanAddr === 'awashbank' ||
      cleanBody.includes('awash bank') ||
      cleanBody.includes('awashbank')
    );
  }

  parse(sms: NativeSmsRecord): ParsedBankTransaction | null {
    const body = cleanText(sms.body);

    // 1. Determine Flow
    let flow: TransactionFlow = 'unknown';
    const isCredited = /credited/i.test(body);
    const isDebited = /debited/i.test(body) || /withdrawn/i.test(body);

    if (isCredited) flow = 'deposit';
    else if (isDebited) flow = 'expense';

    // 2. Extract Amount
    const amountMatch = body.match(/(?:credited\s+by|credited\s+with|debited\s+by|debited\s+with)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i);
    const amount = parseBirrAmount(amountMatch ? amountMatch[1] : null);
    if (!amount) return null;

    // 3. Extract Account Masked
    const accMatch = body.match(/(?:A\/C|account)\s*([0-9\*]+)/i);
    const accountMasked = accMatch ? accMatch[1].trim() : null;

    // 4. Extract Txn ID
    const refMatch = body.match(/(?:Txn ID:?|Ref:?)\s*([A-Za-z0-9]+)/i);
    const transactionRef = refMatch ? refMatch[1].trim() : `AW-${sms.date}-${sms.id}`;

    // 5. Extract Counterparty
    const fromMatch = body.match(/from\s+([A-Za-z\s]+?)\s+on/i);
    const counterparty = fromMatch ? fromMatch[1].trim() : null;

    // 6. Extract Current Bal
    const balMatch = body.match(/(?:Current Bal|Balance)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i);
    const currentBalance = parseBirrAmount(balMatch ? balMatch[1] : null);

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
      accountMasked,
      currentBalance,
      timestamp: formatTimestamp(sms.date),
      rawBody: sms.body,
      confidenceScore: 0.95,
      importStatus: 'pending',
      convertedEntityId: null,
    };
  }
}
