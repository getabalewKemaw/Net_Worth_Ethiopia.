import * as businessRepo from "../repositories/business.repository";
import { NotFoundError, ForbiddenError } from "../helpers/errors";
import crypto from "crypto";
import type { Business, NewBusiness } from "../types";

export const createBusinessService = async (userId: string, data: Omit<NewBusiness, "id" | "userId">): Promise<Business> => {
  const newBusiness: NewBusiness = {
    id: crypto.randomUUID(),
    userId,
    ...data,
  } as NewBusiness;
  return await businessRepo.createBusiness(newBusiness);
};

export const getBusinessByIdService = async (businessId: string, userId: string): Promise<Business> => {
  const biz = await businessRepo.findBusinessById(businessId);
  if (!biz) {
    throw new NotFoundError("Business not found");
  }
  if (biz.userId !== userId) {
    throw new ForbiddenError("Unauthorized access to this business");
  }
  return biz;
};

export const getBusinessesByUserIdService = async (userId: string): Promise<Business[]> => {
  return await businessRepo.findBusinessesByUserId(userId);
};

export const updateBusinessService = async (businessId: string, userId: string, data: any): Promise<Business> => {
  await getBusinessByIdService(businessId, userId);
  return await businessRepo.updateBusiness(businessId, data);
};
