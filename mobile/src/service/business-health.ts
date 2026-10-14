import { authClient, baseURL } from '@/lib/auth-client';
import { isSQLiteAvailable } from '@/db/client';
import { localHealthRepo } from '@/repositories/local-health.repo';
import { calculateFinancialSummary } from './health-calc';
import type {
  FinancialSnapshot,
  FinancialSummary,
  CreateShareTokenParams,
  ShareTokenResult,
} from '@/types/health';

export { calculateFinancialSummary };

export interface FetchHealthOptions {
  businessId: string;
  branchId?: string | null;
  periodType?: 'monthly' | 'yearly';
  limit?: number;
  branches?: any[];
}

/**
 * Service to orchestrate Business Health data retrieval with offline SQLite first,
 * seamless remote synchronization, and live in-flight month computation.
 */
export async function fetchBusinessHealthData(
  options: FetchHealthOptions
): Promise<{ snapshots: FinancialSnapshot[]; summary: FinancialSummary }> {
  const { businessId, branchId, periodType = 'monthly', limit = 12, branches = [] } = options;
  let snapshots: FinancialSnapshot[] = [];

  // 1. Load from local SQLite cache if available
  if (isSQLiteAvailable()) {
    try {
      const cached = await localHealthRepo.getSnapshots(businessId, branchId, periodType, limit);
      if (cached && cached.length > 0) {
        snapshots = cached;
      }
    } catch (err) {
      console.warn('[BusinessHealthService] SQLite getSnapshots warning:', err);
    }
  }

  // 2. Compute or refresh live current month in-flight
  if (isSQLiteAvailable() && periodType === 'monthly') {
    try {
      const liveSnapshot = await localHealthRepo.computeLiveCurrentMonth(
        businessId,
        branchId,
        branches
      );
      if (liveSnapshot) {
        const existingIdx = snapshots.findIndex(
          (s) =>
            s.periodYear === liveSnapshot.periodYear && s.periodMonth === liveSnapshot.periodMonth
        );
        if (existingIdx >= 0) {
          snapshots[existingIdx] = {
            ...snapshots[existingIdx],
            ...liveSnapshot,
            id: snapshots[existingIdx].id,
          };
        } else {
          snapshots.push(liveSnapshot);
        }
      }
    } catch (err) {
      console.warn('[BusinessHealthService] Live calculation warning:', err);
    }
  }

  // 3. Try fetching from remote server and save to SQLite
  try {
    const query = new URLSearchParams();
    query.append('businessId', businessId);
    if (branchId) query.append('branchId', branchId);
    query.append('periodType', periodType);
    query.append('limit', String(limit));

    const { data, error } = await authClient.$fetch(
      `${baseURL}/api/health/snapshots?${query.toString()}`
    );

    if (!error && data) {
      const json = data as any;
      const remoteSnapshots: FinancialSnapshot[] = json?.data?.snapshots || [];

      if (remoteSnapshots.length > 0) {
        snapshots = remoteSnapshots;
        if (isSQLiteAvailable()) {
          // Fire-and-forget or await persistence
          await localHealthRepo.saveSnapshotsAtomic(remoteSnapshots).catch((err) => {
            console.warn('[BusinessHealthService] Error saving snapshots to SQLite:', err);
          });
        }
      }
    }
  } catch (netErr) {
    // Graceful offline fallback - continue with SQLite data
    console.log('[BusinessHealthService] Working offline or remote sync skipped');
  }

  // Sort chronologically ascending
  snapshots.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const summary = calculateFinancialSummary(snapshots);
  return { snapshots, summary };
}

/**
 * Triggers a backend recomputation for a period.
 */
export async function recomputeSnapshot(
  businessId: string,
  branchId?: string | null
): Promise<FinancialSnapshot> {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/health/snapshots/recompute`, {
    method: 'POST',
    body: JSON.stringify({ businessId, branchId }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (error) throw new Error(error.message || 'Failed to recompute snapshot');
  const json = data as any;
  return json?.data ?? json;
}

/**
 * Generates a public, tamper-proof share token for loan officers or micro-finance funders.
 */
export async function createShareToken(
  params: CreateShareTokenParams
): Promise<ShareTokenResult> {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/health/share-token`, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  });

  if (error) throw new Error(error.message || 'Failed to create share token');
  const json = data as any;
  return json?.data ?? json;
}

/**
 * Revokes an existing share token.
 */
export async function revokeShareToken(token: string): Promise<void> {
  const { error } = await authClient.$fetch(`${baseURL}/api/health/share-token/${token}`, {
    method: 'DELETE',
  });

  if (error) throw new Error(error.message || 'Failed to revoke share token');
}
