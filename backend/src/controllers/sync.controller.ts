import type { Request, Response, NextFunction } from "express";
import { syncService } from "../service/sync.service";
import { SyncPushRequestSchema, SyncPullQuerySchema } from "../types/sync";
import { ValidationError, BadRequestError } from "../helpers/errors";
import { apiResponse } from "../helpers/response";
import type { AuthenticatedRequest } from "../types";

export const syncController = {
  /**
   * Handles POST /api/sync/push
   */
  async pushMutations(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const businessId =
        req.body?.businessId || (req.headers["x-business-id"] as string | undefined);

      const parsed = SyncPushRequestSchema.safeParse({
        ...req.body,
        businessId,
      });

      if (!parsed.success) {
        throw new ValidationError("Invalid sync push payload", parsed.error.format());
      }

      const result = await syncService.processPushBatch(authReq.user.id, parsed.data);
      apiResponse(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handles GET /api/sync/pull
   */
  async pullChanges(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const businessId = (req.query.businessId || req.headers["x-business-id"]) as string | undefined;

      if (!businessId) {
        throw new BadRequestError("businessId is required for pull sync");
      }

      const parsed = SyncPullQuerySchema.safeParse({
        businessId,
        since: req.query.since as string | undefined,
      });

      if (!parsed.success) {
        throw new ValidationError("Invalid sync pull query", parsed.error.format());
      }

      const result = await syncService.pullDeltaChanges(
        authReq.user.id,
        parsed.data.businessId,
        parsed.data.since
      );

      apiResponse(res, 200, result);
    } catch (error) {
      next(error);
    }
  },
};
