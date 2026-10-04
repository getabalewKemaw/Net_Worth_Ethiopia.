import { Platform, PermissionsAndroid } from 'react-native';
import { ExpoSmsInbox, type NativeSmsRecord } from '../../modules/expo-sms-inbox';
import { MOCK_BANK_SMS_MESSAGES } from '@/mocks/mock-bank-sms';

export interface SmsFetchOptions {
  limit?: number;
  forceMock?: boolean;
}

/**
 * Checks whether the native Android SMS reading module is available
 * and functional in the currently running binary.
 */
export function isNativeSmsAvailable(): boolean {
  if (Platform.OS !== 'android') return false;
  try {
    return Boolean(ExpoSmsInbox && typeof ExpoSmsInbox.fetchBankSmsMessages === 'function');
  } catch {
    return false;
  }
}

/**
 * Requests runtime android.permission.READ_SMS from the user.
 */
export async function requestSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'Bank SMS Access',
        message:
          'NetWorth needs read access to your SMS inbox strictly to detect and fetch your bank and telebirr deposit and expense notifications.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'Grant Access',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.warn('[SMS Reader] Error requesting READ_SMS permission:', error);
    return false;
  }
}

/**
 * Checks if the SMS permission is currently granted.
 */
export async function hasSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
  } catch {
    return false;
  }
}

/**
 * Fetches banking text messages from the native Android inbox or falls back to
 * mock demo data when running in simulator, Web, iOS, or when mock mode is forced.
 */
export async function fetchRawBankSms(options: SmsFetchOptions = {}): Promise<{
  messages: NativeSmsRecord[];
  isMock: boolean;
}> {
  const { limit = 200, forceMock = false } = options;

  if (forceMock || !isNativeSmsAvailable()) {
    return {
      messages: MOCK_BANK_SMS_MESSAGES.slice(0, limit),
      isMock: true,
    };
  }

  try {
    const permitted = await hasSmsPermission();
    if (!permitted) {
      const requested = await requestSmsPermission();
      if (!requested) {
        console.warn('[SMS Reader] READ_SMS permission not granted, falling back to mock data');
        return {
          messages: MOCK_BANK_SMS_MESSAGES.slice(0, limit),
          isMock: true,
        };
      }
    }

    const messages = await ExpoSmsInbox!.fetchBankSmsMessages(limit);
    return {
      messages: messages || [],
      isMock: false,
    };
  } catch (error) {
    console.error('[SMS Reader] Native fetch failed, using fallback:', error);
    return {
      messages: MOCK_BANK_SMS_MESSAGES.slice(0, limit),
      isMock: true,
    };
  }
}
