import { Router } from "express";
import { syncController } from "../controllers/sync.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/push", syncController.pushMutations);
router.get("/pull", syncController.pullChanges);

export default router;
