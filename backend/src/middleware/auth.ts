import type { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth";
import { UnauthorizedError } from "../helpers/errors";
import type { AuthenticatedRequest } from "../types";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>)
    });
    
    if (!session) {
      throw new UnauthorizedError("Authentication required");
    }
    
    const authReq = req as AuthenticatedRequest;
    authReq.user = session.user as any;
    authReq.session = session.session;
    next();
  } catch (error) {
    next(error);
  }
};
