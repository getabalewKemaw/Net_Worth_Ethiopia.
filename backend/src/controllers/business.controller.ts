import type { Request, Response, NextFunction } from "express";
import * as businessService from "../service/business.service";
import { createBusinessSchema, updateBusinessSchema } from "../validations/business.validation";
import { ValidationError } from "../helpers/errors";
import { apiResponse } from "../helpers/response";
import type { AuthenticatedRequest } from "../types";

export const createBusiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = createBusinessSchema.safeParse(authReq.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid inputs", parsed.error.format());
    }
    const biz = await businessService.createBusinessService(authReq.user.id, parsed.data);
    apiResponse(res, 201, biz);
  } catch (error) {
    next(error);
  }
};

export const getAllBusinesses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const businesses = await businessService.getBusinessesByUserIdService(authReq.user.id);
    apiResponse(res, 200, businesses);
  } catch (error) {
    next(error);
  }
};

export const getBusinessById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const biz = await businessService.getBusinessByIdService(id, authReq.user.id);
    apiResponse(res, 200, biz);
  } catch (error) {
    next(error);
  }
};

export const updateBusiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const parsed = updateBusinessSchema.safeParse(authReq.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid inputs", parsed.error.format());
    }
    const biz = await businessService.updateBusinessService(id, authReq.user.id, parsed.data);
    apiResponse(res, 200, biz);
  } catch (error) {
    next(error);
  }
};
