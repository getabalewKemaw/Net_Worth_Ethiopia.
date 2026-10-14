import { db } from "../config/db";
import {
  businessFinancialSnapshot,
  financialShareToken,
  business,
  branch,
  sale,
  expense,
} from "../db/schema";
import { eq, and, isNull, sql, gte, lte } from "drizzle-orm";
import type {
  BusinessFinancialSnapshot,
  NewBusinessFinancialSnapshot,
  FinancialShareToken,
  NewFinancialShareToken,
  SnapshotQueryParams,
} from "../types/business-health";

export const businessHealthRepo = {
  /**
   * Retrieves historical snapshots for a given business and branch scope.
   */
  async findSnapshots(params: SnapshotQueryParams): Promise<BusinessFinancialSnapshot[]> {
    const conditions = [eq(businessFinancialSnapshot.businessId, params.businessId)];

    if (params.branchId) {
      conditions.push(eq(businessFinancialSnapshot.branchId, params.branchId));
    } else {
      // NULL branch_id represents consolidated business-wide totals
      conditions.push(isNull(businessFinancialSnapshot.branchId));
    }

    if (params.periodType) {
      conditions.push(eq(businessFinancialSnapshot.periodType, params.periodType));
    }

    const limit = params.limit || 12;

    const results = await db
      .select()
      .from(businessFinancialSnapshot)
      .where(and(...conditions))
      .orderBy(businessFinancialSnapshot.startDate)
      .limit(limit);

    return results;
  },

  /**
   * Finds an existing snapshot by its unique business, branch, and period tuple.
   */
  async findSnapshotByPeriod(
    businessId: string,
    branchId: string | null,
    periodType: string,
    year: string,
    month: string | null
  ): Promise<BusinessFinancialSnapshot | undefined> {
    const conditions = [
      eq(businessFinancialSnapshot.businessId, businessId),
      eq(businessFinancialSnapshot.periodType, periodType),
      eq(businessFinancialSnapshot.periodYear, year),
    ];

    if (branchId) {
      conditions.push(eq(businessFinancialSnapshot.branchId, branchId));
    } else {
      conditions.push(isNull(businessFinancialSnapshot.branchId));
    }

    if (month) {
      conditions.push(eq(businessFinancialSnapshot.periodMonth, month));
    } else {
      conditions.push(isNull(businessFinancialSnapshot.periodMonth));
    }

    const [result] = await db
      .select()
      .from(businessFinancialSnapshot)
      .where(and(...conditions))
      .limit(1);

    return result;
  },

  /**
   * Saves or updates an aggregated snapshot record.
   */
  async saveSnapshot(data: NewBusinessFinancialSnapshot): Promise<BusinessFinancialSnapshot> {
    const existing = await this.findSnapshotByPeriod(
      data.businessId,
      data.branchId ?? null,
      data.periodType,
      data.periodYear,
      data.periodMonth ?? null
    );

    if (existing) {
      const [updated] = await db
        .update(businessFinancialSnapshot)
        .set({
          grossInflow: data.grossInflow,
          grossOutflow: data.grossOutflow,
          netProfit: data.netProfit,
          profitMarginPct: data.profitMarginPct,
          growthMoMPct: data.growthMoMPct,
          growthYoYPct: data.growthYoYPct,
          transactionCount: data.transactionCount,
          avgTicketSize: data.avgTicketSize,
          digitalPaymentRatio: data.digitalPaymentRatio,
          telebirrVolume: data.telebirrVolume,
          cbeVolume: data.cbeVolume,
          cashVolume: data.cashVolume,
          dubeCollectedVolume: data.dubeCollectedVolume,
          dubeIssuedVolume: data.dubeIssuedVolume,
          debtRecoveryRatePct: data.debtRecoveryRatePct,
          branchMetricsJson: data.branchMetricsJson,
          isFinalized: data.isFinalized ?? existing.isFinalized,
          updatedAt: new Date(),
        })
        .where(eq(businessFinancialSnapshot.id, existing.id))
        .returning();

      return updated!;
    }

    const [created] = await db
      .insert(businessFinancialSnapshot)
      .values(data)
      .returning();

    return created!;
  },

  /**
   * Queries primary transaction tables (`sale` and `expense`) for period aggregation.
   */
  async findRawPeriodTransactions(
    businessId: string,
    startDate: Date,
    endDate: Date
  ) {
    const [salesList, expensesList, branchesList] = await Promise.all([
      db
        .select()
        .from(sale)
        .where(
          and(
            eq(sale.businessId, businessId),
            gte(sale.createdAt, startDate),
            lte(sale.createdAt, endDate)
          )
        ),
      db
        .select()
        .from(expense)
        .where(
          and(
            eq(expense.businessId, businessId),
            gte(expense.createdAt, startDate),
            lte(expense.createdAt, endDate)
          )
        ),
      db
        .select()
        .from(branch)
        .where(eq(branch.businessId, businessId)),
    ]);

    return {
      sales: salesList,
      expenses: expensesList,
      branches: branchesList,
    };
  },

  /**
   * Creates a new external share token for banks/funding agencies.
   */
  async createShareToken(data: NewFinancialShareToken): Promise<FinancialShareToken> {
    const [created] = await db
      .insert(financialShareToken)
      .values(data)
      .returning();

    return created!;
  },

  /**
   * Retrieves a share token by token string.
   */
  async findShareToken(token: string): Promise<FinancialShareToken | undefined> {
    const [result] = await db
      .select()
      .from(financialShareToken)
      .where(eq(financialShareToken.token, token))
      .limit(1);

    return result;
  },

  /**
   * Increments the access counter when a funder views the verification dossier.
   */
  async incrementTokenAccess(token: string): Promise<void> {
    await db
      .update(financialShareToken)
      .set({
        accessCount: sql`CAST(CAST(${financialShareToken.accessCount} AS INTEGER) + 1 AS TEXT)`,
        lastAccessedAt: new Date(),
      })
      .where(eq(financialShareToken.token, token));
  },

  /**
   * Deactivates or revokes a share token.
   */
  async revokeShareToken(token: string, userId: string): Promise<boolean> {
    const result = await db
      .update(financialShareToken)
      .set({ isActive: false })
      .where(
        and(
          eq(financialShareToken.token, token),
          eq(financialShareToken.createdById, userId)
        )
      )
      .returning();

    return result.length > 0;
  },

  /**
   * Retrieves business profile metadata and its branches.
   */
  async findBusinessWithBranches(businessId: string) {
    const [biz] = await db
      .select()
      .from(business)
      .where(eq(business.id, businessId))
      .limit(1);

    if (!biz) return null;

    const branchesList = await db
      .select()
      .from(branch)
      .where(eq(branch.businessId, businessId));

    return {
      business: biz,
      branches: branchesList,
    };
  },
};
