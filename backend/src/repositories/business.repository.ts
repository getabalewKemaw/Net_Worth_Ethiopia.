import { db } from "../config/db";
import { business } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Business, NewBusiness } from "../types";

export const createBusiness = async (data: NewBusiness): Promise<Business> => {
  const [result] = await db.insert(business).values(data).returning();
  return result!;
};

export const findBusinessById = async (id: string): Promise<Business | undefined> => {
  const [result] = await db.select().from(business).where(eq(business.id, id));
  return result;
};

export const findBusinessesByUserId = async (userId: string): Promise<Business[]> => {
  return await db.select().from(business).where(eq(business.userId, userId));
};

export const updateBusiness = async (id: string, data: Partial<NewBusiness>): Promise<Business> => {
  const [result] = await db
    .update(business)
    .set({ ...(data as any), updatedAt: new Date() })
    .where(eq(business.id, id))
    .returning();
  return result!;
};
