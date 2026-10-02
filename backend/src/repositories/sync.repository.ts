import { db } from "../config/db";
import { sale, expense, branch, syncIdempotency } from "../db/schema";
import { eq, and, gt, inArray } from "drizzle-orm";
import type { MutationItem } from "../types/sync";

export const syncRepo = {
  /**
   * Finds mutation IDs that have already been recorded in sync_idempotency.
   */
  async findProcessedMutationIds(mutationIds: string[]): Promise<Set<string>> {
    if (!mutationIds.length) return new Set();

    const results = await db
      .select({ mutationId: syncIdempotency.mutationId })
      .from(syncIdempotency)
      .where(inArray(syncIdempotency.mutationId, mutationIds));

    return new Set(results.map((r) => r.mutationId));
  },

  /**
   * Applies a batch of offline mutations within an atomic database transaction.
   * Guarantees idempotency and handles terminal states for debt settlements.
   */
  async applyBatchMutations(
    userId: string,
    businessId: string,
    mutations: MutationItem[]
  ): Promise<{
    processedIds: string[];
    rejected: Array<{ mutationId: string; reason: string }>;
  }> {
    const processedIds: string[] = [];
    const rejected: Array<{ mutationId: string; reason: string }> = [];

    // Pre-check for already processed mutations
    const existingMutationIds = await this.findProcessedMutationIds(
      mutations.map((m) => m.mutationId)
    );

    await db.transaction(async (tx) => {
      for (const item of mutations) {
        // Idempotency: skip if already executed
        if (existingMutationIds.has(item.mutationId)) {
          processedIds.push(item.mutationId);
          continue;
        }

        try {
          if (item.entityType === "sale" && item.action === "CREATE") {
            const p = item.payload;
            await tx
              .insert(sale)
              .values({
                id: p.id || item.entityId,
                businessId,
                branchId: p.branchId,
                saleType: p.saleType || "instant",
                paymentMethod: p.paymentMethod || "cash",
                description: p.description || "Sale",
                amount: Number(p.amount) || 0,
                customerName: p.customerName ?? null,
                customerPhone: p.customerPhone ?? null,
                dueDate: p.dueDate ? new Date(p.dueDate) : null,
                notes: p.notes ?? null,
                status: p.status || "settled",
                paidAt: p.paidAt ? new Date(p.paidAt) : new Date(),
                createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
                updatedAt: new Date(),
              })
              .onConflictDoNothing();
          } else if (item.entityType === "debt" && item.action === "CREATE") {
            const p = item.payload;
            await tx
              .insert(sale)
              .values({
                id: p.id || item.entityId,
                businessId,
                branchId: p.branchId,
                saleType: "dube",
                paymentMethod: p.paymentMethod || "cash",
                description: p.description || "Credit",
                amount: Number(p.amount) || 0,
                customerName: p.customerName,
                customerPhone: p.customerPhone ?? null,
                dueDate: p.dueDate ? new Date(p.dueDate) : null,
                notes: p.notes ?? null,
                status: "pending",
                paidAt: null,
                createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
                updatedAt: new Date(),
              })
              .onConflictDoNothing();
          } else if (item.entityType === "debt" && item.action === "SETTLE") {
            const p = item.payload;
            await tx
              .update(sale)
              .set({
                status: "settled",
                paymentMethod: p.paymentMethod || "cash",
                notes: p.notes ?? undefined,
                paidAt: p.paidAt ? new Date(p.paidAt) : new Date(),
                updatedAt: new Date(),
              })
              .where(eq(sale.id, item.entityId));
          } else if (item.entityType === "debt" && item.action === "UPDATE") {
            const p = item.payload;
            await tx
              .update(sale)
              .set({
                customerName: p.customerName ?? undefined,
                customerPhone: p.customerPhone ?? undefined,
                dueDate: p.dueDate ? new Date(p.dueDate) : undefined,
                notes: p.notes ?? undefined,
                status: p.status ?? undefined,
                updatedAt: new Date(),
              })
              .where(eq(sale.id, item.entityId));
          } else if (item.entityType === "expense" && item.action === "CREATE") {
            const p = item.payload;
            await tx
              .insert(expense)
              .values({
                id: p.id || item.entityId,
                businessId,
                branchId: p.branchId,
                description: p.description,
                amount: Number(p.amount) || 0,
                category: p.category,
                notes: p.notes ?? null,
                createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
                updatedAt: new Date(),
              })
              .onConflictDoNothing();
          }

          // Record in sync_idempotency
          await tx.insert(syncIdempotency).values({
            mutationId: item.mutationId,
            userId,
            businessId,
            entityType: item.entityType,
            entityId: item.entityId,
            action: item.action,
            status: "processed",
            createdAt: new Date(),
          });

          processedIds.push(item.mutationId);
        } catch (err: any) {
          console.error(`[Sync Repo] Failed mutation ${item.mutationId}:`, err);
          rejected.push({
            mutationId: item.mutationId,
            reason: err?.message || "Unknown error processing mutation",
          });
        }
      }
    });

    return { processedIds, rejected };
  },

  /**
   * Retrieves remote records changed after sinceDate for downstream pull sync.
   */
  async pullDeltaChanges(
    businessId: string,
    sinceDate?: Date
  ): Promise<{
    sales: any[];
    expenses: any[];
    branches: any[];
  }> {
    if (sinceDate) {
      const [salesList, expensesList, branchesList] = await Promise.all([
        db
          .select()
          .from(sale)
          .where(and(eq(sale.businessId, businessId), gt(sale.updatedAt, sinceDate))),
        db
          .select()
          .from(expense)
          .where(and(eq(expense.businessId, businessId), gt(expense.updatedAt, sinceDate))),
        db
          .select()
          .from(branch)
          .where(and(eq(branch.businessId, businessId), gt(branch.updatedAt, sinceDate))),
      ]);

      return {
        sales: salesList,
        expenses: expensesList,
        branches: branchesList,
      };
    }

    // Full snapshot if no timestamp provided
    const [salesList, expensesList, branchesList] = await Promise.all([
      db.select().from(sale).where(eq(sale.businessId, businessId)),
      db.select().from(expense).where(eq(expense.businessId, businessId)),
      db.select().from(branch).where(eq(branch.businessId, businessId)),
    ]);

    return {
      sales: salesList,
      expenses: expensesList,
      branches: branchesList,
    };
  },
};
