import { authClient, baseURL } from '@/lib/auth-client';
import type {
  DebtItem,
  DebtSummaryData,
  FetchDebtsParams,
  SettleDebtPayload,
  UpdateDebtPayload,
} from '@/types/bidr';

export const fetchDebts = async (params?: FetchDebtsParams): Promise<DebtItem[]> => {
  const query = new URLSearchParams();
  if (params?.businessId) query.append('businessId', params.businessId);
  if (params?.branchId) query.append('branchId', params.branchId);
  if (params?.status) query.append('status', params.status);
  if (params?.isOverdue !== undefined) query.append('isOverdue', params.isOverdue.toString());
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  if (params?.limit !== undefined) query.append('limit', params.limit.toString());
  if (params?.offset !== undefined) query.append('offset', params.offset.toString());

  const queryString = query.toString();
  const url = queryString ? `${baseURL}/api/bidr?${queryString}` : `${baseURL}/api/bidr`;

  const { data, error } = await authClient.$fetch(url);
  if (error) throw new Error(error.message || 'Failed to fetch customer debts');

  const json = data as any;
  if (json?.status === 'error') throw new Error(json.message || 'Server error');
  return (json?.data ?? json) as DebtItem[];
};

export const fetchDebtSummary = async (
  businessId?: string,
  branchId?: string
): Promise<DebtSummaryData> => {
  const query = new URLSearchParams();
  if (businessId) query.append('businessId', businessId);
  if (branchId) query.append('branchId', branchId);

  const queryString = query.toString();
  const url = queryString ? `${baseURL}/api/bidr/summary?${queryString}` : `${baseURL}/api/bidr/summary`;

  const { data, error } = await authClient.$fetch(url);
  if (error) throw new Error(error.message || 'Failed to fetch debt summary');

  const json = data as any;
  if (json?.status === 'error') throw new Error(json.message || 'Server error');
  return (json?.data ?? json) as DebtSummaryData;
};

export const fetchDebtById = async (id: string): Promise<DebtItem> => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/bidr/${id}`);
  if (error) throw new Error(error.message || 'Failed to fetch debt details');

  const json = data as any;
  if (json?.status === 'error') throw new Error(json.message || 'Server error');
  return (json?.data ?? json) as DebtItem;
};

export const settleDebt = async (
  id: string,
  payload?: SettleDebtPayload
): Promise<DebtItem> => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/bidr/${id}/settle`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
    headers: { 'Content-Type': 'application/json' },
  });

  if (error) throw new Error(error.message || 'Failed to settle debt record');

  const json = data as any;
  if (json?.status === 'error') throw new Error(json.message || 'Server error');
  return (json?.data ?? json) as DebtItem;
};

export const updateDebt = async (
  id: string,
  payload: UpdateDebtPayload
): Promise<DebtItem> => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/bidr/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });

  if (error) throw new Error(error.message || 'Failed to update debt record');

  const json = data as any;
  if (json?.status === 'error') throw new Error(json.message || 'Server error');
  return (json?.data ?? json) as DebtItem;
};
