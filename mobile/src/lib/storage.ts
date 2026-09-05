import { Platform } from 'react-native';

// In-memory fallback cache to ensure stability if native SecureStore is missing or unlinked
const memoryFallback = new Map<string, string>();

let secureStoreModule: any = null;
let secureStoreChecked = false;

function getSecureStore() {
  if (secureStoreChecked) return secureStoreModule;
  secureStoreChecked = true;
  if (Platform.OS !== 'web') {
    try {
      secureStoreModule = require('expo-secure-store');
    } catch {
      secureStoreModule = null;
    }
  }
  return secureStoreModule;
}

export function getItem(key: string): string | null {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return memoryFallback.get(key) ?? null;
  }

  const SecureStore = getSecureStore();
  if (SecureStore) {
    try {
      if (typeof SecureStore.getItem === 'function') {
        const val = SecureStore.getItem(key);
        if (val !== undefined && val !== null) {
          return val;
        }
      }
    } catch {
      // Native module error or unlinked binary; fallback to in-memory store
    }
  }

  return memoryFallback.get(key) ?? null;
}

export async function setItem(key: string, value: string): Promise<void> {
  memoryFallback.set(key, value);

  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
    return;
  }

  const SecureStore = getSecureStore();
  if (SecureStore) {
    try {
      if (typeof SecureStore.setItemAsync === 'function') {
        await SecureStore.setItemAsync(key, value);
        return;
      }
      if (typeof SecureStore.setItem === 'function') {
        SecureStore.setItem(key, value);
        return;
      }
    } catch {
      // Kept in memoryFallback
    }
  }
}

export async function removeItem(key: string): Promise<void> {
  memoryFallback.delete(key);

  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
    return;
  }

  const SecureStore = getSecureStore();
  if (SecureStore) {
    try {
      if (typeof SecureStore.deleteItemAsync === 'function') {
        await SecureStore.deleteItemAsync(key);
        return;
      }
    } catch {
      // Removed from memoryFallback
    }
  }
}

export const getItemAsync = async (key: string) => getItem(key);
export const setItemAsync = setItem;
export const deleteItemAsync = removeItem;

