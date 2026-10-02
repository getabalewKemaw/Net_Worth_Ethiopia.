import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'networth.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Initializes and returns the shared SQLite database instance.
 * Applies optimal PRAGMA settings for mobile concurrency on Android (WAL mode).
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
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
