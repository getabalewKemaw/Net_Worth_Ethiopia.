import { ExpoSmsInbox, type NativeSmsRecord } from '../../modules/expo-sms-inbox';

// Safe retrieval of React Native primitives to support test runners and non-Android targets
let Platform: any = { OS: 'web' };
let PermissionsAndroid: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const RN = require('react-native');
  if (RN) {
    Platform = RN.Platform || Platform;
    PermissionsAndroid = RN.PermissionsAndroid || PermissionsAndroid;
  }
} catch {
  // Gracefully fallback when running outside React Native (e.g. Node tests / Web)
}

export interface SmsFetchOptions {
  limit?: number;
}

/**
 * Checks whether the native Android SMS reading module is available
 * and functional in the currently running binary.
 */
export function isNativeSmsAvailable(): boolean {
  if (Platform?.OS !== 'android') return false;
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
 * Fetches banking text messages from the native Android inbox.
 * Never returns mock data; returns empty array if unavailable or unpermitted.
 */
export async function fetchRawBankSms(options: SmsFetchOptions = {}): Promise<{
  messages: NativeSmsRecord[];
  isNative: boolean;
}> {
  const { limit = 200 } = options;

  if (!isNativeSmsAvailable()) {
    console.warn(
      '[SMS Reader] Native module ExpoSmsInbox is not installed in the currently running APK. Rebuild with `npx expo run:android`.'
    );
    return {
      messages: [],
      isNative: false,
    };
  }

  try {
    const permitted = await hasSmsPermission();
    if (!permitted) {
      const requested = await requestSmsPermission();
      if (!requested) {
        console.warn('[SMS Reader] READ_SMS permission not granted by user.');
        return {
          messages: [],
          isNative: true,
        };
      }
    }

    const messages = await ExpoSmsInbox!.fetchBankSmsMessages(limit);
    return {
      messages: messages || [],
      isNative: true,
    };
  } catch (error) {
    console.error('[SMS Reader] Native fetch failed:', error);
    return {
      messages: [],
      isNative: true,
    };
  }
}

