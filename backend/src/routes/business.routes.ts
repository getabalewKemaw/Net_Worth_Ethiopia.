import { Router } from "express";
import * as controller from "../controllers/business.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/", controller.createBusiness);
router.get("/", controller.getAllBusinesses);
router.get("/:id", controller.getBusinessById);
router.patch("/:id", controller.updateBusiness);

export default router;
