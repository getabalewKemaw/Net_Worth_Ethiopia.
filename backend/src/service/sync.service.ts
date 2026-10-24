import * as businessRepo from "../repositories/business.repository";
import * as staffRepo from "../repositories/staff.repository";
import { syncRepo } from "../repositories/sync.repository";
import { ForbiddenError, NotFoundError } from "../helpers/errors";
import type { SyncPullResponse, SyncPushRequest, SyncPushResponse } from "../types/sync";

export const syncService = {
  /**
   * Processes a batch of queued offline mutations pushed by a client.
   */
  async processPushBatch(
    userId: string,
    data: SyncPushRequest
  ): Promise<SyncPushResponse> {
    const biz = await businessRepo.findBusinessById(data.businessId);
    if (!biz) {
      throw new NotFoundError("Business not found");
    }
    if (biz.userId !== userId) {
      const staffMember = await staffRepo.findActiveStaffAssignmentByUserId(userId);
      if (!staffMember || staffMember.businessId !== data.businessId || staffMember.status !== "active") {
        throw new ForbiddenError("Unauthorized: You do not own this business or have active staff access");
      }
    }

    if (!data.mutations || data.mutations.length === 0) {
      return {
        status: "success",
        processedMutationIds: [],
        rejectedMutations: [],
      };
    }

    const { processedIds, rejected } = await syncRepo.applyBatchMutations(
      userId,
      data.businessId,
      data.mutations
    );

    const status =
      rejected.length === 0
        ? "success"
        : processedIds.length === 0
        ? "error"
        : "partial";

    return {
      status,
      processedMutationIds: processedIds,
      rejectedMutations: rejected,
    };
  },

  /**
   * Retrieves delta changes since a specified cursor for downstream client hydration.
   */
  async pullDeltaChanges(
    userId: string,
    businessId: string,
    sinceStr?: string
  ): Promise<SyncPullResponse> {
    const biz = await businessRepo.findBusinessById(businessId);
    if (!biz) {
      throw new NotFoundError("Business not found");
    }
    if (biz.userId !== userId) {
      const staffMember = await staffRepo.findActiveStaffAssignmentByUserId(userId);
      if (!staffMember || staffMember.businessId !== businessId || staffMember.status !== "active") {
        throw new ForbiddenError("Unauthorized: You do not own this business or have active staff access");
      }
    }

    let sinceDate: Date | undefined;
    if (sinceStr) {
      const parsed = new Date(sinceStr);
      if (!isNaN(parsed.getTime())) {
        sinceDate = parsed;
      }
    }

    const changes = await syncRepo.pullDeltaChanges(businessId, sinceDate);

    return {
      serverTimestamp: new Date().toISOString(),
      changes,
    };
  },
};
