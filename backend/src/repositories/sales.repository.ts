import { db } from "../config/db";
import { sale } from "../db/schema";
import { eq, and, desc, type SQL } from "drizzle-orm";
import type { Sale, NewSale, UpdateSaleInput } from "../types";

export interface SaleFilters {
  branchId?: string | undefined;
  saleType?: "instant" | "dube" | undefined;
  status?: "pending" | "settled" | "voided" | undefined;
}

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
  filters?: SaleFilters
): Promise<Sale[]> => {
  const conditions: SQL[] = [eq(sale.businessId, businessId)];

  if (filters?.branchId) {
    conditions.push(eq(sale.branchId, filters.branchId));
  }
  if (filters?.saleType) {
    conditions.push(eq(sale.saleType, filters.saleType));
  }
  if (filters?.status) {
    conditions.push(eq(sale.status, filters.status));
  }

  return await db
    .select()
    .from(sale)
    .where(and(...conditions))
    .orderBy(desc(sale.createdAt));
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
