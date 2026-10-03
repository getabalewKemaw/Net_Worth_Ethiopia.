import { getDatabase } from '../db/client';
import type { LocalSaleRow } from '../db/schema';
import type {
  CreateDebtPayload,
  DebtFilterStatus,
  DebtItem,
  DebtSortOption,
  DebtSummaryData,
  FetchDebtsParams,
  SettleDebtPayload,
  UpdateDebtPayload,
} from '../types/bidr';
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

export function mapRowToDebtItem(row: LocalSaleRow): DebtItem {
  return {
    id: row.id,
    businessId: row.business_id,
    branchId: row.branch_id,
    saleType: 'dube',
    paymentMethod: row.payment_method as any,
    description: row.description,
    amount: Number(row.amount),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    dueDate: row.due_date,
    notes: row.notes,
    status: row.status as any,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Repository for local SQLite customer credit (Dube / Bidr) notebook operations.
 */
export const localBidrRepo = {
  /**
   * Atomically records a customer credit (Dube) debt and enqueues an outbox sync action.
   */
  async createDebtAtomic(payload: CreateDebtPayload): Promise<DebtItem> {
    const db = await getDatabase();
    const id = generateUUID();
    const mutationId = generateUUID();
    const now = new Date().toISOString();

    const row: LocalSaleRow = {
      id,
      business_id: payload.businessId,
      branch_id: payload.branchId,
      sale_type: 'dube',
      payment_method: payload.paymentMethod || 'cash',
      description: payload.description,
      amount: payload.amount,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone ?? null,
      due_date: payload.dueDate ?? null,
      status: 'pending',
      notes: payload.notes ?? null,
      paid_at: null,
      sync_status: 'pending_create',
      created_at: now,
      updated_at: now,
    };

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

      await syncQueueRepo.enqueueMutation(
        {
          mutationId,
          entityType: 'debt',
          entityId: id,
          action: 'CREATE',
          payload: {
            id,
            businessId: row.business_id,
            branchId: row.branch_id,
            description: row.description,
            amount: row.amount,
            paymentMethod: row.payment_method,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            dueDate: row.due_date,
            notes: row.notes,
            createdAt: now,
          },
          createdAt: now,
        },
        db
      );
    });

    return mapRowToDebtItem(row);
  },

  /**
   * Atomically settles a debt offline in SQLite and enqueues an outbox sync action.
   */
  async settleDebtAtomic(
    id: string,
    payload?: SettleDebtPayload
  ): Promise<DebtItem> {
    const db = await getDatabase();
    const mutationId = generateUUID();
    const now = new Date().toISOString();

    const existing = await db.getFirstAsync<LocalSaleRow>(
      `SELECT * FROM local_sale WHERE id = ? AND sale_type = 'dube'`,
      [id]
    );

    if (!existing) {
      throw new Error(`Debt record with id ${id} not found.`);
    }

    const updatedPaymentMethod = payload?.paymentMethod || existing.payment_method;
    const updatedNotes = payload?.notes ?? existing.notes;

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE local_sale
         SET status = 'settled',
             paid_at = ?,
             payment_method = ?,
             notes = ?,
             sync_status = 'pending_update',
             updated_at = ?
         WHERE id = ?`,
        [now, updatedPaymentMethod, updatedNotes, now, id]
      );

      await syncQueueRepo.enqueueMutation(
        {
          mutationId,
          entityType: 'debt',
          entityId: id,
          action: 'SETTLE',
          payload: {
            id,
            paymentMethod: updatedPaymentMethod,
            notes: updatedNotes,
            paidAt: now,
          },
          createdAt: now,
        },
        db
      );
    });

    return {
      ...mapRowToDebtItem(existing),
      status: 'settled',
      paidAt: now,
      paymentMethod: updatedPaymentMethod as any,
      notes: updatedNotes,
      updatedAt: now,
    };
  },

  /**
   * Updates an existing debt record (due date, customer details, notes).
   */
  async updateDebtAtomic(
    id: string,
    payload: UpdateDebtPayload
  ): Promise<DebtItem> {
    const db = await getDatabase();
    const mutationId = generateUUID();
    const now = new Date().toISOString();

    const existing = await db.getFirstAsync<LocalSaleRow>(
      `SELECT * FROM local_sale WHERE id = ? AND sale_type = 'dube'`,
      [id]
    );

    if (!existing) {
      throw new Error(`Debt record with id ${id} not found.`);
    }

    const customerName = payload.customerName !== undefined ? payload.customerName : existing.customer_name;
    const customerPhone = payload.customerPhone !== undefined ? payload.customerPhone : existing.customer_phone;
    const dueDate = payload.dueDate !== undefined ? payload.dueDate : existing.due_date;
    const notes = payload.notes !== undefined ? payload.notes : existing.notes;
    const status = payload.status !== undefined ? payload.status : existing.status;

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE local_sale
         SET customer_name = ?,
             customer_phone = ?,
             due_date = ?,
             notes = ?,
             status = ?,
             sync_status = 'pending_update',
             updated_at = ?
         WHERE id = ?`,
        [customerName, customerPhone, dueDate, notes, status, now, id]
      );

      await syncQueueRepo.enqueueMutation(
        {
          mutationId,
          entityType: 'debt',
          entityId: id,
          action: 'UPDATE',
          payload: {
            id,
            customerName,
            customerPhone,
            dueDate,
            notes,
            status,
          },
          createdAt: now,
        },
        db
      );
    });

    return {
      ...mapRowToDebtItem(existing),
      customerName,
      customerPhone,
      dueDate,
      notes,
      status: status as any,
      updatedAt: now,
    };
  },

  /**
   * Retrieves debt items matching search query, status filters, and sorting offline.
   */
  async getDebts(
    businessId: string,
    branchId?: string,
    options?: {
      searchQuery?: string;
      filterStatus?: DebtFilterStatus;
      sortBy?: DebtSortOption;
      limit?: number;
    }
  ): Promise<DebtItem[]> {
    const db = await getDatabase();
    let query = `
      SELECT * FROM local_sale 
      WHERE business_id = ? AND sale_type = 'dube'
    `;
    const params: any[] = [businessId];

    if (branchId) {
      query += ` AND branch_id = ?`;
      params.push(branchId);
    }

    if (options?.searchQuery?.trim()) {
      const pattern = `%${options.searchQuery.trim()}%`;
      query += ` AND (customer_name LIKE ? OR description LIKE ? OR customer_phone LIKE ?)`;
      params.push(pattern, pattern, pattern);
    }

    // Filter status handling
    if (options?.filterStatus && options.filterStatus !== 'all') {
      if (options.filterStatus === 'pending') {
        query += ` AND status = 'pending'`;
      } else if (options.filterStatus === 'settled') {
        query += ` AND status = 'settled'`;
      } else if (options.filterStatus === 'overdue') {
        query += ` AND status = 'pending' AND due_date IS NOT NULL AND date(due_date) < date('now')`;
      } else if (options.filterStatus === 'due_soon') {
        query += ` AND status = 'pending' AND due_date IS NOT NULL AND date(due_date) >= date('now') AND date(due_date) <= date('now', '+3 days')`;
      }
    }

    // Sort order handling
    switch (options?.sortBy) {
      case 'due_asc':
        query += ` ORDER BY due_date IS NULL, due_date ASC, created_at DESC`;
        break;
      case 'due_desc':
        query += ` ORDER BY due_date IS NULL, due_date DESC, created_at DESC`;
        break;
      case 'created_asc':
        query += ` ORDER BY created_at ASC`;
        break;
      case 'amount_desc':
        query += ` ORDER BY amount DESC`;
        break;
      case 'amount_asc':
        query += ` ORDER BY amount ASC`;
        break;
      case 'created_desc':
      default:
        query += ` ORDER BY created_at DESC`;
        break;
    }

    if (options?.limit) {
      query += ` LIMIT ?`;
      params.push(options.limit);
    }

    const rows = await db.getAllAsync<LocalSaleRow>(query, params);
    return rows.map(mapRowToDebtItem);
  },

  /**
   * Calculates overall customer debt metrics directly from SQLite (100% offline).
   */
  async getDebtSummaryMetric(
    businessId: string,
    branchId?: string
  ): Promise<DebtSummaryData> {
    const db = await getDatabase();
    let query = `
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS total_pending,
        COALESCE(SUM(CASE WHEN status = 'settled' THEN amount ELSE 0 END), 0) AS total_settled,
        COALESCE(SUM(CASE WHEN status = 'pending' AND due_date IS NOT NULL AND date(due_date) < date('now') THEN amount ELSE 0 END), 0) AS total_overdue,
        COALESCE(SUM(CASE WHEN status = 'pending' AND due_date IS NOT NULL AND date(due_date) >= date('now') AND date(due_date) <= date('now', '+3 days') THEN amount ELSE 0 END), 0) AS total_due_soon,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count,
        COUNT(CASE WHEN status = 'settled' THEN 1 END) AS settled_count,
        COUNT(CASE WHEN status = 'pending' AND due_date IS NOT NULL AND date(due_date) < date('now') THEN 1 END) AS overdue_count,
        COUNT(CASE WHEN status = 'pending' AND due_date IS NOT NULL AND date(due_date) >= date('now') AND date(due_date) <= date('now', '+3 days') THEN 1 END) AS due_soon_count
      FROM local_sale
      WHERE business_id = ? AND sale_type = 'dube'
    `;
    const params: any[] = [businessId];

    if (branchId) {
      query += ` AND branch_id = ?`;
      params.push(branchId);
    }

    const result = await db.getFirstAsync<{
      total_pending: number;
      total_settled: number;
      total_overdue: number;
      total_due_soon: number;
      pending_count: number;
      settled_count: number;
      overdue_count: number;
      due_soon_count: number;
    }>(query, params);

    const totalPending = Number(result?.total_pending ?? 0);
    const totalSettled = Number(result?.total_settled ?? 0);
    const totalOverdue = Number(result?.total_overdue ?? 0);
    const totalDueSoon = Number(result?.total_due_soon ?? 0);

    return {
      totalCreditAmount: totalPending,
      pendingAmount: totalPending,
      totalPendingAmount: totalPending,
      settledAmount: totalSettled,
      totalSettledAmount: totalSettled,
      overdueAmount: totalOverdue,
      totalOverdueAmount: totalOverdue,
      dueSoonAmount: totalDueSoon,
      totalDebts: totalPending + totalSettled,
      pendingCount: Number(result?.pending_count ?? 0),
      settledCount: Number(result?.settled_count ?? 0),
      overdueCount: Number(result?.overdue_count ?? 0),
      dueSoonCount: Number(result?.due_soon_count ?? 0),
    };
  },

  /**
   * Bulk upserts remote debts pulled from backend sync.
   */
  async upsertSyncedDebts(items: any[]): Promise<void> {
    if (!items.length) return;
    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      for (const item of items) {
        const existing = await db.getFirstAsync<LocalSaleRow>(
          `SELECT sync_status FROM local_sale WHERE id = ?`,
          [item.id]
        );

        if (existing && existing.sync_status !== 'synced') {
          continue;
        }

        await db.runAsync(
          `INSERT INTO local_sale (
            id, business_id, branch_id, sale_type, payment_method, description,
            amount, customer_name, customer_phone, due_date, status, notes,
            paid_at, sync_status, created_at, updated_at
          ) VALUES (?, ?, ?, 'dube', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            branch_id = excluded.branch_id,
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
            item.paymentMethod || 'cash',
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
