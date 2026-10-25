import { Router } from "express";
import * as controller from "../controllers/staff.controller";
import { requireAuth } from "../middleware/auth";
import { forbidStaff } from "../middleware/staff-guard";

const router = Router();

// Staff Context Route (called by mobile client on boot to detect role and auto-claim invites)
router.get("/staff/me", requireAuth, controller.getStaffProfile);

// Owner Daily Multi-Branch Digest (protected by forbidStaff so only business owners can access)
router.get("/branches/daily-digest", requireAuth, forbidStaff, controller.getDailyDigest);

// Staff Assignment Management (Owner only)
router.post("/branches/:branchId/staff", requireAuth, forbidStaff, controller.assignStaff);
router.get("/branches/:branchId/staff", requireAuth, forbidStaff, controller.getBranchStaff);
router.delete("/branches/:branchId/staff/:assignmentId", requireAuth, forbidStaff, controller.revokeStaff);

export default router;
