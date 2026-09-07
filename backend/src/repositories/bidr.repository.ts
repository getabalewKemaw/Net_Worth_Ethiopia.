import { db } from "../config/db";
import { sale } from "../db/schema";
import { eq, and, asc, desc, lt, gte, lte, type SQL } from "drizzle-orm";
import type { Sale, BidrFilters, DebtSummary, SettleBidrInput, UpdateBidrInput } from "../types";

export const findDebtsByBusinessId = async (
  businessId: string,
  filters?: BidrFilters | undefined
): Promise<Sale[]> => {
  const conditions: SQL[] = [
    eq(sale.businessId, businessId),
    eq(sale.saleType, "dube"),
  ];

  if (filters?.branchId) {
    conditions.push(eq(sale.branchId, filters.branchId));
  }
  if (filters?.status) {
    conditions.push(eq(sale.status, filters.status));
  }
  if (filters?.isOverdue === true) {
    conditions.push(
      and(
        eq(sale.status, "pending"),
        lt(sale.dueDate, new Date())
      )!
    );
  } else if (filters?.isOverdue === false) {
    conditions.push(
      gte(sale.dueDate, new Date())
    );
  }
  if (filters?.startDate) {
    conditions.push(gte(sale.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(sale.createdAt, filters.endDate));
  }

  let query = db
    .select()
    .from(sale)
    .where(and(...conditions))
    .orderBy(asc(sale.dueDate), desc(sale.createdAt))
    .$dynamic();

  if (filters?.limit !== undefined) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset !== undefined) {
    query = query.offset(filters.offset);
  }

  return await query;
};

export const findDebtById = async (id: string): Promise<Sale | undefined> => {
  const [result] = await db
    .select()
    .from(sale)
    .where(and(eq(sale.id, id), eq(sale.saleType, "dube")));
  return result;
};

export const settleDebt = async (
  id: string,
  data?: SettleBidrInput | undefined
): Promise<Sale> => {
  const setValues: Record<string, any> = {
    status: "settled",
    paidAt: new Date(),
    updatedAt: new Date(),
  };

  if (data?.paymentMethod) {
    setValues.paymentMethod = data.paymentMethod;
  }
  if (data?.notes !== undefined) {
    setValues.notes = data.notes;
  }

  const [result] = await db
    .update(sale)
    .set(setValues)
    .where(and(eq(sale.id, id), eq(sale.saleType, "dube")))
    .returning();

  return result!;
};

export const updateDebt = async (
  id: string,
  data: UpdateBidrInput
): Promise<Sale> => {
  const setValues: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (data.dueDate !== undefined) {
    setValues.dueDate = data.dueDate;
  }
  if (data.customerName !== undefined) {
    setValues.customerName = data.customerName;
  }
  if (data.customerPhone !== undefined) {
    setValues.customerPhone = data.customerPhone;
  }
  if (data.notes !== undefined) {
    setValues.notes = data.notes;
  }
  if (data.status !== undefined) {
    setValues.status = data.status;
    if (data.status === "settled") {
      setValues.paidAt = new Date();
    } else if (data.status === "pending" || data.status === "voided") {
      setValues.paidAt = null;
    }
  }

  const [result] = await db
    .update(sale)
    .set(setValues)
    .where(and(eq(sale.id, id), eq(sale.saleType, "dube")))
    .returning();

  return result!;
};

export const getDebtSummary = async (
  businessId: string,
  branchId?: string | undefined
): Promise<DebtSummary> => {
  const debts = await findDebtsByBusinessId(businessId, { branchId });
  const now = new Date();

  let totalPendingAmount = 0;
  let pendingCount = 0;
  let totalOverdueAmount = 0;
  let overdueCount = 0;
  let totalSettledAmount = 0;
  let settledCount = 0;

  for (const d of debts) {
    if (d.status === "pending") {
      totalPendingAmount += d.amount;
      pendingCount += 1;
      if (d.dueDate && new Date(d.dueDate) < now) {
        totalOverdueAmount += d.amount;
        overdueCount += 1;
      }
    } else if (d.status === "settled") {
      totalSettledAmount += d.amount;
      settledCount += 1;
    }
  }

  return {
    totalPendingAmount,
    pendingCount,
    totalOverdueAmount,
    overdueCount,
    totalSettledAmount,
    settledCount,
  };
};
