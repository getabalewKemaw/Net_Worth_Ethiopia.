import type { Request, Response, NextFunction } from "express";
import { AppError } from "../helpers/errors";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
