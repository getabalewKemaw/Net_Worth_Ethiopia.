import { Router } from "express";
import * as controller from "../controllers/notification.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", controller.list);
router.patch("/:id/read", controller.markRead);
router.patch("/read-all", controller.markAllRead);
router.post("/device-token", controller.registerDevice);
router.post("/device-token/deactivate", controller.deactivateDevice);

export default router;
