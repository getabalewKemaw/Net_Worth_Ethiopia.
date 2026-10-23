import { Router } from "express";
import { adminController } from "../controllers/admin.controller";

const router = Router();

router.post("/login", adminController.login);
router.get("/users", adminController.getBusinessOwners);
router.get("/stats", adminController.getPlatformStats);

export default router;
