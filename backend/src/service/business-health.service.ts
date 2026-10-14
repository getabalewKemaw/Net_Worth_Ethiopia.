import crypto from "node:crypto";
import { businessHealthRepo } from "../repositories/business-health.repository";
import type {
  BusinessFinancialSnapshot,
  SnapshotQueryParams,
  CreateShareTokenPayload,
  VerifiedDossierResult,
  BranchMetricSummary,
} from "../types/business-health";
import { NotFoundError, BadRequestError } from "../helpers/errors";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatPeriodLabel(year: number, monthZeroIndexed: number): string {
  return `${MONTH_NAMES[monthZeroIndexed]} ${year}`;
}

export const businessHealthService = {
  /**
   * Recomputes and persists an aggregated financial snapshot for a specific month.
   */
  async recomputePeriodSnapshot(
    businessId: string,
    branchId?: string,
    targetDate: Date = new Date(),
    isFinalized: boolean = false
  ): Promise<BusinessFinancialSnapshot> {
    const year = targetDate.getFullYear();
    const monthIndex = targetDate.getMonth(); // 0 - 11
    const monthStr = String(monthIndex + 1).padStart(2, "0");
    const periodLabel = formatPeriodLabel(year, monthIndex);

    // Month boundary timestamps
    const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

    // Fetch transactions
    const raw = await businessHealthRepo.findRawPeriodTransactions(
      businessId,
      startDate,
      endDate
    );

    // Filter by branch if requested
    const filteredSales = branchId
      ? raw.sales.filter((s) => s.branchId === branchId)
      : raw.sales;
    const filteredExpenses = branchId
      ? raw.expenses.filter((e) => e.branchId === branchId)
      : raw.expenses;

    // 1. Currency Flows
    const instantSales = filteredSales.filter((s) => s.saleType !== "dube");
    const dubeSettledSales = filteredSales.filter(
      (s) => s.saleType === "dube" && s.status === "settled"
    );
    const dubeIssuedSales = filteredSales.filter((s) => s.saleType === "dube");

    const instantSalesTotal = instantSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const dubeSettledTotal = dubeSettledSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const grossInflow = instantSalesTotal + dubeSettledTotal;

    const grossOutflow = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netProfit = grossInflow - grossOutflow;
    const profitMarginPct = grossInflow > 0 ? (netProfit / grossInflow) * 100 : 0;

    const transactionCount = instantSales.length + dubeSettledSales.length;
    const avgTicketSize = transactionCount > 0 ? grossInflow / transactionCount : 0;

    // 2. Payment Channels & Digital Ratio
    let telebirrVolume = 0;
    let cbeVolume = 0;
    let cashVolume = 0;

    for (const s of instantSales) {
      const method = (s.paymentMethod || "").toLowerCase();
      const amt = Number(s.amount || 0);
      if (method === "telebirr") {
        telebirrVolume += amt;
      } else if (method === "cbe" || method === "cbebirr" || method === "bank_transfer") {
        cbeVolume += amt;
      } else {
        cashVolume += amt;
      }
    }

    const digitalPaymentRatio =
      grossInflow > 0 ? ((telebirrVolume + cbeVolume) / grossInflow) * 100 : 0;

    // 3. Dube Recovery Rate
    const dubeCollectedVolume = dubeSettledTotal;
    const dubeIssuedVolume = dubeIssuedSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const debtRecoveryRatePct =
      dubeIssuedVolume > 0 ? Math.min(100, (dubeCollectedVolume / dubeIssuedVolume) * 100) : 100;

    // 4. Multi-Branch Performance Breakdown (JSON Cache)
    const branchBreakdown: BranchMetricSummary[] = raw.branches.map((br) => {
      const bSales = raw.sales.filter(
        (s) => s.branchId === br.id && s.saleType !== "dube"
      );
      const bDubeSettled = raw.sales.filter(
        (s) => s.branchId === br.id && s.saleType === "dube" && s.status === "settled"
      );
      const bInflow =
        bSales.reduce((sum, s) => sum + Number(s.amount || 0), 0) +
        bDubeSettled.reduce((sum, s) => sum + Number(s.amount || 0), 0);

      const bExpenses = raw.expenses.filter((e) => e.branchId === br.id);
      const bOutflow = bExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const bProfit = bInflow - bOutflow;
      const bShare = grossInflow > 0 ? Math.round((bInflow / grossInflow) * 100) : 0;

      return {
        branchId: br.id,
        branchName: br.name,
        city: br.city || br.address || undefined,
        inflow: bInflow,
        outflow: bOutflow,
        profit: bProfit,
        sharePct: bShare,
      };
    });

    // 5. Growth Velocity (MoM and YoY)
    let growthMoMPct: string | null = null;
    let growthYoYPct: string | null = null;

    // Fetch previous month
    const prevMonthDate = new Date(year, monthIndex - 1, 1);
    const prevYearStr = String(prevMonthDate.getFullYear());
    const prevMonthStr = String(prevMonthDate.getMonth() + 1).padStart(2, "0");

    const prevSnapshot = await businessHealthRepo.findSnapshotByPeriod(
      businessId,
      branchId ?? null,
      "monthly",
      prevYearStr,
      prevMonthStr
    );

    if (prevSnapshot) {
      const prevInflow = Number(prevSnapshot.grossInflow || 0);
      if (prevInflow > 0) {
        const mom = ((grossInflow - prevInflow) / prevInflow) * 100;
        growthMoMPct = (mom >= 0 ? `+${mom.toFixed(1)}` : mom.toFixed(1));
      } else if (grossInflow > 0) {
        growthMoMPct = "+100.0";
      }
    }

    // Fetch same month last year (YoY)
    const lastYearStr = String(year - 1);
    const yoySnapshot = await businessHealthRepo.findSnapshotByPeriod(
      businessId,
      branchId ?? null,
      "monthly",
      lastYearStr,
      monthStr
    );

    if (yoySnapshot) {
      const yoyInflow = Number(yoySnapshot.grossInflow || 0);
      if (yoyInflow > 0) {
        const yoy = ((grossInflow - yoyInflow) / yoyInflow) * 100;
        growthYoYPct = (yoy >= 0 ? `+${yoy.toFixed(1)}` : yoy.toFixed(1));
      }
    }

    // 6. Save or Update Snapshot
    const snapshot = await businessHealthRepo.saveSnapshot({
      id: crypto.randomUUID(),
      businessId,
      branchId: branchId ?? null,
      periodType: "monthly",
      periodYear: String(year),
      periodMonth: monthStr,
      periodLabel,
      startDate,
      endDate,
      grossInflow: grossInflow.toFixed(2),
      grossOutflow: grossOutflow.toFixed(2),
      netProfit: netProfit.toFixed(2),
      profitMarginPct: profitMarginPct.toFixed(1),
      growthMoMPct,
      growthYoYPct,
      transactionCount: String(transactionCount),
      avgTicketSize: avgTicketSize.toFixed(2),
      digitalPaymentRatio: digitalPaymentRatio.toFixed(1),
      telebirrVolume: telebirrVolume.toFixed(2),
      cbeVolume: cbeVolume.toFixed(2),
      cashVolume: cashVolume.toFixed(2),
      dubeCollectedVolume: dubeCollectedVolume.toFixed(2),
      dubeIssuedVolume: dubeIssuedVolume.toFixed(2),
      debtRecoveryRatePct: debtRecoveryRatePct.toFixed(1),
      branchMetricsJson: JSON.stringify(branchBreakdown),
      isFinalized,
    });

    return snapshot;
  },

  /**
   * Retrieves historical snapshots and ensures the active month is up to date.
   */
  async getHistoricalSnapshots(params: SnapshotQueryParams) {
    // 1. Recompute current month dynamically to guarantee live metrics
    try {
      await this.recomputePeriodSnapshot(
        params.businessId,
        params.branchId,
        new Date(),
        false
      );
    } catch (err) {
      console.warn("[BusinessHealth] Current month recompute warning:", err);
    }

    // 2. Fetch all chronological snapshots
    const snapshots = await businessHealthRepo.findSnapshots(params);

    // 3. Aggregate Executive Summary across the retrieved series
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalDigitalVolume = 0;

    const formattedSnapshots = snapshots.map((s) => {
      const inflow = Number(s.grossInflow || 0);
      const outflow = Number(s.grossOutflow || 0);
      const profit = Number(s.netProfit || 0);
      const telebirr = Number(s.telebirrVolume || 0);
      const cbe = Number(s.cbeVolume || 0);

      totalInflow += inflow;
      totalOutflow += outflow;
      totalDigitalVolume += (telebirr + cbe);

      let branchMetrics: BranchMetricSummary[] = [];
      try {
        if (s.branchMetricsJson) {
          branchMetrics = JSON.parse(s.branchMetricsJson);
        }
      } catch {
        branchMetrics = [];
      }

      return {
        id: s.id,
        periodLabel: s.periodLabel,
        periodYear: s.periodYear,
        periodMonth: s.periodMonth,
        startDate: s.startDate,
        endDate: s.endDate,
        grossInflow: inflow,
        grossOutflow: outflow,
        netProfit: profit,
        profitMarginPct: Number(s.profitMarginPct || 0),
        growthMoMPct: s.growthMoMPct ? Number(s.growthMoMPct) : null,
        growthYoYPct: s.growthYoYPct ? Number(s.growthYoYPct) : null,
        transactionCount: Number(s.transactionCount || 0),
        avgTicketSize: Number(s.avgTicketSize || 0),
        digitalPaymentRatio: Number(s.digitalPaymentRatio || 0),
        telebirrVolume: telebirr,
        cbeVolume: cbe,
        cashVolume: Number(s.cashVolume || 0),
        debtRecoveryRatePct: Number(s.debtRecoveryRatePct || 0),
        branchMetrics,
        isFinalized: s.isFinalized,
      };
    });

    const netProfit = totalInflow - totalOutflow;
    const avgProfitMarginPct =
      totalInflow > 0 ? Math.round((netProfit / totalInflow) * 100) : 0;
    const averageDigitalRatio =
      totalInflow > 0 ? Math.round((totalDigitalVolume / totalInflow) * 100) : 0;

    return {
      snapshots: formattedSnapshots,
      summary: {
        totalInflow,
        totalOutflow,
        netProfit,
        avgProfitMarginPct,
        averageDigitalRatio,
      },
    };
  },

  /**
   * Generates a shareable token for commercial banks and funding agencies.
   */
  async generateShareToken(
    businessId: string,
    userId: string,
    payload: CreateShareTokenPayload,
    baseUrl: string = "https://networth.et"
  ) {
    const token = crypto.randomBytes(32).toString("hex");
    const validityDays = payload.validityDays || 30;
    const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

    const created = await businessHealthRepo.createShareToken({
      token,
      businessId,
      createdById: userId,
      purpose: payload.purpose,
      funderName: payload.funderName || null,
      funderNote: payload.funderNote || null,
      expiresAt,
      isActive: true,
      accessCount: "0",
    });

    const shareUrl = `${baseUrl}/verify-health/${token}`;

    return {
      token: created.token,
      shareUrl,
      funderName: created.funderName,
      purpose: created.purpose,
      expiresAt: created.expiresAt?.toISOString() || null,
    };
  },

  /**
   * Public verification endpoint providing a sanitized loan dossier to loan officers.
   */
  async getVerifiedFunderDossier(token: string): Promise<VerifiedDossierResult> {
    const tokenRecord = await businessHealthRepo.findShareToken(token);
    if (!tokenRecord) {
      throw new NotFoundError("Invalid or expired verification link");
    }

    if (!tokenRecord.isActive) {
      throw new BadRequestError("This verification link has been deactivated by the merchant");
    }

    if (tokenRecord.expiresAt && new Date() > tokenRecord.expiresAt) {
      throw new BadRequestError("This verification link has expired. Request a new link from the merchant.");
    }

    // Increment access count
    await businessHealthRepo.incrementTokenAccess(token);

    // Fetch business and branches
    const businessData = await businessHealthRepo.findBusinessWithBranches(tokenRecord.businessId);
    if (!businessData) {
      throw new NotFoundError("Associated business profile could not be found");
    }

    // Fetch last 12 snapshots
    const { snapshots, summary } = await this.getHistoricalSnapshots({
      businessId: tokenRecord.businessId,
      periodType: "monthly",
      limit: 12,
    });

    // Consecutive profitable months calculation
    let consecutiveProfitable = 0;
    for (let i = snapshots.length - 1; i >= 0; i--) {
      const snap = snapshots[i];
      if (snap && snap.netProfit > 0) {
        consecutiveProfitable++;
      } else {
        break;
      }
    }

    // Debt recovery rate across series
    const lastSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : undefined;
    const recoveryRate = lastSnapshot ? `${lastSnapshot.debtRecoveryRatePct}%` : "100%";

    return {
      status: "verified",
      token: tokenRecord.token,
      funderName: tokenRecord.funderName,
      purpose: tokenRecord.purpose,
      expiresAt: tokenRecord.expiresAt ? tokenRecord.expiresAt.toISOString() : null,
      business: {
        id: businessData.business.id,
        name: businessData.business.name,
        type: businessData.business.type,
        city: businessData.business.city,
        address: businessData.business.address,
        operatingSince: businessData.business.createdAt.toISOString().slice(0, 10),
      },
      summary: {
        totalRevenue: summary.totalInflow,
        totalExpense: summary.totalOutflow,
        netProfit: summary.netProfit,
        avgProfitMarginPct: summary.avgProfitMarginPct,
        verifiableDigitalRatio: `${summary.averageDigitalRatio}% (Telebirr & CBE)`,
        debtRecoveryRate: recoveryRate,
        consecutiveProfitableMonths: consecutiveProfitable,
      },
      snapshots: snapshots.map((s) => ({
        periodLabel: s.periodLabel,
        periodYear: s.periodYear,
        periodMonth: s.periodMonth,
        grossInflow: s.grossInflow,
        grossOutflow: s.grossOutflow,
        netProfit: s.netProfit,
        profitMarginPct: s.profitMarginPct,
        growthMoMPct: s.growthMoMPct,
        growthYoYPct: s.growthYoYPct,
        digitalPaymentRatio: s.digitalPaymentRatio,
        telebirrVolume: s.telebirrVolume,
        cbeVolume: s.cbeVolume,
        cashVolume: s.cashVolume,
        transactionCount: s.transactionCount,
        branchMetrics: s.branchMetrics,
      })),
    };
  },
};
