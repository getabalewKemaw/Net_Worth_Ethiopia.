import { getDatabase } from '../db/client';
import type { LocalBranchRow, SyncMetadataRow } from '../db/schema';

export interface CachedBranch {
  id: string;
  businessId: string;
  name: string;
  location: string | null;
  isActive: boolean;
  updatedAt: string;
}

/**
 * Repository for local caching of business settings, operating branches, and sync metadata.
 */
export const localBusinessRepo = {
  /**
   * Caches remote branches into local SQLite table.
   */
  async cacheBranches(businessId: string, branches: any[]): Promise<void> {
    if (!branches.length) return;
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      for (const br of branches) {
        await db.runAsync(
          `INSERT INTO local_branch (id, business_id, name, location, is_active, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             location = excluded.location,
             is_active = excluded.is_active,
             updated_at = excluded.updated_at`,
          [
            br.id,
            businessId,
            br.name,
            br.location ?? br.city ?? null,
            br.isActive ?? br.active ? 1 : 0,
            br.updatedAt || now,
          ]
        );
      }
    });
  },

  /**
   * Retrieves cached operating branches for the business offline.
   */
  async getCachedBranches(businessId: string): Promise<CachedBranch[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<LocalBranchRow>(
      `SELECT * FROM local_branch WHERE business_id = ? AND is_active = 1 ORDER BY name ASC`,
      [businessId]
    );

    return rows.map((r) => ({
      id: r.id,
      businessId: r.business_id,
      name: r.name,
      location: r.location,
      isActive: r.is_active === 1,
      updatedAt: r.updated_at,
    }));
  },

  /**
   * Updates or inserts a persistent sync metadata key-value pair.
   */
  async setSyncMetadata(key: string, value: string): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO sync_metadata (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`,
      [key, value, now]
    );
  },

  /**
   * Reads a persistent sync metadata value (e.g. 'last_pulled_at').
   */
  async getSyncMetadata(key: string): Promise<string | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<SyncMetadataRow>(
      `SELECT value FROM sync_metadata WHERE key = ?`,
      [key]
    );
    return result?.value ?? null;
  },
};
