import type { NativeSmsRecord } from '../../../../modules/expo-sms-inbox';
import type { BankSmsParser, ParsedBankTransaction, TransactionFlow } from '@/types/text-fetching';
import { parseBirrAmount, cleanText, formatTimestamp, generateUUID } from './parser-utils';

export class DashenParser implements BankSmsParser {
  readonly provider = 'dashen' as const;

  canParse(address: string, body: string): boolean {
    const cleanAddr = address.toLowerCase();
    const cleanBody = body.toLowerCase();
    return (
      cleanAddr.includes('dashen') ||
      cleanAddr.includes('amole') ||
      cleanBody.includes('dashen bank') ||
      cleanBody.includes('amole')
    );
  }

  parse(sms: NativeSmsRecord): ParsedBankTransaction | null {
    const body = cleanText(sms.body);

    // 1. Determine Flow
    let flow: TransactionFlow = 'unknown';
    const isReceived = /received/i.test(body) || /credited/i.test(body);
    const isSent = /transferred/i.test(body) || /debited/i.test(body) || /paid/i.test(body);

    if (isReceived) flow = 'deposit';
    else if (isSent) flow = 'expense';

    // 2. Extract Amount
    const amountMatch = body.match(/(?:received|transferred|credited|debited)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i);
    const amount = parseBirrAmount(amountMatch ? amountMatch[1] : null);
    if (!amount) return null;

    // 3. Extract Account Masked
    const accMatch = body.match(/(?:account|a\/c)\s*([0-9\*]+)/i);
    const accountMasked = accMatch ? accMatch[1].trim() : null;

    // 4. Extract Txn Ref
    const refMatch = body.match(/(?:Ref:?|Txn ID:?|Transaction ID:?)\s*([A-Za-z0-9]+)/i);
    const transactionRef = refMatch ? refMatch[1].trim() : `DASH-${sms.date}-${sms.id}`;

    // 5. Extract Counterparty
    const fromMatch = body.match(/from\s+([A-Za-z\s]+?)\.\s*(?:Ref|Current)/i);
    const counterparty = fromMatch ? fromMatch[1].trim() : null;

    // 6. Extract Current Balance
    const balMatch = body.match(/(?:Current Balance:|Balance:)\s*ETB\s*([\d,]+(?:\.\d{1,2})?)/i);
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
