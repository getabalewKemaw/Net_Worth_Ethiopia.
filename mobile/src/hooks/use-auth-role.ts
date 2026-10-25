import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { useStaffStore } from '@/store/staff-store';
import { useBusinessStore } from '@/store/business-store';
import type { StaffProfile } from '@/types/staff';

export type UserRole = 'loading' | 'sales' | 'owner' | 'new_user' | 'unauthenticated';

export interface AuthRoleState {
  role: UserRole;
  isResolving: boolean;
  isStaff: boolean;
  isOwner: boolean;
  isNewUser: boolean;
  isAuthenticated: boolean;
  staffProfile: StaffProfile | null;
  assignedBranchId: string | null;
  recheckRole: () => Promise<void>;
}

export function useAuthRole(): AuthRoleState {
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  const isStaffInStore = useStaffStore((s) => s.isStaff);
  const staffProfile = useStaffStore((s) => s.staffProfile);
  const assignedBranchId = useStaffStore((s) => s.assignedBranchId);
  const initStaffSession = useStaffStore((s) => s.initStaffSession);
  const clearStaffSession = useStaffStore((s) => s.clearStaffSession);

  const loadInitialState = useBusinessStore((s) => s.loadInitialState);

  const [role, setRole] = useState<UserRole>('loading');
  const [isResolving, setIsResolving] = useState<boolean>(true);

  const resolveRole = async () => {
    if (isAuthPending) return;

    if (!session || !session.user) {
      clearStaffSession();
      setRole('unauthenticated');
      setIsResolving(false);
      return;
    }

    setIsResolving(true);

    try {
      // 1. Check if user is staff (auto-claims pending invites on backend)
      const hasStaffAccess = await initStaffSession({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      });

      if (hasStaffAccess) {
        setRole('sales');
        setIsResolving(false);
        return;
      }

      // 2. Not staff. Query business ownership
      await loadInitialState();

      const bizState = useBusinessStore.getState();
      const hasBusiness =
        Boolean(bizState.activeBusiness) ||
        (bizState.businesses && bizState.businesses.length > 0);

      if (hasBusiness) {
        setRole('owner');
      } else {
        setRole('new_user');
      }
    } catch (error) {
      console.warn('[useAuthRole] Failed to resolve auth role:', error);
      const bizState = useBusinessStore.getState();
      if (bizState.activeBusiness || (bizState.businesses && bizState.businesses.length > 0)) {
        setRole('owner');
      } else {
        setRole('new_user');
      }
    } finally {
      setIsResolving(false);
    }
  };

  useEffect(() => {
    resolveRole();
  }, [session?.user?.id, session?.user?.email, isAuthPending]);

  return {
    role,
    isResolving: isResolving || isAuthPending,
    isStaff: role === 'sales',
    isOwner: role === 'owner',
    isNewUser: role === 'new_user',
    isAuthenticated: role === 'sales' || role === 'owner' || role === 'new_user',
    staffProfile,
    assignedBranchId,
    recheckRole: resolveRole,
  };
}
