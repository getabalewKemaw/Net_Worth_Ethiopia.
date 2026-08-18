import type { Request, Response, NextFunction } from "express";
import * as branchService from "../service/branch.service";
import { createBranchSchema, updateBranchSchema } from "../validations/branch.validation";
import { ValidationError } from "../helpers/errors";
import { apiResponse } from "../helpers/response";
import type { AuthenticatedRequest } from "../types";

export const createBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const businessId = req.params.businessId as string;
    const parsed = createBranchSchema.safeParse(authReq.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid inputs", parsed.error.format());
    }
    const branch = await branchService.createBranchService(businessId, authReq.user.id, parsed.data);
    apiResponse(res, 201, branch);
  } catch (error) {
    next(error);
  }
};

export const getBranchesByBusinessId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const businessId = req.params.businessId as string;
    const branches = await branchService.getBranchesByBusinessIdService(businessId, authReq.user.id);
    apiResponse(res, 200, branches);
  } catch (error) {
    next(error);
  }
};

export const getBranchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const branch = await branchService.getBranchByIdService(id, authReq.user.id);
    apiResponse(res, 200, branch);
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const parsed = updateBranchSchema.safeParse(authReq.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid inputs", parsed.error.format());
    }
    const branch = await branchService.updateBranchService(id, authReq.user.id, parsed.data);
    apiResponse(res, 200, branch);
  } catch (error) {
    next(error);
  }
};
