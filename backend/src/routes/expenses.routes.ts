import { Router } from "express";
import * as controller from "../controllers/expenses.controller";
import { requireAuth } from "../middleware/auth";
import { requireStaffBranchMatch } from "../middleware/staff-guard";

const router = Router();

router.use(requireAuth);
router.use(requireStaffBranchMatch);

router.post("/", controller.createExpense);
router.get("/", controller.getExpenses);
router.get("/:id", controller.getExpenseById);
router.patch("/:id", controller.updateExpense);
router.delete("/:id", controller.deleteExpense);

export default router;
