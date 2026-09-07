import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth";
import businessRoutes from "./routes/business.routes";
import branchRoutes from "./routes/branch.routes";
import salesRoutes from "./routes/sales.routes";
import expensesRoutes from "./routes/expenses.routes";
import bidrRoutes from "./routes/bidr.routes";
import { errorHandler } from "./middleware/error";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", toNodeHandler(auth));
app.use("/api/businesses", businessRoutes);
app.use("/api", branchRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/bidr", bidrRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("NetWorth API is running!");
});

app.use(errorHandler);

app.listen(Number(port), "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
});
