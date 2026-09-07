import type { Request, Response, NextFunction } from "express";
import * as salesService from "../service/sales.service";
import { createSaleSchema, updateSaleSchema } from "../validations/sales.validation";
import { ValidationError, BadRequestError } from "../helpers/errors";
import { apiResponse } from "../helpers/response";
import type { AuthenticatedRequest } from "../types";

export const createSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = createSaleSchema.safeParse(authReq.body);
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
    const businessId = (req.query.businessId || req.params.businessId) as string;
    if (!businessId) {
      throw new BadRequestError("businessId is required to list sales");
    }

    const branchId = req.query.branchId as string | undefined;
    const saleType = req.query.saleType as "instant" | "dube" | undefined;
    const status = req.query.status as "pending" | "settled" | "voided" | undefined;

    const salesList = await salesService.getSalesService(businessId, authReq.user.id, {
      branchId,
      saleType,
      status,
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
