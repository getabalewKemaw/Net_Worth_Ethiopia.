import type { NativeSmsRecord } from '../../../../modules/expo-sms-inbox';
import type { BankSmsParser, ParsedBankTransaction, TransactionFlow } from '@/types/text-fetching';
import { parseBirrAmount, cleanText, formatTimestamp, generateUUID } from './parser-utils';

export class GenericFallbackParser implements BankSmsParser {
  readonly provider = 'unknown' as const;

  canParse(_address: string, body: string): boolean {
    const cleanBody = body.toLowerCase();
    const hasEtb = cleanBody.includes('etb') || cleanBody.includes('birr');
    const hasFinancialKeyword =
      cleanBody.includes('credited') ||
      cleanBody.includes('debited') ||
      cleanBody.includes('received') ||
      cleanBody.includes('transferred') ||
      cleanBody.includes('payment') ||
      cleanBody.includes('deposited');

    return hasEtb && hasFinancialKeyword;
  }

  parse(sms: NativeSmsRecord): ParsedBankTransaction | null {
    const body = cleanText(sms.body);

    let flow: TransactionFlow = 'unknown';
    if (/received|credited|deposited/i.test(body)) {
      flow = 'deposit';
    } else if (/transferred|debited|paid|withdrawn/i.test(body)) {
      flow = 'expense';
    }

    const amountMatch =
      body.match(/(?:ETB|Birr)\s*([\d,]+(?:\.\d{1,2})?)/i) ||
      body.match(/([\d,]+(?:\.\d{1,2})?)\s*(?:ETB|Birr)/i);
    const amount = parseBirrAmount(amountMatch ? amountMatch[1] : null);
    if (!amount) return null;

    const refMatch = body.match(/(?:Ref:?|Txn ID:?|Transaction number:|Txn:?)\s*([A-Za-z0-9]+)/i);
    const transactionRef = refMatch ? refMatch[1].trim() : `GEN-${sms.date}-${sms.id}`;

    return {
      id: generateUUID(),
      rawSmsId: sms.id,
      provider: this.provider,
      senderAddress: sms.address,
      transactionFlow: flow,
      amount,
      currency: 'ETB',
      transactionRef,
      counterparty: null,
      accountMasked: null,
      currentBalance: null,
      timestamp: formatTimestamp(sms.date),
      rawBody: sms.body,
      confidenceScore: 0.7,
      importStatus: 'pending',
      convertedEntityId: null,
    };
  }
}
