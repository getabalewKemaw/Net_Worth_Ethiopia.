import type { Request, Response, NextFunction } from "express";
import * as salesService from "../service/sales.service";
import { createSaleSchema, updateSaleSchema } from "../validations/sales.validation";
import { ValidationError, BadRequestError } from "../helpers/errors";
import { apiResponse } from "../helpers/response";
import type { AuthenticatedRequest, PaymentMethod, SaleStatus, SaleType } from "../types";

export const createSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const body = {
      ...req.body,
      businessId: req.body?.businessId || (req.headers["x-business-id"] as string | undefined),
      branchId: req.body?.branchId || (req.headers["x-branch-id"] as string | undefined),
    };

    const parsed = createSaleSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid inputs", parsed.error.format());
    }
    const saleItem = await salesService.createSaleService(authReq.user.id, parsed.data);
    apiResponse(res, 201, saleItem);
  } catch (error) {
    next(error);
  }
};

export const getSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const businessId = (req.query.businessId || req.headers["x-business-id"] || req.params.businessId) as string | undefined;

    const branchId = (req.query.branchId || req.headers["x-branch-id"]) as string | undefined;
    const saleType = req.query.saleType as SaleType | undefined;
    const paymentMethod = req.query.paymentMethod as PaymentMethod | undefined;
    const status = req.query.status as SaleStatus | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const limit = req.query.limit ? Math.min(Math.max(1, parseInt(req.query.limit as string, 10) || 50), 100) : undefined;
    const offset = req.query.offset ? Math.max(0, parseInt(req.query.offset as string, 10) || 0) : undefined;

    const salesList = await salesService.getSalesService(businessId || "", authReq.user.id, {
      branchId,
      saleType,
      paymentMethod,
      status,
      startDate,
      endDate,
      limit,
      offset,
    });
    apiResponse(res, 200, salesList);
  } catch (error) {
    next(error);
  }
};

export const getSaleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const saleItem = await salesService.getSaleByIdService(id, authReq.user.id);
    apiResponse(res, 200, saleItem);
  } catch (error) {
    next(error);
  }
};

export const updateSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const parsed = updateSaleSchema.safeParse(authReq.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid inputs", parsed.error.format());
    }
    const updated = await salesService.updateSaleService(id, authReq.user.id, parsed.data);
    apiResponse(res, 200, updated);
  } catch (error) {
    next(error);
  }
};

export const deleteSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const deleted = await salesService.deleteSaleService(id, authReq.user.id);
    apiResponse(res, 200, deleted);
  } catch (error) {
    next(error);
  }
};
