import { db } from "../config/db";
import { staffAssignment } from "../db/staff-management";
import { user } from "../db/schema";
import { sale, expense } from "../db/sales-expense-management";
import { eq, and, sql, desc, gte, lte, ne } from "drizzle-orm";
import type {
  StaffAssignment,
  NewStaffAssignment,
  BranchDailyDigest,
  SettledDebtDigestItem,
} from "../types/staff";

export const createStaffAssignment = async (
  data: NewStaffAssignment
): Promise<StaffAssignment> => {
  const [result] = await db.insert(staffAssignment).values(data).returning();
  return result!;
};

export const findStaffAssignmentById = async (
  id: string
): Promise<StaffAssignment | undefined> => {
  const [result] = await db
    .select()
    .from(staffAssignment)
    .where(eq(staffAssignment.id, id));
  return result;
};

export const findStaffAssignmentsByBranchId = async (
  branchId: string
): Promise<StaffAssignment[]> => {
  return await db
    .select()
    .from(staffAssignment)
    .where(eq(staffAssignment.branchId, branchId))
    .orderBy(desc(staffAssignment.createdAt));
};

export const findStaffAssignmentsByBusinessId = async (
  businessId: string
): Promise<StaffAssignment[]> => {
  return await db
    .select()
    .from(staffAssignment)
    .where(eq(staffAssignment.businessId, businessId))
    .orderBy(desc(staffAssignment.createdAt));
};

export const findStaffAssignmentByBusinessAndEmail = async (
  businessId: string,
  email: string
): Promise<StaffAssignment | undefined> => {
  const normalizedEmail = email.toLowerCase().trim();
  const [result] = await db
    .select()
    .from(staffAssignment)
    .where(
      and(
        eq(staffAssignment.businessId, businessId),
        eq(sql`lower(${staffAssignment.email})`, normalizedEmail)
      )
    );
  return result;
};

export const findActiveStaffAssignmentByUserId = async (
  userId: string
): Promise<StaffAssignment | undefined> => {
  const [result] = await db
    .select()
    .from(staffAssignment)
    .where(
      and(
        eq(staffAssignment.userId, userId),
        eq(staffAssignment.status, "active")
      )
    );
  return result;
};

export const findPendingStaffAssignmentByEmail = async (
  email: string
): Promise<StaffAssignment | undefined> => {
  const normalizedEmail = email.toLowerCase().trim();
  const [result] = await db
    .select()
    .from(staffAssignment)
    .where(
      and(
        eq(sql`lower(${staffAssignment.email})`, normalizedEmail),
        eq(staffAssignment.status, "pending")
      )
    );
  return result;
};

export const claimPendingAssignment = async (
  email: string,
  userId: string
): Promise<StaffAssignment | undefined> => {
  const normalizedEmail = email.toLowerCase().trim();
  const [updated] = await db
    .update(staffAssignment)
    .set({
      userId,
      status: "active",
      acceptedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(sql`lower(${staffAssignment.email})`, normalizedEmail),
        eq(staffAssignment.status, "pending")
      )
    )
    .returning();
  return updated;
};

export const updateStaffAssignment = async (
  id: string,
  data: Partial<NewStaffAssignment>
): Promise<StaffAssignment> => {
  const [result] = await db
    .update(staffAssignment)
    .set({ ...(data as any), updatedAt: new Date() })
    .where(eq(staffAssignment.id, id))
    .returning();
  return result!;
};

export const deleteStaffAssignment = async (
  id: string
): Promise<StaffAssignment | undefined> => {
  const [result] = await db
    .delete(staffAssignment)
    .where(eq(staffAssignment.id, id))
    .returning();
  return result;
};

export const findUserByEmail = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const [found] = await db
    .select()
    .from(user)
    .where(eq(sql`lower(${user.email})`, normalizedEmail));
  return found;
};

export const getBranchDailyDigestMetrics = async (
  businessId: string,
  branchId: string,
  branchName: string,
  startDate: Date,
  endDate: Date
): Promise<BranchDailyDigest> => {
  // 1. Fetch relevant sales for the date range
  const salesRecords = await db
    .select()
    .from(sale)
    .where(
      and(
        eq(sale.businessId, businessId),
        eq(sale.branchId, branchId),
        ne(sale.status, "voided"),
        sql`((${sale.createdAt} >= ${startDate} AND ${sale.createdAt} <= ${endDate}) OR (${sale.paidAt} >= ${startDate} AND ${sale.paidAt} <= ${endDate}))`
      )
    );

  // 2. Fetch expenses for the date range
  const expenseRecords = await db
    .select()
    .from(expense)
    .where(
      and(
        eq(expense.businessId, businessId),
        eq(expense.branchId, branchId),
        gte(expense.createdAt, startDate),
        lte(expense.createdAt, endDate)
      )
    );

  let cashVolume = 0;
  let telebirrVolume = 0;
  let cbeVolume = 0;
  let grossInflow = 0;
  const settledDebtsToday: SettledDebtDigestItem[] = [];
  let detectedCashierName: string | null = null;

  for (const s of salesRecords) {
    if (s.recordedByName && !detectedCashierName) {
      detectedCashierName = s.recordedByName;
    }

    // Check if settled debt paid today
    if (
      s.saleType === "dube" &&
      s.status === "settled" &&
      s.paidAt &&
      s.paidAt >= startDate &&
      s.paidAt <= endDate
    ) {
      settledDebtsToday.push({
        saleId: s.id,
        customerName: s.customerName,
        amount: s.amount,
        paymentMethod: s.paymentMethod,
        recordedByName: s.recordedByName || null,
        time: s.paidAt.toISOString(),
      });

      grossInflow += s.amount;
      if (s.paymentMethod === "cash") cashVolume += s.amount;
      else if (s.paymentMethod === "telebirr") telebirrVolume += s.amount;
      else if (s.paymentMethod === "cbe") cbeVolume += s.amount;
    } else if (
      s.saleType === "instant" &&
      s.status === "settled" &&
      s.createdAt >= startDate &&
      s.createdAt <= endDate
    ) {
      // Instant sale made today
      grossInflow += s.amount;
      if (s.paymentMethod === "cash") cashVolume += s.amount;
      else if (s.paymentMethod === "telebirr") telebirrVolume += s.amount;
      else if (s.paymentMethod === "cbe") cbeVolume += s.amount;
    }
  }

  const expenseVolume = expenseRecords.reduce((sum, e) => {
    if (e.recordedByName && !detectedCashierName) {
      detectedCashierName = e.recordedByName;
    }
    return sum + e.amount;
  }, 0);

  // If no cashier detected from transactions, check assigned staff
  if (!detectedCashierName) {
    const assignedStaff = await findStaffAssignmentsByBranchId(branchId);
    if (assignedStaff.length > 0 && assignedStaff[0]?.name) {
      detectedCashierName = assignedStaff[0].name;
    }
  }

  const netShiftCash = grossInflow - expenseVolume;

  return {
    branchId,
    branchName,
    cashierName: detectedCashierName,
    metrics: {
      grossInflow,
      cashVolume,
      telebirrVolume,
      cbeVolume,
      expenseVolume,
      netShiftCash,
    },
    settledDebtsToday,
  };
};
