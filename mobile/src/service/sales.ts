import { authClient, baseURL } from "@/lib/auth-client";
import type { PaymentMethod, SaleStatus, SaleType } from "@/types/sales";

export interface CreateSalePayload {
  businessId: string;
  branchId: string;
  saleType: SaleType;
  paymentMethod: PaymentMethod;
  description: string;
  amount: number;
  customerName?: string | null;
  customerPhone?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  status?: SaleStatus;
}

export interface FetchSalesParams {
  businessId?: string;
  branchId?: string;
  saleType?: SaleType;
  status?: SaleStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const createSale = async (input: CreateSalePayload) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/sales`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });

  if (error) throw new Error(error.message || "Failed to record sale");

  const json = data as any;
  if (json?.status === "error") throw new Error(json.message || "Server error");
  return json?.data ?? json;
};

export const fetchSales = async (params?: FetchSalesParams) => {
  const query = new URLSearchParams();
  if (params?.businessId) query.append("businessId", params.businessId);
  if (params?.branchId) query.append("branchId", params.branchId);
  if (params?.saleType) query.append("saleType", params.saleType);
  if (params?.status) query.append("status", params.status);
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);
  if (params?.limit !== undefined) query.append("limit", params.limit.toString());
  if (params?.offset !== undefined) query.append("offset", params.offset.toString());

  const queryString = query.toString();
  const url = queryString ? `${baseURL}/api/sales?${queryString}` : `${baseURL}/api/sales`;

  const { data, error } = await authClient.$fetch(url);

  if (error) throw new Error(error.message || "Failed to fetch sales");

  const json = data as any;
  if (json?.status === "error") throw new Error(json.message || "Server error");
  return (json?.data ?? json) as any[];
};

export const fetchSaleById = async (id: string) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/sales/${id}`);

  if (error) throw new Error(error.message || "Failed to fetch sale details");

  const json = data as any;
  if (json?.status === "error") throw new Error(json.message || "Server error");
  return json?.data ?? json;
};

export const updateSale = async (id: string, input: Partial<CreateSalePayload>) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/sales/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });

  if (error) throw new Error(error.message || "Failed to update sale");

  const json = data as any;
  if (json?.status === "error") throw new Error(json.message || "Server error");
  return json?.data ?? json;
};

export const deleteSale = async (id: string) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/sales/${id}`, {
    method: "DELETE",
  });

  if (error) throw new Error(error.message || "Failed to delete sale");

  const json = data as any;
  if (json?.status === "error") throw new Error(json.message || "Server error");
  return json?.data ?? json;
};
