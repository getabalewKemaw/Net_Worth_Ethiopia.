import { db } from "../config/db";
import { branch } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Branch, NewBranch } from "../types";

export const createBranch = async (data: NewBranch): Promise<Branch> => {
  const [result] = await db.insert(branch).values(data).returning();
  return result!;
};

export const findBranchById = async (id: string): Promise<Branch | undefined> => {
  const [result] = await db.select().from(branch).where(eq(branch.id, id));
  return result;
};

export const findBranchesByBusinessId = async (businessId: string): Promise<Branch[]> => {
  return await db.select().from(branch).where(eq(branch.businessId, businessId));
};

export const updateBranch = async (id: string, data: Partial<NewBranch>): Promise<Branch> => {
  const [result] = await db
    .update(branch)
    .set({ ...(data as any), updatedAt: new Date() })
    .where(eq(branch.id, id))
    .returning();
  return result!;
};
