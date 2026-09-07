import crypto from "crypto";
import * as expensesRepo from "../repositories/expenses.repository";
import * as businessRepo from "../repositories/business.repository";
import * as branchRepo from "../repositories/branch.repository";
import { NotFoundError, ForbiddenError, BadRequestError } from "../helpers/errors";
import type { Expense, NewExpense, CreateExpenseInput, UpdateExpenseInput } from "../types";

export const createExpenseService = async (
  userId: string,
  data: CreateExpenseInput
): Promise<Expense> => {
  const biz = await businessRepo.findBusinessById(data.businessId);
  if (!biz) {
    throw new NotFoundError("Business not found");
  }
  if (biz.userId !== userId) {
    throw new ForbiddenError("Unauthorized: You do not own this business");
  }

  const br = await branchRepo.findBranchById(data.branchId);
  if (!br) {
    throw new NotFoundError("Branch not found");
  }
  if (br.businessId !== data.businessId) {
    throw new BadRequestError("Branch does not belong to the specified business");
  }

  const newExpense: NewExpense = {
    id: crypto.randomUUID(),
    businessId: data.businessId,
    branchId: data.branchId,
    description: data.description,
    amount: data.amount,
    category: data.category,
    notes: data.notes ?? null,
  };

  return await expensesRepo.createExpense(newExpense);
};

export const getExpenseByIdService = async (
  expenseId: string,
  userId: string
): Promise<Expense> => {
  const expenseItem = await expensesRepo.findExpenseById(expenseId);
  if (!expenseItem) {
    throw new NotFoundError("Expense not found");
  }

  const biz = await businessRepo.findBusinessById(expenseItem.businessId);
  if (!biz || biz.userId !== userId) {
    throw new ForbiddenError("Unauthorized: You do not have access to this expense");
  }

  return expenseItem;
};

export const getExpensesService = async (
  businessId: string,
  userId: string,
  filters?: expensesRepo.ExpenseFilters | undefined
): Promise<Expense[]> => {
  const biz = await businessRepo.findBusinessById(businessId);
  if (!biz) {
    throw new NotFoundError("Business not found");
  }
  if (biz.userId !== userId) {
    throw new ForbiddenError("Unauthorized: You do not own this business");
  }

  if (filters?.branchId) {
    const br = await branchRepo.findBranchById(filters.branchId);
    if (!br || br.businessId !== businessId) {
      throw new BadRequestError("Branch does not belong to the specified business");
    }
  }

  return await expensesRepo.findExpensesByBusinessId(businessId, filters);
};

export const updateExpenseService = async (
  expenseId: string,
  userId: string,
  data: UpdateExpenseInput
): Promise<Expense> => {
  await getExpenseByIdService(expenseId, userId);
  return await expensesRepo.updateExpense(expenseId, data);
};

export const deleteExpenseService = async (
  expenseId: string,
  userId: string
): Promise<Expense> => {
  await getExpenseByIdService(expenseId, userId);
  const deleted = await expensesRepo.deleteExpense(expenseId);
  if (!deleted) {
    throw new NotFoundError("Expense not found");
  }
  return deleted;
};
