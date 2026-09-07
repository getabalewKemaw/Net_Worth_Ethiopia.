import { Router } from "express";
import * as controller from "../controllers/bidr.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/summary", controller.getDebtSummary);
router.get("/", controller.getDebts);
router.get("/:id", controller.getDebtById);
router.post("/:id/settle", controller.settleDebt);
router.patch("/:id", controller.updateDebt);

export default router;
