import { useEffect, useCallback, useMemo } from 'react';
import { useBusinessStore } from '@/store/business-store';
import { useBidrStore } from '@/store/bidr-store';
import { SEVEN_DAYS_MS } from '@/constants/bidr';
import { calculateDeadlineInsights } from '@/lib/bidr-utils';
import type {
  DebtFilterStatus,
  DebtSortOption,
  CreateDebtPayload,
  SettleDebtPayload,
  UpdateDebtPayload,
} from '@/types/bidr';

export function useBidr() {
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const activeBranch = useBusinessStore((state) => state.activeBranch);

  const debts = useBidrStore((state) => state.debts);
  const summary = useBidrStore((state) => state.summary);
  const loading = useBidrStore((state) => state.loading);
  const refreshing = useBidrStore((state) => state.refreshing);
  const error = useBidrStore((state) => state.error);

  const filterStatus = useBidrStore((state) => state.filterStatus);
  const searchQuery = useBidrStore((state) => state.searchQuery);
  const sortBy = useBidrStore((state) => state.sortBy);

  const isCreating = useBidrStore((state) => state.isCreating);
  const isSettling = useBidrStore((state) => state.isSettling);
  const isUpdating = useBidrStore((state) => state.isUpdating);

  const setFilterStatus = useBidrStore((state) => state.setFilterStatus);
  const setSearchQuery = useBidrStore((state) => state.setSearchQuery);
  const setSortBy = useBidrStore((state) => state.setSortBy);

  const fetchData = useBidrStore((state) => state.fetchData);
  const refresh = useBidrStore((state) => state.refresh);
  const create = useBidrStore((state) => state.create);
  const settle = useBidrStore((state) => state.settle);
  const update = useBidrStore((state) => state.update);

  // Sync data when activeBusiness / activeBranch changes
  useEffect(() => {
    if (activeBusiness?.id) {
      fetchData(activeBusiness.id, activeBranch?.id);
    }
  }, [activeBusiness?.id, activeBranch?.id, fetchData]);

  const onRefresh = useCallback(async () => {
    if (activeBusiness?.id) {
      await refresh(activeBusiness.id, activeBranch?.id);
    }
  }, [activeBusiness?.id, activeBranch?.id, refresh]);

  // Deadline calculations: 1-week deadline alerts & overdue
  const deadlineInsights = useMemo(() => {
    return calculateDeadlineInsights(debts);
  }, [debts]);

  // Filtered and Sorted debt list
  const filteredDebts = useMemo(() => {
    const now = new Date().getTime();
    let list = [...debts];

    // Filter by Tab Status
    if (filterStatus === 'pending') {
      list = list.filter((d) => d.status === 'pending');
    } else if (filterStatus === 'settled') {
      list = list.filter((d) => d.status === 'settled');
    } else if (filterStatus === 'overdue') {
      list = list.filter(
        (d) => d.status === 'pending' && d.dueDate && new Date(d.dueDate).getTime() < now
      );
    } else if (filterStatus === 'due_soon') {
      list = list.filter(
        (d) =>
          d.status === 'pending' &&
          d.dueDate &&
          new Date(d.dueDate).getTime() >= now &&
          new Date(d.dueDate).getTime() <= now + SEVEN_DAYS_MS
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          (d.customerName && d.customerName.toLowerCase().includes(q)) ||
          (d.customerPhone && d.customerPhone.toLowerCase().includes(q)) ||
          (d.description && d.description.toLowerCase().includes(q)) ||
          (d.notes && d.notes.toLowerCase().includes(q))
      );
    }

    // Sort Records
    list.sort((a, b) => {
      if (sortBy === 'due_asc') {
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      }
      if (sortBy === 'due_desc') {
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return bDue - aDue;
      }
      if (sortBy === 'created_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'created_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return list;
  }, [debts, filterStatus, searchQuery, sortBy]);

  // Create debt mutation
  const handleCreateDebt = useCallback(
    async (payload: Omit<CreateDebtPayload, 'businessId' | 'branchId'>) => {
      if (!activeBusiness?.id || !activeBranch?.id) {
        throw new Error('Active business and branch required');
      }
      return create({
        ...payload,
        businessId: activeBusiness.id,
        branchId: activeBranch.id,
      });
    },
    [create, activeBusiness?.id, activeBranch?.id]
  );

  // Settle mutation
  const handleSettleDebt = useCallback(
    async (id: string, payload?: SettleDebtPayload) => {
      return settle(id, payload, activeBusiness?.id, activeBranch?.id);
    },
    [settle, activeBusiness?.id, activeBranch?.id]
  );

  // Update debt details
  const handleUpdateDebt = useCallback(
    async (id: string, payload: UpdateDebtPayload) => {
      return update(id, payload, activeBusiness?.id, activeBranch?.id);
    },
    [update, activeBusiness?.id, activeBranch?.id]
  );

  return {
    activeBusiness,
    activeBranch,
    debts,
    filteredDebts,
    summary,
    loading,
    refreshing,
    error,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    deadlineInsights,
    isCreating,
    isSettling,
    isUpdating,
    onRefresh,
    handleCreateDebt,
    handleSettleDebt,
    handleUpdateDebt,
  };
}
