import { getDatabase } from "../db/client";
import type { LocalStaffAssignmentRow, LocalSaleRow, LocalExpenseRow } from "../db/schema";
import type { ShiftDrawerMetrics } from "../types/staff";

export const localStaffRepo = {
  /**
   * Upserts a staff assignment in local SQLite.
   */
  async saveStaffAtomic(assignment: LocalStaffAssignmentRow): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO local_staff_assignment (
        id, business_id, branch_id, user_id, email, name, role, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        business_id = excluded.business_id,
        branch_id = excluded.branch_id,
        user_id = excluded.user_id,
        email = excluded.email,
        name = excluded.name,
        role = excluded.role,
        status = excluded.status,
        updated_at = excluded.updated_at`,
      [
        assignment.id,
        assignment.business_id,
        assignment.branch_id,
        assignment.user_id,
        assignment.email,
        assignment.name,
        assignment.role,
        assignment.status,
        assignment.created_at,
        assignment.updated_at,
      ]
    );
  },

  /**
   * Atomically saves or updates a batch of staff assignments.
   */
  async saveStaffBatch(assignments: LocalStaffAssignmentRow[]): Promise<void> {
    if (!assignments || assignments.length === 0) return;
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      for (const a of assignments) {
        await db.runAsync(
          `INSERT INTO local_staff_assignment (
            id, business_id, branch_id, user_id, email, name, role, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            business_id = excluded.business_id,
            branch_id = excluded.branch_id,
            user_id = excluded.user_id,
            email = excluded.email,
            name = excluded.name,
            role = excluded.role,
            status = excluded.status,
            updated_at = excluded.updated_at`,
          [
            a.id,
            a.business_id,
            a.branch_id,
            a.user_id,
            a.email,
            a.name,
            a.role,
            a.status,
            a.created_at,
            a.updated_at,
          ]
        );
      }
    });
  },

  /**
   * Retrieves all staff assigned to a specific branch from SQLite.
   */
  async getStaffAssignmentsByBranch(
    branchId: string
  ): Promise<LocalStaffAssignmentRow[]> {
    const db = await getDatabase();
    return await db.getAllAsync<LocalStaffAssignmentRow>(
      `SELECT * FROM local_staff_assignment WHERE branch_id = ? ORDER BY created_at DESC`,
      [branchId]
    );
  },

  /**
   * Finds a staff assignment by user ID.
   */
  async getStaffAssignmentByUserId(
    userId: string
  ): Promise<LocalStaffAssignmentRow | null> {
    const db = await getDatabase();
    return await db.getFirstAsync<LocalStaffAssignmentRow>(
      `SELECT * FROM local_staff_assignment WHERE user_id = ? AND status = 'active'`,
      [userId]
    );
  },

  /**
   * Finds a staff assignment by email.
   */
  async getStaffAssignmentByEmail(
    email: string
  ): Promise<LocalStaffAssignmentRow | null> {
    const db = await getDatabase();
    const normalized = email.toLowerCase().trim();
    return await db.getFirstAsync<LocalStaffAssignmentRow>(
      `SELECT * FROM local_staff_assignment WHERE lower(email) = ?`,
      [normalized]
    );
  },

  /**
   * Deletes a staff assignment from SQLite.
   */
  async deleteStaffAssignment(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM local_staff_assignment WHERE id = ?`, [id]);
  },

  /**
   * Clears all local staff assignments (e.g. on logout/reset).
   */
  async clearStaffAssignments(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM local_staff_assignment`);
  },

  /**
   * Computes shift drawer totals and metrics from local SQLite data for a given branch and date.
   * Completely local and offline-capable (0ms latency, zero network requirement).
   */
  async computeShiftDrawerMetrics(
    branchId: string,
    dateStr?: string
  ): Promise<ShiftDrawerMetrics> {
    const db = await getDatabase();
    const datePrefix = dateStr || new Date().toISOString().slice(0, 10);

    // 1. Fetch relevant sales for today
    const sales = await db.getAllAsync<LocalSaleRow>(
      `SELECT * FROM local_sale 
       WHERE branch_id = ? 
         AND status != 'voided' 
         AND (created_at LIKE ? OR paid_at LIKE ?)`,
      [branchId, `${datePrefix}%`, `${datePrefix}%`]
    );

    // 2. Fetch expenses for today
    const expenses = await db.getAllAsync<LocalExpenseRow>(
      `SELECT * FROM local_expense 
       WHERE branch_id = ? 
         AND created_at LIKE ?`,
      [branchId, `${datePrefix}%`]
    );

    let cashInDrawer = 0;
    let telebirrCollected = 0;
    let cbeBirrCollected = 0;
    let dubeRecovered = 0;
    let totalShiftVolume = 0;

    for (const s of sales) {
      if (
        s.sale_type === "dube" &&
        s.status === "settled" &&
        s.paid_at &&
        s.paid_at.startsWith(datePrefix)
      ) {
        // Settled credit debt paid today
        dubeRecovered += s.amount;
        totalShiftVolume += s.amount;

        if (s.payment_method === "cash") cashInDrawer += s.amount;
        else if (s.payment_method === "telebirr") telebirrCollected += s.amount;
        else if (s.payment_method === "cbe") cbeBirrCollected += s.amount;
      } else if (
        s.sale_type === "instant" &&
        s.status === "settled" &&
        s.created_at.startsWith(datePrefix)
      ) {
        // Settled instant sale made today
        totalShiftVolume += s.amount;

        if (s.payment_method === "cash") cashInDrawer += s.amount;
        else if (s.payment_method === "telebirr") telebirrCollected += s.amount;
        else if (s.payment_method === "cbe") cbeBirrCollected += s.amount;
      }
    }

    const expenseVolume = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netCashInDrawer = cashInDrawer - expenseVolume;
    const transactionCount = sales.length + expenses.length;

    return {
      totalShiftVolume,
      cashInDrawer,
      telebirrCollected,
      cbeBirrCollected,
      dubeRecovered,
      expenseVolume,
      netCashInDrawer,
      transactionCount,
    };
  },
};
