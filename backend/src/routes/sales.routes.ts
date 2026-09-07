import { Router } from "express";
import * as controller from "../controllers/sales.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/", controller.createSale);
router.get("/", controller.getSales);
router.get("/:id", controller.getSaleById);
router.patch("/:id", controller.updateSale);
router.delete("/:id", controller.deleteSale);

export default router;
