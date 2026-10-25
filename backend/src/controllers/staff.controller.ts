import type { Request, Response, NextFunction } from "express";
import * as staffService from "../service/staff.service";
import {
  assignStaffSchema,
  dailyDigestQuerySchema,
} from "../validations/staff.validation";
import { ValidationError } from "../helpers/errors";
import { apiResponse } from "../helpers/response";
import type { AuthenticatedRequest } from "../types";

export const assignStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const branchId = req.params.branchId as string;

    const parsed = assignStaffSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid staff assignment inputs", parsed.error.format());
    }

    const assignment = await staffService.assignStaffService(
      authReq.user.id,
      branchId,
      parsed.data
    );

    apiResponse(res, 201, assignment);
  } catch (error) {
    next(error);
  }
};

export const getBranchStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const branchId = req.params.branchId as string;

    const staffList = await staffService.getBranchStaffService(
      authReq.user.id,
      branchId
    );

    apiResponse(res, 200, staffList);
  } catch (error) {
    next(error);
  }
};

export const revokeStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const branchId = req.params.branchId as string;
    const assignmentId = req.params.assignmentId as string;

    const result = await staffService.revokeStaffService(
      authReq.user.id,
      branchId,
      assignmentId
    );

    apiResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const getStaffProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const profile = await staffService.getStaffProfileService(
      authReq.user.id,
      authReq.user.email
    );

    apiResponse(res, 200, profile);
  } catch (error) {
    next(error);
  }
};

export const getDailyDigest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const parsed = dailyDigestQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError("Invalid daily digest query parameters", parsed.error.format());
    }

    const digest = await staffService.getDailyDigestService(
      authReq.user.id,
      parsed.data.businessId,
      parsed.data.date
    );

    apiResponse(res, 200, digest);
  } catch (error) {
    next(error);
  }
};
