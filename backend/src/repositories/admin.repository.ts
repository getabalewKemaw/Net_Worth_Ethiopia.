import { db } from "../config/db";
import { user } from "../db/schema";
import { business, branch } from "../db/business-branch-management";
import { financialShareToken, businessFinancialSnapshot } from "../db/business-health";
import { sale, expense } from "../db/sales-expense-management";
import { desc, eq } from "drizzle-orm";

export const adminRepository = {
  /**
   * Fetches all registered users ordered by registration date.
   */
  async findAllUsers() {
    return await db.select().from(user).orderBy(desc(user.createdAt));
  },

  /**
   * Fetches all registered businesses.
   */
  async findAllBusinesses() {
    return await db.select().from(business);
  },

  /**
   * Fetches all branches across all businesses.
   */
  async findAllBranches() {
    return await db.select().from(branch);
  },

  /**
   * Fetches all financial share tokens.
   */
  async findAllShareTokens() {
    return await db.select().from(financialShareToken);
  },

  /**
   * Fetches all historical financial snapshots for ecosystem aggregation.
   */
  async findAllSnapshots() {
    return await db.select().from(businessFinancialSnapshot);
  },

  /**
   * Fetches all live sales transactions.
   */
  async findAllSales() {
    return await db.select().from(sale).orderBy(desc(sale.createdAt));
  },

  /**
   * Fetches all recorded expenses.
   */
  async findAllExpenses() {
    return await db.select().from(expense).orderBy(desc(expense.createdAt));
  },
};

