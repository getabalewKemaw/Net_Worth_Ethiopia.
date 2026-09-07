import type { Request, Response, NextFunction } from "express";
import * as bidrService from "../service/bidr.service";
import { settleBidrSchema, updateBidrSchema } from "../validations/bidr.validation";
import { ValidationError, BadRequestError } from "../helpers/errors";
import { apiResponse } from "../helpers/response";
import type { AuthenticatedRequest, SaleStatus } from "../types";

export const getDebts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const businessId = (req.query.businessId || req.headers["x-business-id"] || req.params.businessId) as string | undefined;

    const branchId = (req.query.branchId || req.headers["x-branch-id"]) as string | undefined;
    const status = req.query.status as SaleStatus | undefined;
    const isOverdue =
      req.query.isOverdue === "true"
        ? true
        : req.query.isOverdue === "false"
        ? false
        : undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const limit = req.query.limit ? Math.min(Math.max(1, parseInt(req.query.limit as string, 10) || 50), 100) : undefined;
    const offset = req.query.offset ? Math.max(0, parseInt(req.query.offset as string, 10) || 0) : undefined;

    const debts = await bidrService.getDebtsService(businessId || "", authReq.user.id, {
      branchId,
      status,
      isOverdue,
      startDate,
      endDate,
      limit,
      offset,
    });
    apiResponse(res, 200, debts);
  } catch (error) {
    next(error);
  }
};

export const getDebtSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const businessId = (req.query.businessId || req.headers["x-business-id"] || req.params.businessId) as string | undefined;

    const branchId = (req.query.branchId || req.headers["x-branch-id"]) as string | undefined;
    const summary = await bidrService.getDebtSummaryService(
      businessId || "",
      authReq.user.id,
      branchId
    );
    apiResponse(res, 200, summary);
  } catch (error) {
    next(error);
  }
};

export const getDebtById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const debt = await bidrService.getDebtByIdService(id, authReq.user.id);
    apiResponse(res, 200, debt);
  } catch (error) {
    next(error);
  }
};

export const settleDebt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const parsed = settleBidrSchema.safeParse(authReq.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid inputs", parsed.error.format());
    }
    const settled = await bidrService.settleDebtService(id, authReq.user.id, parsed.data);
    apiResponse(res, 200, settled);
  } catch (error) {
    next(error);
  }
};

export const updateDebt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const parsed = updateBidrSchema.safeParse(authReq.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid inputs", parsed.error.format());
    }
    const updated = await bidrService.updateDebtService(id, authReq.user.id, parsed.data);
    apiResponse(res, 200, updated);
  } catch (error) {
    next(error);
  }
};
