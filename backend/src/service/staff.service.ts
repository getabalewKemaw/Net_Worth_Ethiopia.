import crypto from "crypto";
import * as staffRepo from "../repositories/staff.repository";
import * as branchRepo from "../repositories/branch.repository";
import * as businessRepo from "../repositories/business.repository";
import { NotFoundError, ForbiddenError, BadRequestError } from "../helpers/errors";
import type {
  StaffAssignment,
  NewStaffAssignment,
  AssignStaffInput,
  StaffProfileResponse,
  DailyDigestResponse,
} from "../types/staff";

export const assignStaffService = async (
  ownerUserId: string,
  branchId: string,
  input: AssignStaffInput
): Promise<StaffAssignment> => {
  const branchItem = await branchRepo.findBranchById(branchId);
  if (!branchItem) {
    throw new NotFoundError("Branch not found");
  }

  const biz = await businessRepo.findBusinessById(branchItem.businessId);
  if (!biz) {
    throw new NotFoundError("Business not found");
  }

  if (biz.userId !== ownerUserId) {
    throw new ForbiddenError("Unauthorized: You do not own this business");
  }

  const normalizedEmail = input.email.toLowerCase().trim();

  // Check if staff already assigned in this business
  const existing = await staffRepo.findStaffAssignmentByBusinessAndEmail(
    biz.id,
    normalizedEmail
  );
  if (existing) {
    throw new BadRequestError(
      "A staff assignment already exists for this email in this business"
    );
  }

  // Check if user already exists in user table (Better Auth)
  const existingUser = await staffRepo.findUserByEmail(normalizedEmail);
  const isExistingUser = Boolean(existingUser);

  const newAssignment: NewStaffAssignment = {
    id: crypto.randomUUID(),
    businessId: biz.id,
    branchId: branchItem.id,
    userId: isExistingUser ? existingUser!.id : null,
    email: normalizedEmail,
    name: input.name || (isExistingUser ? existingUser!.name : null),
    role: input.role || "sales",
    status: isExistingUser ? "active" : "pending",
    invitedAt: new Date(),
    acceptedAt: isExistingUser ? new Date() : null,
  };

  return await staffRepo.createStaffAssignment(newAssignment);
};

export const getBranchStaffService = async (
  ownerUserId: string,
  branchId: string
): Promise<StaffAssignment[]> => {
  const branchItem = await branchRepo.findBranchById(branchId);
  if (!branchItem) {
    throw new NotFoundError("Branch not found");
  }

  const biz = await businessRepo.findBusinessById(branchItem.businessId);
  if (!biz || biz.userId !== ownerUserId) {
    throw new ForbiddenError("Unauthorized: You do not have access to this branch");
  }

  return await staffRepo.findStaffAssignmentsByBranchId(branchId);
};

export const revokeStaffService = async (
  ownerUserId: string,
  branchId: string,
  assignmentId: string
): Promise<{ revoked: boolean; message: string }> => {
  const branchItem = await branchRepo.findBranchById(branchId);
  if (!branchItem) {
    throw new NotFoundError("Branch not found");
  }

  const biz = await businessRepo.findBusinessById(branchItem.businessId);
  if (!biz || biz.userId !== ownerUserId) {
    throw new ForbiddenError("Unauthorized: You do not have access to this branch");
  }

  const assignment = await staffRepo.findStaffAssignmentById(assignmentId);
  if (!assignment) {
    throw new NotFoundError("Staff assignment not found");
  }

  if (assignment.branchId !== branchId) {
    throw new BadRequestError("Assignment does not belong to the specified branch");
  }

  await staffRepo.deleteStaffAssignment(assignmentId);
  return { revoked: true, message: "Staff assignment removed" };
};

export const getStaffProfileService = async (
  userId: string,
  userEmail: string
): Promise<StaffProfileResponse> => {
  const normalizedEmail = userEmail.toLowerCase().trim();

  // 1. Auto-claim pending assignment if any exists for this email
  await staffRepo.claimPendingAssignment(normalizedEmail, userId);

  // 2. Fetch active assignment for this userId
  const activeAssignment = await staffRepo.findActiveStaffAssignmentByUserId(userId);
  if (!activeAssignment) {
    return { isStaff: false };
  }

  const biz = await businessRepo.findBusinessById(activeAssignment.businessId);
  const branchItem = await branchRepo.findBranchById(activeAssignment.branchId);

  return {
    isStaff: true,
    assignmentId: activeAssignment.id,
    businessId: activeAssignment.businessId,
    businessName: biz?.name ?? "Business",
    branchId: activeAssignment.branchId,
    branchName: branchItem?.name ?? "Branch",
    role: activeAssignment.role,
    status: activeAssignment.status,
    name: activeAssignment.name,
    email: activeAssignment.email,
  };
};

export const getDailyDigestService = async (
  ownerUserId: string,
  businessId: string,
  dateStr?: string
): Promise<DailyDigestResponse> => {
  const biz = await businessRepo.findBusinessById(businessId);
  if (!biz) {
    throw new NotFoundError("Business not found");
  }

  if (biz.userId !== ownerUserId) {
    throw new ForbiddenError("Unauthorized: You do not own this business");
  }

  const targetDateStr = dateStr || new Date().toISOString().slice(0, 10);
  const startDate = new Date(`${targetDateStr}T00:00:00.000Z`);
  const endDate = new Date(`${targetDateStr}T23:59:59.999Z`);

  const branches = await branchRepo.findBranchesByBusinessId(businessId);

  const branchesDigest = await Promise.all(
    branches.map((b) =>
      staffRepo.getBranchDailyDigestMetrics(
        businessId,
        b.id,
        b.name,
        startDate,
        endDate
      )
    )
  );

  const totalInflow = branchesDigest.reduce(
    (sum, b) => sum + b.metrics.grossInflow,
    0
  );
  const totalCashInDrawer = branchesDigest.reduce(
    (sum, b) => sum + b.metrics.cashVolume,
    0
  );
  const totalDigitalInflow = branchesDigest.reduce(
    (sum, b) => sum + b.metrics.telebirrVolume + b.metrics.cbeVolume,
    0
  );
  const totalDubeSettled = branchesDigest.reduce(
    (sum, b) =>
      sum + b.settledDebtsToday.reduce((debtSum, d) => debtSum + d.amount, 0),
    0
  );

  return {
    date: targetDateStr,
    businessId,
    totalInflow,
    totalCashInDrawer,
    totalDigitalInflow,
    totalDubeSettled,
    branches: branchesDigest,
  };
};
