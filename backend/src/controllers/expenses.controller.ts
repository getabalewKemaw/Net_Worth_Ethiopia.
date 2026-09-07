import type { Request, Response, NextFunction } from "express";
import * as expensesService from "../service/expenses.service";
import { createExpenseSchema, updateExpenseSchema } from "../validations/sales.validation";
import { ValidationError, BadRequestError } from "../helpers/errors";
import { apiResponse } from "../helpers/response";
import type { AuthenticatedRequest } from "../types";

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const body = {
      ...req.body,
      businessId: req.body?.businessId || (req.headers["x-business-id"] as string | undefined),
      branchId: req.body?.branchId || (req.headers["x-branch-id"] as string | undefined),
    };

    const parsed = createExpenseSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid inputs", parsed.error.format());
    }
    const expenseItem = await expensesService.createExpenseService(authReq.user.id, parsed.data);
    apiResponse(res, 201, expenseItem);
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const businessId = (req.query.businessId || req.headers["x-business-id"] || req.params.businessId) as string | undefined;

    const branchId = (req.query.branchId || req.headers["x-branch-id"]) as string | undefined;
    const category = req.query.category as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const limit = req.query.limit ? Math.min(Math.max(1, parseInt(req.query.limit as string, 10) || 50), 100) : undefined;
    const offset = req.query.offset ? Math.max(0, parseInt(req.query.offset as string, 10) || 0) : undefined;

    const expensesList = await expensesService.getExpensesService(businessId || "", authReq.user.id, {
      branchId,
      category,
      startDate,
      endDate,
      limit,
      offset,
    });
    apiResponse(res, 200, expensesList);
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const expenseItem = await expensesService.getExpenseByIdService(id, authReq.user.id);
    apiResponse(res, 200, expenseItem);
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const parsed = updateExpenseSchema.safeParse(authReq.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid inputs", parsed.error.format());
    }
    const updated = await expensesService.updateExpenseService(id, authReq.user.id, parsed.data);
    apiResponse(res, 200, updated);
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const deleted = await expensesService.deleteExpenseService(id, authReq.user.id);
    apiResponse(res, 200, deleted);
  } catch (error) {
    next(error);
  }
};
