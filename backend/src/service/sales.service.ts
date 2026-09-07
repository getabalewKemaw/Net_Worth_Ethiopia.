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

export const getSalesService = async (
  businessId: string,
  userId: string,
  filters?: salesRepo.SaleFilters | undefined
): Promise<Sale[]> => {
  const biz = await businessRepo.findBusinessById(businessId);
  if (!biz) {
    throw new NotFoundError("Business not found");
  }
  if (biz.userId !== userId) {
    throw new ForbiddenError("Unauthorized: You do not own this business");
  }

  if (filters?.branchId) {
    const br = await branchRepo.findBranchById(filters.branchId);
    if (!br || br.businessId !== businessId) {
      throw new BadRequestError("Branch does not belong to the specified business");
    }
  }

  return await salesRepo.findSalesByBusinessId(businessId, filters);
};

export const updateSaleService = async (
  saleId: string,
  userId: string,
  data: UpdateSaleInput
): Promise<Sale> => {
  const existingSale = await getSaleByIdService(saleId, userId);

  const updateData: UpdateSaleInput & { paidAt?: Date | null | undefined } = { ...data };

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
