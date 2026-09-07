import { Router } from "express";
import * as controller from "../controllers/expenses.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/", controller.createExpense);
router.get("/", controller.getExpenses);
router.get("/:id", controller.getExpenseById);
router.patch("/:id", controller.updateExpense);
router.delete("/:id", controller.deleteExpense);

export default router;
