import type { SQLiteDatabase } from 'expo-sqlite';

let requireOptionalNativeModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const expo = require('expo');
  requireOptionalNativeModule = expo.requireOptionalNativeModule;
} catch {
  // Graceful fallback outside Expo mobile runtime (e.g. Node tests, Web)
}

export const DB_NAME = 'networth.db';

let dbInstance: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Checks whether the native ExpoSQLite binary module is compiled and available in the running APK.
 */
export function isSQLiteAvailable(): boolean {
  try {
    return Boolean(typeof requireOptionalNativeModule === 'function' && requireOptionalNativeModule('ExpoSQLite'));
  } catch {
    return false;
  }
}

/**
 * Initializes and returns the shared SQLite database instance.
 * Applies optimal PRAGMA settings for mobile concurrency on Android (WAL mode).
 */
export async function getDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!isSQLiteAvailable()) {
    throw new Error(
      "Native module 'ExpoSQLite' is not available in the current Android build. Rebuild with `npx expo run:android`."
    );
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const SQLite = require('expo-sqlite');
      const db = await SQLite.openDatabaseAsync(DB_NAME);

      // Configure SQLite engine optimizations for concurrency and durability
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        PRAGMA synchronous = NORMAL;
      `);

      dbInstance = db;
      return db;
    } catch (error) {
      console.error('[SQLite Client] Failed to open database:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}


/**
 * Closes the database connection if open (useful for test resets or user switch).
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    try {
      await dbInstance.closeAsync();
    } catch (err) {
      console.warn('[SQLite Client] Error closing database:', err);
    } finally {
      dbInstance = null;
      initPromise = null;
    }
  }
}
