import type { Response } from "express";

export const apiResponse = (res: Response, statusCode: number, data: any) => {
  return res.status(statusCode).json({
    status: "success",
    data,
  });
};
