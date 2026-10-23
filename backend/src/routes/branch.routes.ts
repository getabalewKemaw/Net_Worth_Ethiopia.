import { Router } from "express";
import * as controller from "../controllers/branch.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/businesses/:businessId/branches", requireAuth, controller.createBranch);
router.get("/businesses/:businessId/branches", requireAuth, controller.getBranchesByBusinessId);
router.get("/branches/:id", requireAuth, controller.getBranchById);
router.patch("/branches/:id", requireAuth, controller.updateBranch);

export default router;
