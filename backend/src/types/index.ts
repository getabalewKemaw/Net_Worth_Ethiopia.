import type { Request } from "express";
import { business, branch } from "../db/schema";
import { expense, sale } from "../db/sales-expense-management";
export * from "./sales";

export type Business = typeof business.$inferSelect;
export type NewBusiness = typeof business.$inferInsert;

export type Branch = typeof branch.$inferSelect;
export type NewBranch = typeof branch.$inferInsert;

export type Sale = typeof sale.$inferSelect;
export type NewSale = typeof sale.$inferInsert;

export type Expense = typeof expense.$inferSelect;
export type NewExpense = typeof expense.$inferInsert;

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  session?: any;
}
