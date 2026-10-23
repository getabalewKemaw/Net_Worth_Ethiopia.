import type { Request, Response, NextFunction } from "express";
import { adminService } from "../service/admin.service";
import { apiResponse } from "../helpers/response";
import { BadRequestError } from "../helpers/errors";

export const adminController = {
  /**
   * POST /api/admin/login
   * Authenticates the platform Superadmin.
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        throw new BadRequestError("Email and password are required");
      }

      const result = await adminService.authenticateAdmin(email, password);
      apiResponse(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/users
   * Lists all registered business owners (merchants).
   */
  async getBusinessOwners(req: Request, res: Response, next: NextFunction) {
    try {
      const owners = await adminService.listBusinessOwners();
      apiResponse(res, 200, owners);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/stats
   * Retrieves high-level ecosystem statistics for the central admin dashboard.
   */
  async getPlatformStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getPlatformStatistics();
      apiResponse(res, 200, stats);
    } catch (error) {
      next(error);
    }
  },
};
