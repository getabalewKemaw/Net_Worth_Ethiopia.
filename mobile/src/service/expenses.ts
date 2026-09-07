import { authClient, baseURL } from "@/lib/auth-client";

export interface CreateExpensePayload {
  businessId: string;
  branchId: string;
  description: string;
  amount: number;
  category: string;
  notes?: string | null;
}

export interface FetchExpensesParams {
  businessId?: string;
  branchId?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const createExpense = async (input: CreateExpensePayload) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/expenses`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });

  if (error) throw new Error(error.message || "Failed to record expense");

  const json = data as any;
  if (json?.status === "error") throw new Error(json.message || "Server error");
  return json?.data ?? json;
};

export const fetchExpenses = async (params?: FetchExpensesParams) => {
  const query = new URLSearchParams();
  if (params?.businessId) query.append("businessId", params.businessId);
  if (params?.branchId) query.append("branchId", params.branchId);
  if (params?.category) query.append("category", params.category);
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);
  if (params?.limit !== undefined) query.append("limit", params.limit.toString());
  if (params?.offset !== undefined) query.append("offset", params.offset.toString());

  const queryString = query.toString();
  const url = queryString ? `${baseURL}/api/expenses?${queryString}` : `${baseURL}/api/expenses`;

  const { data, error } = await authClient.$fetch(url);

  if (error) throw new Error(error.message || "Failed to fetch expenses");

  const json = data as any;
  if (json?.status === "error") throw new Error(json.message || "Server error");
  return (json?.data ?? json) as any[];
};

export const fetchExpenseById = async (id: string) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/expenses/${id}`);

  if (error) throw new Error(error.message || "Failed to fetch expense details");

  const json = data as any;
  if (json?.status === "error") throw new Error(json.message || "Server error");
  return json?.data ?? json;
};

export const updateExpense = async (id: string, input: Partial<CreateExpensePayload>) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/expenses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });

  if (error) throw new Error(error.message || "Failed to update expense");

  const json = data as any;
  if (json?.status === "error") throw new Error(json.message || "Server error");
  return json?.data ?? json;
};

export const deleteExpense = async (id: string) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/expenses/${id}`, {
    method: "DELETE",
  });

  if (error) throw new Error(error.message || "Failed to delete expense");

  const json = data as any;
  if (json?.status === "error") throw new Error(json.message || "Server error");
  return json?.data ?? json;
};
