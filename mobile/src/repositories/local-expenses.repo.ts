import { getDatabase } from '../db/client';
import type { LocalExpenseRow } from '../db/schema';
import type { ExpenseEntry, ExpenseInput } from '../types/sales';
import { syncQueueRepo } from './sync-queue.repo';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatDisplayTime(dateStr?: string | null): string {
  if (!dateStr) return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Just now';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

import { useStaffStore } from '../store/staff-store';

export function mapRowToExpenseEntry(row: LocalExpenseRow): ExpenseEntry {
  return {
    id: row.id,
    businessId: row.business_id,
    branchId: row.branch_id,
    description: row.description,
    amount: Number(row.amount),
    category: row.category,
    notes: row.notes,
    time: formatDisplayTime(row.created_at),
    createdAt: row.created_at,
    recordedById: row.recorded_by_id ?? null,
    recordedByName: row.recorded_by_name ?? null,
  };
}

/**
 * Repository for local SQLite Expense operations with transactional outbox queueing.
 */
export const localExpensesRepo = {
  /**
   * Atomically records an operational expense and enqueues an outbox sync action.
   */
  async createExpenseAtomic(
    input: ExpenseInput,
    businessId: string,
    branchId: string
  ): Promise<ExpenseEntry> {
    const db = await getDatabase();
    const id = generateUUID();
    const mutationId = generateUUID();
    const now = new Date().toISOString();

    const staffState = useStaffStore.getState();
    const effectiveBranchId = branchId || (staffState.isStaff ? staffState.assignedBranchId : null) || branchId;
    const recordedById = input.recordedById || staffState.staffProfile?.userId || null;
    const recordedByName = input.recordedByName || staffState.staffProfile?.name || null;

    const row: LocalExpenseRow = {
      id,
      business_id: businessId,
      branch_id: effectiveBranchId,
      description: input.description,
      amount: input.amount,
      category: input.category,
      notes: input.notes ?? null,
      recorded_by_id: recordedById,
      recorded_by_name: recordedByName,
      sync_status: 'pending_create',
      created_at: now,
      updated_at: now,
    };

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO local_expense (
          id, business_id, branch_id, description, amount, category,
          notes, recorded_by_id, recorded_by_name, sync_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.business_id,
          row.branch_id,
          row.description,
          row.amount,
          row.category,
          row.notes,
          row.recorded_by_id ?? null,
          row.recorded_by_name ?? null,
          row.sync_status,
          row.created_at,
          row.updated_at,
        ]
      );

      await syncQueueRepo.enqueueMutation(
        {
          mutationId,
          entityType: 'expense',
          entityId: id,
          action: 'CREATE',
          payload: {
            id,
            businessId,
            branchId: effectiveBranchId,
            description: row.description,
            amount: row.amount,
            category: row.category,
            notes: row.notes,
            recordedById: row.recorded_by_id,
            recordedByName: row.recorded_by_name,
            createdAt: now,
          },
          createdAt: now,
        },
        db
      );
    });

    return mapRowToExpenseEntry(row);
  },

  /**
   * Retrieves expenses for the given business & branch from local SQLite.
   */
  async getExpenses(
    businessId: string,
    branchId?: string,
    limit = 100
  ): Promise<ExpenseEntry[]> {
    const db = await getDatabase();
    let query = `SELECT * FROM local_expense WHERE business_id = ?`;
    const params: any[] = [businessId];

    if (branchId) {
      query += ` AND branch_id = ?`;
      params.push(branchId);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);

    const rows = await db.getAllAsync<LocalExpenseRow>(query, params);
    return rows.map(mapRowToExpenseEntry);
  },

  /**
   * Computes today's operational expense total directly from SQLite.
   */
  async getTodayExpenseMetric(
    businessId: string,
    branchId?: string
  ): Promise<{ expenseTotal: number; count: number }> {
    const db = await getDatabase();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayDatePrefix = `${year}-${month}-${day}%`;

    let query = `
      SELECT 
        COALESCE(SUM(amount), 0) AS expense_total,
        COUNT(*) AS count
      FROM local_expense
      WHERE business_id = ? 
        AND (
          created_at LIKE ?
          OR date(created_at, 'localtime') = date('now', 'localtime')
          OR date(created_at) = date('now')
        )
    `;
    const params: any[] = [businessId, todayDatePrefix];

    if (branchId) {
      query += ` AND branch_id = ?`;
      params.push(branchId);
    }

    const result = await db.getFirstAsync<{ expense_total: number; count: number }>(
      query,
      params
    );

    return {
      expenseTotal: Number(result?.expense_total ?? 0),
      count: Number(result?.count ?? 0),
    };
  },

  /**
   * Bulk upserts remote expenses pulled from backend sync.
   */
  async upsertSyncedExpenses(items: any[]): Promise<void> {
    if (!items.length) return;
    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      for (const item of items) {
        const existing = await db.getFirstAsync<LocalExpenseRow>(
          `SELECT sync_status FROM local_expense WHERE id = ?`,
          [item.id]
        );

        if (existing && existing.sync_status !== 'synced') {
          continue;
        }

        await db.runAsync(
          `INSERT INTO local_expense (
            id, business_id, branch_id, description, amount, category,
            notes, recorded_by_id, recorded_by_name, sync_status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            branch_id = excluded.branch_id,
            description = excluded.description,
            amount = excluded.amount,
            category = excluded.category,
            notes = excluded.notes,
            recorded_by_id = excluded.recorded_by_id,
            recorded_by_name = excluded.recorded_by_name,
            sync_status = 'synced',
            updated_at = excluded.updated_at`,
          [
            item.id,
            item.businessId,
            item.branchId,
            item.description,
            Number(item.amount),
            item.category,
            item.notes ?? null,
            item.recordedById ?? null,
            item.recordedByName ?? null,
            item.createdAt || new Date().toISOString(),
            item.updatedAt || new Date().toISOString(),
          ]
        );
      }
    });
  },
};
