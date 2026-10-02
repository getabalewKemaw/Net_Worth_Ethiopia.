import { getDatabase } from '../db/client';
import type { LocalSaleRow } from '../db/schema';
import type { SaleEntry, SaleInput } from '../types/sales';
import { syncQueueRepo } from './sync-queue.repo';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 v4 generator
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

function formatDisplayDate(dateStr?: string | null): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function mapRowToSaleEntry(row: LocalSaleRow): SaleEntry {
  return {
    id: row.id,
    businessId: row.business_id,
    branchId: row.branch_id,
    description: row.description,
    amount: Number(row.amount),
    customer: row.customer_name ?? undefined,
    phone: row.customer_phone ?? undefined,
    paymentMethod: row.payment_method as any,
    saleType: row.sale_type,
    dueDate: formatDisplayDate(row.due_date),
    status: row.status as any,
    paidAt: row.paid_at,
    time: formatDisplayTime(row.created_at),
    createdAt: row.created_at,
  };
}

/**
 * Repository for local SQLite Sales operations with transactional outbox queueing.
 */
export const localSalesRepo = {
  /**
   * Atomically records a sale in SQLite and enqueues an outbox sync action.
   * Completely offline capable (0ms latency, zero blocking network call).
   */
  async createSaleAtomic(
    input: SaleInput,
    businessId: string,
    branchId: string
  ): Promise<SaleEntry> {
    const db = await getDatabase();
    const id = generateUUID();
    const mutationId = generateUUID();
    const now = new Date().toISOString();

    const isInstant = input.saleType === 'instant';
    const status = input.status || (isInstant ? 'settled' : 'pending');
    const paidAt = status === 'settled' ? (input.paidAt || now) : null;

    const row: LocalSaleRow = {
      id,
      business_id: businessId,
      branch_id: branchId,
      sale_type: input.saleType,
      payment_method: input.paymentMethod,
      description: input.description,
      amount: input.amount,
      customer_name: input.customer ?? null,
      customer_phone: input.phone ?? null,
      due_date: input.dueDate ?? null,
      status,
      notes: null,
      paid_at: paidAt,
      sync_status: 'pending_create',
      created_at: now,
      updated_at: now,
    };

    // Execute atomic SQLite transaction
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO local_sale (
          id, business_id, branch_id, sale_type, payment_method, description,
          amount, customer_name, customer_phone, due_date, status, notes,
          paid_at, sync_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.business_id,
          row.branch_id,
          row.sale_type,
          row.payment_method,
          row.description,
          row.amount,
          row.customer_name,
          row.customer_phone,
          row.due_date,
          row.status,
          row.notes,
          row.paid_at,
          row.sync_status,
          row.created_at,
          row.updated_at,
        ]
      );

      // Enqueue sync action within same transaction
      await syncQueueRepo.enqueueMutation(
        {
          mutationId,
          entityType: 'sale',
          entityId: id,
          action: 'CREATE',
          payload: {
            id,
            businessId,
            branchId,
            saleType: row.sale_type,
            paymentMethod: row.payment_method,
            description: row.description,
            amount: row.amount,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            dueDate: row.due_date,
            status: row.status,
            paidAt: row.paid_at,
            createdAt: now,
          },
          createdAt: now,
        },
        db
      );
    });

    return mapRowToSaleEntry(row);
  },

  /**
   * Retrieves instant sales for the given business & branch from local SQLite.
   */
  async getSales(
    businessId: string,
    branchId?: string,
    limit = 100
  ): Promise<SaleEntry[]> {
    const db = await getDatabase();
    let query = `
      SELECT * FROM local_sale 
      WHERE business_id = ? AND sale_type = 'instant'
    `;
    const params: any[] = [businessId];

    if (branchId) {
      query += ` AND branch_id = ?`;
      params.push(branchId);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);

    const rows = await db.getAllAsync<LocalSaleRow>(query, params);
    return rows.map(mapRowToSaleEntry);
  },

  /**
   * Computes today's sales revenue directly from SQLite (works 100% offline).
   */
  async getTodayRevenueMetric(
    businessId: string,
    branchId?: string
  ): Promise<{ revenue: number; saleCount: number }> {
    const db = await getDatabase();
    let query = `
      SELECT 
        COALESCE(SUM(amount), 0) AS revenue,
        COUNT(*) AS count
      FROM local_sale
      WHERE business_id = ? 
        AND sale_type = 'instant'
        AND date(created_at) = date('now')
    `;
    const params: any[] = [businessId];

    if (branchId) {
      query += ` AND branch_id = ?`;
      params.push(branchId);
    }

    const result = await db.getFirstAsync<{ revenue: number; count: number }>(
      query,
      params
    );

    return {
      revenue: Number(result?.revenue ?? 0),
      saleCount: Number(result?.count ?? 0),
    };
  },

  /**
   * Bulk upserts remote sales pulled from backend sync.
   * Protects locally modified/pending records from overwrite.
   */
  async upsertSyncedSales(items: any[]): Promise<void> {
    if (!items.length) return;
    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      for (const item of items) {
        // Check if there is an existing pending record
        const existing = await db.getFirstAsync<LocalSaleRow>(
          `SELECT sync_status FROM local_sale WHERE id = ?`,
          [item.id]
        );

        // If local record has pending changes, let local win until pushed
        if (existing && existing.sync_status !== 'synced') {
          continue;
        }

        await db.runAsync(
          `INSERT INTO local_sale (
            id, business_id, branch_id, sale_type, payment_method, description,
            amount, customer_name, customer_phone, due_date, status, notes,
            paid_at, sync_status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            branch_id = excluded.branch_id,
            sale_type = excluded.sale_type,
            payment_method = excluded.payment_method,
            description = excluded.description,
            amount = excluded.amount,
            customer_name = excluded.customer_name,
            customer_phone = excluded.customer_phone,
            due_date = excluded.due_date,
            status = excluded.status,
            notes = excluded.notes,
            paid_at = excluded.paid_at,
            sync_status = 'synced',
            updated_at = excluded.updated_at`,
          [
            item.id,
            item.businessId,
            item.branchId,
            item.saleType,
            item.paymentMethod,
            item.description,
            Number(item.amount),
            item.customerName ?? null,
            item.customerPhone ?? null,
            item.dueDate ?? null,
            item.status,
            item.notes ?? null,
            item.paidAt ?? null,
            item.createdAt || new Date().toISOString(),
            item.updatedAt || new Date().toISOString(),
          ]
        );
      }
    });
  },
};
