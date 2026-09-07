import crypto from "crypto";
import * as salesRepo from "../repositories/sales.repository";
import * as businessRepo from "../repositories/business.repository";
import * as branchRepo from "../repositories/branch.repository";
import { NotFoundError, ForbiddenError, BadRequestError } from "../helpers/errors";
import type { Sale, NewSale, CreateSaleInput, UpdateSaleInput } from "../types";

export const createSaleService = async (
  userId: string,
  data: CreateSaleInput
): Promise<Sale> => {
  const biz = await businessRepo.findBusinessById(data.businessId);
  if (!biz) {
    throw new NotFoundError("Business not found");
  }
  if (biz.userId !== userId) {
    throw new ForbiddenError("Unauthorized: You do not own this business");
  }

  const br = await branchRepo.findBranchById(data.branchId);
  if (!br) {
    throw new NotFoundError("Branch not found");
  }
  if (br.businessId !== data.businessId) {
    throw new BadRequestError("Branch does not belong to the specified business");
  }

  const isInstant = data.saleType === "instant";
  const status = data.status || (isInstant ? "settled" : "pending");
  const paidAt = status === "settled" ? new Date() : null;

  const newSale: NewSale = {
    id: crypto.randomUUID(),
    businessId: data.businessId,
    branchId: data.branchId,
    saleType: data.saleType,
    paymentMethod: data.paymentMethod,
    description: data.description,
    amount: data.amount,
    customerName: data.customerName ?? null,
    customerPhone: data.customerPhone ?? null,
    dueDate: data.dueDate ?? null,
    notes: data.notes ?? null,
    status,
    paidAt,
  };

  return await salesRepo.createSale(newSale);
};

export const getSaleByIdService = async (
  saleId: string,
  userId: string
): Promise<Sale> => {
  const saleItem = await salesRepo.findSaleById(saleId);
  if (!saleItem) {
    throw new NotFoundError("Sale not found");
  }

  const biz = await businessRepo.findBusinessById(saleItem.businessId);
  if (!biz || biz.userId !== userId) {
    throw new ForbiddenError("Unauthorized: You do not have access to this sale");
  }

  return saleItem;
};

export const resolveUserBusinessId = async (
  userId: string,
  requestedBusinessId?: string
): Promise<string> => {
  if (requestedBusinessId) {
    const biz = await businessRepo.findBusinessById(requestedBusinessId);
    if (!biz) {
      throw new NotFoundError("Business not found");
    }
    if (biz.userId !== userId) {
      throw new ForbiddenError("Unauthorized: You do not own this business");
    }
    return biz.id;
  }
  const businesses = await businessRepo.findBusinessesByUserId(userId);
  if (!businesses || businesses.length === 0) {
    throw new NotFoundError("No registered business found for this merchant. Please register a business first.");
  }
  return businesses[0]!.id;
};

export const getSalesService = async (
  businessId: string,
  userId: string,
  filters?: salesRepo.SaleFilters | undefined
): Promise<Sale[]> => {
  const verifiedBusinessId = await resolveUserBusinessId(userId, businessId);

  if (filters?.branchId) {
    const br = await branchRepo.findBranchById(filters.branchId);
    if (!br || br.businessId !== verifiedBusinessId) {
      throw new BadRequestError("Branch does not belong to the specified business");
    }
  }

  return await salesRepo.findSalesByBusinessId(verifiedBusinessId, filters);
};

export const updateSaleService = async (
  saleId: string,
  userId: string,
  data: UpdateSaleInput
): Promise<Sale> => {
  const existingSale = await getSaleByIdService(saleId, userId);

  if (data.businessId && data.businessId !== existingSale.businessId) {
    throw new ForbiddenError("Cannot reassign a sale to a different business");
  }

  if (data.branchId && data.branchId !== existingSale.branchId) {
    const br = await branchRepo.findBranchById(data.branchId);
    if (!br || br.businessId !== existingSale.businessId) {
      throw new BadRequestError("Branch does not belong to the parent business");
    }
  }

  const updateData: UpdateSaleInput & { paidAt?: Date | null | undefined } = { ...data };
  delete updateData.businessId;

  if (data.status === "settled" && existingSale.status !== "settled") {
    updateData.paidAt = new Date();
  } else if (data.status === "pending" || data.status === "voided") {
    updateData.paidAt = null;
  }

  return await salesRepo.updateSale(saleId, updateData);
};

export const deleteSaleService = async (
  saleId: string,
  userId: string
): Promise<Sale> => {
  await getSaleByIdService(saleId, userId);
  const deleted = await salesRepo.deleteSale(saleId);
  if (!deleted) {
    throw new NotFoundError("Sale not found");
  }
  return deleted;
};
