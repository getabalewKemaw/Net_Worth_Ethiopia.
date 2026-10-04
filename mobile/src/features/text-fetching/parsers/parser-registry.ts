import type { NativeSmsRecord } from '../../../../modules/expo-sms-inbox';
import type { BankSmsParser, ParsedBankTransaction } from '@/types/text-fetching';
import { TelebirrParser } from './telebirr.parser';
import { CbeParser } from './cbe.parser';
import { AwashParser } from './awash.parser';
import { BoaParser } from './boa.parser';
import { DashenParser } from './dashen.parser';
import { GenericFallbackParser } from './generic.parser';

export class BankParserRegistry {
  private parsers: BankSmsParser[];

  constructor() {
    this.parsers = [
      new TelebirrParser(),
      new CbeParser(),
      new AwashParser(),
      new BoaParser(),
      new DashenParser(),
      new GenericFallbackParser(),
    ];
  }

  /**
   * Evaluates a single SMS record against known bank templates.
   * Returns a structured ParsedBankTransaction or null if not a recognized financial SMS.
   */
  parseMessage(sms: NativeSmsRecord): ParsedBankTransaction | null {
    if (!sms || !sms.body) return null;

    for (const parser of this.parsers) {
      if (parser.canParse(sms.address, sms.body)) {
        const result = parser.parse(sms);
        if (result) return result;
      }
    }

    return null;
  }

  /**
   * Processes an array of raw SMS messages, returning all successfully parsed transactions.
   */
  parseBatch(messages: NativeSmsRecord[]): ParsedBankTransaction[] {
    const results: ParsedBankTransaction[] = [];
    const seenRefs = new Set<string>();

    for (const sms of messages) {
      const parsed = this.parseMessage(sms);
      if (parsed && parsed.transactionRef) {
        // In-memory deduplication during batch run
        if (!seenRefs.has(parsed.transactionRef)) {
          seenRefs.add(parsed.transactionRef);
          results.push(parsed);
        }
      }
    }

    return results;
  }
}

export const bankParserRegistry = new BankParserRegistry();
