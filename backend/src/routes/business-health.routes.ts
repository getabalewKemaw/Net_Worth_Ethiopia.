import { Router } from "express";
import { businessHealthController } from "../controllers/business-health.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

// ========================================================
// 1. PUBLIC VERIFICATION ENDPOINT (For Loan Officers / Banks)
// ========================================================
router.get("/verify/:token", businessHealthController.verifyTokenDossier);

// ========================================================
// 2. PROTECTED MERCHANT ENDPOINTS (Require Authentication)
// ========================================================
router.use(requireAuth);

router.get("/snapshots", businessHealthController.getSnapshots);
router.post("/snapshots/recompute", businessHealthController.recomputeSnapshot);
router.post("/share-token", businessHealthController.createShareToken);
router.delete("/share-token/:token", businessHealthController.revokeShareToken);

export default router;
