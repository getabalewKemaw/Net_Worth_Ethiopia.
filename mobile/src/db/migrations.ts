import { getDatabase, isSQLiteAvailable } from './client';
import { CREATE_TABLES_SQL } from './schema';

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Runs pending database migrations using SQLite user_version pragma.
 * Guarantees that tables and indexes exist before any repository runs queries.
 */
export async function initLocalDatabase(): Promise<void> {
  if (!isSQLiteAvailable()) {
    console.log(
      '[SQLite Migrations] Native module ExpoSQLite not detected in current APK. Running in online fallback mode. Rebuild with `npx expo run:android` to enable offline SQLite.'
    );
    return;
  }

  const db = await getDatabase();

  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;'
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    console.log('[SQLite Migrations] Running initial migration (version 0 -> 1)...');
    await db.execAsync(`
      ${CREATE_TABLES_SQL}
      PRAGMA user_version = 1;
    `);
    console.log('[SQLite Migrations] Initial schema successfully applied.');
  }

  // Future schema updates can be added here:
  // if (currentVersion < 2) { ... }
}

/**
 * Resets all local data tables and recreates the schema from scratch.
 * Useful for development testing or when switching user accounts.
 */
export async function resetLocalDatabase(): Promise<void> {
  const db = await getDatabase();
  console.warn('[SQLite Migrations] Resetting all local database tables...');

  await db.execAsync(`
    DROP TABLE IF EXISTS local_sale;
    DROP TABLE IF EXISTS local_expense;
    DROP TABLE IF EXISTS local_branch;
    DROP TABLE IF EXISTS sync_queue;
    DROP TABLE IF EXISTS sync_metadata;
    PRAGMA user_version = 0;
  `);

  await initLocalDatabase();
  console.log('[SQLite Migrations] Database reset and re-initialized.');
}
