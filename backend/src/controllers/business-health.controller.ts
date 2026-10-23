import type { Request, Response, NextFunction } from "express";
import { businessHealthService } from "../service/business-health.service";
import { businessHealthRepo } from "../repositories/business-health.repository";
import { BadRequestError } from "../helpers/errors";
import { apiResponse } from "../helpers/response";
import type { AuthenticatedRequest } from "../types";

export const businessHealthController = {
  /**
   * Handles GET /api/health/snapshots
   */
  async getSnapshots(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId =
        (req.query.businessId as string) || (req.headers["x-business-id"] as string);

      if (!businessId) {
        throw new BadRequestError("businessId query parameter is required");
      }

      const branchId = req.query.branchId as string | undefined;
      const periodType = (req.query.periodType as "monthly" | "yearly") || "monthly";
      const limit = req.query.limit ? Number(req.query.limit) : 12;

      const result = await businessHealthService.getHistoricalSnapshots({
        businessId,
        branchId,
        periodType,
        limit,
      });

      apiResponse(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handles POST /api/health/snapshots/recompute
   */
  async recomputeSnapshot(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId =
        req.body?.businessId || (req.headers["x-business-id"] as string);

      if (!businessId) {
        throw new BadRequestError("businessId is required in request body");
      }

      const branchId = req.body?.branchId as string | undefined;
      const snapshot = await businessHealthService.recomputePeriodSnapshot(
        businessId,
        branchId,
        new Date(),
        false
      );

      apiResponse(res, 200, snapshot);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handles POST /api/health/share-token
   */
  async createShareToken(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const businessId =
        req.body?.businessId || (req.headers["x-business-id"] as string);

      if (!businessId) {
        throw new BadRequestError("businessId is required to generate a share token");
      }

      const purpose = req.body?.purpose || "bank_loan";
      const funderName = req.body?.funderName;
      const funderNote = req.body?.funderNote;
      const validityDays = req.body?.validityDays ? Number(req.body.validityDays) : 30;

      const webUrl = process.env.WEB_URL || "http://localhost:3001";

      const tokenResult = await businessHealthService.generateShareToken(
        businessId,
        authReq.user.id,
        {
          businessId,
          purpose,
          funderName,
          funderNote,
          validityDays,
        },
        webUrl
      );

      apiResponse(res, 201, tokenResult);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handles GET /api/health/verify/:token (Public / Read-only for loan officers)
   */
  async verifyTokenDossier(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenParam = req.params.token;
      const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
      if (!token) {
        throw new BadRequestError("Verification token is required in the path");
      }

      const dossier = await businessHealthService.getVerifiedFunderDossier(token);
      apiResponse(res, 200, dossier);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handles DELETE /api/health/share-token/:token
   */
  async revokeShareToken(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const tokenParam = req.params.token;
      const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

      if (!token) {
        throw new BadRequestError("Token is required to revoke");
      }

      const revoked = await businessHealthRepo.revokeShareToken(token, authReq.user.id);
      if (!revoked) {
        throw new BadRequestError("Token not found or already deactivated");
      }

      apiResponse(res, 200, { revoked: true, message: "Share link successfully revoked" });
    } catch (error) {
      next(error);
    }
  },
};
