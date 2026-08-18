import { Router } from "express";
import * as controller from "../controllers/branch.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/businesses/:businessId/branches", controller.createBranch);
router.get("/businesses/:businessId/branches", controller.getBranchesByBusinessId);
router.get("/branches/:id", controller.getBranchById);
router.patch("/branches/:id", controller.updateBranch);

export default router;
