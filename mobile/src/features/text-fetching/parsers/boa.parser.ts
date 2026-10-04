import type { NativeSmsRecord } from '../../../../modules/expo-sms-inbox';
import type { BankSmsParser, ParsedBankTransaction, TransactionFlow } from '@/types/text-fetching';
import { parseBirrAmount, cleanText, formatTimestamp, generateUUID } from './parser-utils';

export class BoaParser implements BankSmsParser {
  readonly provider = 'boa' as const;

  canParse(address: string, body: string): boolean {
    const cleanAddr = address.toLowerCase();
    const cleanBody = body.toLowerCase();
    return (
      cleanAddr === 'boa' ||
      cleanAddr === 'abyssinia' ||
      cleanBody.includes('abyssinia') ||
      cleanBody.includes('bank of abyssinia')
    );
  }

  parse(sms: NativeSmsRecord): ParsedBankTransaction | null {
    const body = cleanText(sms.body);

    // 1. Determine Flow
    let flow: TransactionFlow = 'unknown';
    const isCredited = /credited/i.test(body);
    const isDebited = /debited/i.test(body);

    if (isCredited) flow = 'deposit';
    else if (isDebited) flow = 'expense';

    // 2. Extract Amount
    const amountMatch = body.match(/ETB\s*([\d,]+(?:\.\d{1,2})?)\s+(?:has been credited|has been debited)/i);
    const amount = parseBirrAmount(amountMatch ? amountMatch[1] : null);
    if (!amount) return null;

    // 3. Extract Account Masked
    const accMatch = body.match(/(?:account|a\/c)\s*([0-9\*]+)/i);
    const accountMasked = accMatch ? accMatch[1].trim() : null;

    // 4. Extract Txn Ref
    const refMatch = body.match(/(?:Ref:?|Txn:?)\s*([A-Za-z0-9]+)/i);
    const transactionRef = refMatch ? refMatch[1].trim() : `BOA-${sms.date}-${sms.id}`;

    // 5. Extract Sender / Receiver
    const senderMatch = body.match(/(?:Sender:?|From:?)\s*([A-Za-z\s]+?)\.\s*(?:Ref|Available)/i);
    const counterparty = senderMatch ? senderMatch[1].trim() : null;

    // 6. Extract Available Balance
    const balMatch = body.match(/(?:Available balance:|balance:)\s*ETB\s*([\d,]+(?:\.\d{1,2})?)/i);
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
