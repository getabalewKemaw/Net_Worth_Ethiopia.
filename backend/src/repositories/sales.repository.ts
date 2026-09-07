import { db } from "../config/db";
import { sale } from "../db/schema";
import { eq, and, desc, gte, lte, type SQL } from "drizzle-orm";
import type { Sale, NewSale, UpdateSaleInput, SaleFilters } from "../types";

export type { SaleFilters };

export const createSale = async (data: NewSale): Promise<Sale> => {
  const [result] = await db.insert(sale).values(data).returning();
  return result!;
};

export const findSaleById = async (id: string): Promise<Sale | undefined> => {
  const [result] = await db.select().from(sale).where(eq(sale.id, id));
  return result;
};

export const findSalesByBusinessId = async (
  businessId: string,
  filters?: SaleFilters | undefined
): Promise<Sale[]> => {
  const conditions: SQL[] = [eq(sale.businessId, businessId)];

  if (filters?.branchId) {
    conditions.push(eq(sale.branchId, filters.branchId));
  }
  if (filters?.saleType) {
    conditions.push(eq(sale.saleType, filters.saleType));
  }
  if (filters?.paymentMethod) {
    conditions.push(eq(sale.paymentMethod, filters.paymentMethod));
  }
  if (filters?.status) {
    conditions.push(eq(sale.status, filters.status));
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
    .orderBy(desc(sale.createdAt))
    .$dynamic();

  if (filters?.limit !== undefined) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset !== undefined) {
    query = query.offset(filters.offset);
  }

  return await query;
};

export const updateSale = async (
  id: string,
  data: Partial<NewSale> | UpdateSaleInput
): Promise<Sale> => {
  const [result] = await db
    .update(sale)
    .set({ ...(data as any), updatedAt: new Date() })
    .where(eq(sale.id, id))
    .returning();
  return result!;
};

export const deleteSale = async (id: string): Promise<Sale | undefined> => {
  const [result] = await db.delete(sale).where(eq(sale.id, id)).returning();
  return result;
};
