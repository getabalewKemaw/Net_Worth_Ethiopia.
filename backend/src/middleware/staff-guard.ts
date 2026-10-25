import type { Request, Response, NextFunction } from "express";
import * as staffRepo from "../repositories/staff.repository";
import { ForbiddenError } from "../helpers/errors";
import type { AuthenticatedRequest } from "../types";

/**
 * Middleware ensuring sales staff can only query or record data for their assigned branch.
 * If user is a staff member:
 *  - Rejects cross-branch tampering in params, query, or body with 403 Forbidden.
 *  - Transparently injects the assigned branchId, businessId, and staff attribution when absent.
 * If user is not staff (e.g. business owner), passes through without restriction.
 */
export const requireStaffBranchMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return next();
    }

    const assignment = await staffRepo.findActiveStaffAssignmentByUserId(
      authReq.user.id
    );

    if (assignment) {
      authReq.staffAssignment = assignment;

      // Validate URL params branchId
      if (
        req.params.branchId &&
        req.params.branchId !== assignment.branchId
      ) {
        throw new ForbiddenError(
          "Forbidden: Staff member cannot access records for another branch"
        );
      }

      // Validate Query string branchId
      if (
        req.query.branchId &&
        req.query.branchId !== assignment.branchId
      ) {
        throw new ForbiddenError(
          "Forbidden: Staff member cannot query records for another branch"
        );
      }

      // Validate Request Body branchId and businessId
      if (req.body && typeof req.body === "object") {
        if (
          req.body.branchId &&
          req.body.branchId !== assignment.branchId
        ) {
          throw new ForbiddenError(
            "Forbidden: Staff member cannot create or modify records for another branch"
          );
        }

        if (
          req.body.businessId &&
          req.body.businessId !== assignment.businessId
        ) {
          throw new ForbiddenError(
            "Forbidden: Staff member cannot create or modify records for another business"
          );
        }

        // Auto-inject assigned context into request body for creation/updates
        if (!req.body.branchId) {
          req.body.branchId = assignment.branchId;
        }
        if (!req.body.businessId) {
          req.body.businessId = assignment.businessId;
        }
        if (!req.body.recordedById) {
          req.body.recordedById = authReq.user.id;
        }
        if (!req.body.recordedByName) {
          req.body.recordedByName = authReq.user.name;
        }
      }

      // Auto-inject assigned branchId into GET queries if omitted
      if (req.method === "GET" && !req.query.branchId) {
        req.query.branchId = assignment.branchId;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware preventing staff members from accessing administrative owner-only endpoints.
 * Used on business health / credit score analytics and staff management routes.
 */
export const forbidStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return next();
    }

    const assignment = await staffRepo.findActiveStaffAssignmentByUserId(
      authReq.user.id
    );

    if (assignment) {
      throw new ForbiddenError(
        "Forbidden: Staff members cannot access owner administrative features"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
