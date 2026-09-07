import { db } from "../config/db";
import { expense } from "../db/schema";
import { eq, and, desc, type SQL } from "drizzle-orm";
import type { Expense, NewExpense, UpdateExpenseInput } from "../types";

export interface ExpenseFilters {
  branchId?: string | undefined;
  category?: string | undefined;
}

export const createExpense = async (data: NewExpense): Promise<Expense> => {
  const [result] = await db.insert(expense).values(data).returning();
  return result!;
};

export const findExpenseById = async (id: string): Promise<Expense | undefined> => {
  const [result] = await db.select().from(expense).where(eq(expense.id, id));
  return result;
};

export const findExpensesByBusinessId = async (
  businessId: string,
  filters?: ExpenseFilters
): Promise<Expense[]> => {
  const conditions: SQL[] = [eq(expense.businessId, businessId)];

  if (filters?.branchId) {
    conditions.push(eq(expense.branchId, filters.branchId));
  }
  if (filters?.category) {
    conditions.push(eq(expense.category, filters.category));
  }

  return await db
    .select()
    .from(expense)
    .where(and(...conditions))
    .orderBy(desc(expense.createdAt));
};

export const updateExpense = async (
  id: string,
  data: Partial<NewExpense> | UpdateExpenseInput
): Promise<Expense> => {
  const [result] = await db
    .update(expense)
    .set({ ...(data as any), updatedAt: new Date() })
    .where(eq(expense.id, id))
    .returning();
  return result!;
};

export const deleteExpense = async (id: string): Promise<Expense | undefined> => {
  const [result] = await db.delete(expense).where(eq(expense.id, id)).returning();
  return result;
};
