import type { NativeSmsRecord } from '../../../../modules/expo-sms-inbox';
import type { BankSmsParser, ParsedBankTransaction, TransactionFlow } from '@/types/text-fetching';
import { parseBirrAmount, cleanText, formatTimestamp, generateUUID } from './parser-utils';

export class CbeParser implements BankSmsParser {
  readonly provider = 'cbe' as const;

  canParse(address: string, body: string): boolean {
    const cleanAddr = address.toLowerCase();
    const cleanBody = body.toLowerCase();
    return (
      cleanAddr === 'cbe' ||
      cleanAddr === 'cbebirr' ||
      cleanAddr === '889' ||
      cleanAddr === '829' ||
      cleanBody.includes('banking with cbe') ||
      cleanBody.includes('cbebirr') ||
      cleanBody.includes('commercial bank of ethiopia')
    );
  }

  parse(sms: NativeSmsRecord): ParsedBankTransaction | null {
    const body = cleanText(sms.body);

    // 1. Determine Flow (Deposit vs Expense)
    let flow: TransactionFlow = 'unknown';
    const isCredited = /credited\s+with/i.test(body) || /credited\s+by/i.test(body) || /deposited/i.test(body);
    const isDebited = /debited\s+with/i.test(body) || /withdrawn/i.test(body) || /transferred/i.test(body);

    if (isCredited) flow = 'deposit';
    else if (isDebited) flow = 'expense';

    // 2. Extract Amount
    const amountMatch = body.match(/(?:credited with|debited with|withdrawn|deposited)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i);
    const amount = parseBirrAmount(amountMatch ? amountMatch[1] : null);
    if (!amount) return null;

    // 3. Extract Account Number (Masked)
    const accMatch = body.match(/(?:account|a\/c)\s*([0-9\*]+)/i);
    const accountMasked = accMatch ? accMatch[1].trim() : null;

    // 4. Extract Transaction Reference (FT... or similar)
    const refMatch = body.match(/(?:Ref:?|Txn ID:?|Reference:?)\s*([A-Za-z0-9]+)/i);
    const transactionRef = refMatch ? refMatch[1].trim() : `CBE-${sms.date}-${sms.id}`;

    // 5. Extract Counterparty / Purpose
    let counterparty: string | null = null;
    if (flow === 'deposit') {
      const byMatch = body.match(/by\s+([A-Za-z\s]+?)\.\s*(?:Ref|Txn|Your)/i);
      counterparty = byMatch ? byMatch[1].trim() : null;
    } else {
      const forMatch = body.match(/for\s+([A-Za-z0-9\s]+?)\.\s*(?:Ref|Txn|Current)/i);
      counterparty = forMatch ? forMatch[1].trim() : null;
    }

    // 6. Extract Current Balance
    const balanceMatch = body.match(/(?:current balance is|current balance:|balance:)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i);
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
