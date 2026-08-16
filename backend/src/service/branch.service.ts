import * as branchRepo from "../repositories/branch.repository";
import * as businessRepo from "../repositories/business.repository";
import { NotFoundError, ForbiddenError } from "../helpers/errors";
import crypto from "crypto";
import type { Branch, NewBranch } from "../types";

const generateBranchCode = (): string => {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BR-${randomSuffix}`;
};

export const createBranchService = async (businessId: string, userId: string, data: Omit<NewBranch, "id" | "businessId" | "branchCode">): Promise<Branch> => {
  const biz = await businessRepo.findBusinessById(businessId);
  if (!biz) {
    throw new NotFoundError("Business not found");
  }
  if (biz.userId !== userId) {
    throw new ForbiddenError("Unauthorized: You do not own this business");
  }

  const branchCode = generateBranchCode();
  const newBranch: NewBranch = {
    id: crypto.randomUUID(),
    businessId,
    branchCode,
    ...data,
  } as NewBranch;

  return await branchRepo.createBranch(newBranch);
};

export const getBranchesByBusinessIdService = async (businessId: string, userId: string): Promise<Branch[]> => {
  const biz = await businessRepo.findBusinessById(businessId);
  if (!biz) {
    throw new NotFoundError("Business not found");
  }
  if (biz.userId !== userId) {
    throw new ForbiddenError("Unauthorized: You do not own this business");
  }

  return await branchRepo.findBranchesByBusinessId(businessId);
};

export const getBranchByIdService = async (branchId: string, userId: string): Promise<Branch> => {
  const branch = await branchRepo.findBranchById(branchId);
  if (!branch) {
    throw new NotFoundError("Branch not found");
  }

  const biz = await businessRepo.findBusinessById(branch.businessId);
  if (!biz || biz.userId !== userId) {
    throw new ForbiddenError("Unauthorized: You do not have access to this branch");
  }

  return branch;
};

export const updateBranchService = async (branchId: string, userId: string, data: any): Promise<Branch> => {
  await getBranchByIdService(branchId, userId);
  return await branchRepo.updateBranch(branchId, data);
};
