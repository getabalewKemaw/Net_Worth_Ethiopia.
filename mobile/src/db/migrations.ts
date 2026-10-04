import { getDatabase, isSQLiteAvailable } from './client';
import { CREATE_TABLES_SQL } from './schema';

export const CURRENT_SCHEMA_VERSION = 2;

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
      PRAGMA user_version = 2;
    `);
    console.log('[SQLite Migrations] Initial schema successfully applied.');
    return;
  }

  if (currentVersion < 2) {
    console.log('[SQLite Migrations] Running migration (version 1 -> 2: local_bank_sms)...');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS local_bank_sms (
        id TEXT PRIMARY KEY NOT NULL,
        raw_sms_id TEXT,
        provider TEXT NOT NULL,
        sender_address TEXT NOT NULL,
        transaction_flow TEXT CHECK(transaction_flow IN ('deposit', 'expense', 'unknown')) NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'ETB' NOT NULL,
        transaction_ref TEXT UNIQUE NOT NULL,
        counterparty TEXT,
        account_masked TEXT,
        current_balance REAL,
        raw_body TEXT NOT NULL,
        received_at TEXT NOT NULL,
        confidence_score REAL DEFAULT 1.0 NOT NULL,
        import_status TEXT CHECK(import_status IN ('pending', 'converted_sale', 'converted_expense', 'settled_debt', 'ignored')) DEFAULT 'pending' NOT NULL,
        converted_entity_id TEXT,
        business_id TEXT NOT NULL,
        branch_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_bank_sms_ref ON local_bank_sms(transaction_ref);
      CREATE INDEX IF NOT EXISTS idx_bank_sms_biz ON local_bank_sms(business_id, received_at DESC);
      CREATE INDEX IF NOT EXISTS idx_bank_sms_provider ON local_bank_sms(provider);
      CREATE INDEX IF NOT EXISTS idx_bank_sms_status ON local_bank_sms(import_status);

      PRAGMA user_version = 2;
    `);
    console.log('[SQLite Migrations] Version 2 schema migration applied successfully.');
  }
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
    DROP TABLE IF EXISTS local_bank_sms;
    PRAGMA user_version = 0;
  `);

  await initLocalDatabase();
  console.log('[SQLite Migrations] Database reset and re-initialized.');
}
