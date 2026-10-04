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

let nativeModule: ExpoSmsInboxNativeModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { requireOptionalNativeModule } = require('expo');
  if (typeof requireOptionalNativeModule === 'function') {
    nativeModule = requireOptionalNativeModule('ExpoSmsInbox') as ExpoSmsInboxNativeModule | null;
  }
} catch {
  // Graceful fallback when executing outside the Expo mobile runtime (e.g. Node tests, Web)
}

export const ExpoSmsInbox = nativeModule;
