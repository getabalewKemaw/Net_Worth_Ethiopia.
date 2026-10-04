import { requireOptionalNativeModule } from 'expo';

export interface NativeSmsRecord {
  id: string;
  address: string;
  body: string;
  date: number; // Unix timestamp in milliseconds
}

export interface ExpoSmsInboxNativeModule {
  isAvailable(): boolean;
  hasSmsPermission(): boolean;
  fetchBankSmsMessages(limit?: number): Promise<NativeSmsRecord[]>;
}

export const ExpoSmsInbox = requireOptionalNativeModule<ExpoSmsInboxNativeModule>('ExpoSmsInbox');
