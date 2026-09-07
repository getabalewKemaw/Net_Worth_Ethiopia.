import * as bidrRepo from "../repositories/bidr.repository";
import * as businessRepo from "../repositories/business.repository";
import * as branchRepo from "../repositories/branch.repository";
import { NotFoundError, ForbiddenError, BadRequestError } from "../helpers/errors";
import { resolveUserBusinessId } from "./sales.service";
import type { Sale, BidrFilters, DebtSummary, SettleBidrInput, UpdateBidrInput } from "../types";

export const getDebtsService = async (
  businessId: string,
  userId: string,
  filters?: BidrFilters | undefined
): Promise<Sale[]> => {
  const verifiedBusinessId = await resolveUserBusinessId(userId, businessId);

  if (filters?.branchId) {
    const br = await branchRepo.findBranchById(filters.branchId);
    if (!br || br.businessId !== verifiedBusinessId) {
      throw new BadRequestError("Branch does not belong to the specified business");
    }
  }

  return await bidrRepo.findDebtsByBusinessId(verifiedBusinessId, filters);
};

export const getDebtByIdService = async (
  id: string,
  userId: string
): Promise<Sale> => {
  const debt = await bidrRepo.findDebtById(id);
  if (!debt) {
    throw new NotFoundError("Debt record not found");
  }

  const biz = await businessRepo.findBusinessById(debt.businessId);
  if (!biz || biz.userId !== userId) {
    throw new ForbiddenError("Unauthorized: You do not have access to this debt record");
  }

  return debt;
};

export const getDebtSummaryService = async (
  businessId: string,
  userId: string,
  branchId?: string | undefined
): Promise<DebtSummary> => {
  const verifiedBusinessId = await resolveUserBusinessId(userId, businessId);

  if (branchId) {
    const br = await branchRepo.findBranchById(branchId);
    if (!br || br.businessId !== verifiedBusinessId) {
      throw new BadRequestError("Branch does not belong to the specified business");
    }
  }

  return await bidrRepo.getDebtSummary(verifiedBusinessId, branchId);
};

export const settleDebtService = async (
  id: string,
  userId: string,
  data?: SettleBidrInput | undefined
): Promise<Sale> => {
  const existing = await getDebtByIdService(id, userId);

  if (existing.status === "settled") {
    throw new BadRequestError("This debt is already settled");
  }
  if (existing.status === "voided") {
    throw new BadRequestError("Cannot settle a voided debt record");
  }

  return await bidrRepo.settleDebt(id, data);
};

export const updateDebtService = async (
  id: string,
  userId: string,
  data: UpdateBidrInput
): Promise<Sale> => {
  await getDebtByIdService(id, userId);
  return await bidrRepo.updateDebt(id, data);
};
