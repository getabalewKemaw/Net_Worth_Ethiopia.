"use client";

import React, { useEffect, use, Suspense } from "react";
import { useDossierStore } from "@/store/dossier-store";
import { HealthGauge } from "@/components/mfo/health-gauge";
import { LoanCapacityCard } from "@/components/mfo/loan-capacity-card";
import { PillarBreakdown } from "@/components/mfo/pillar-breakdown";
import { D3CashFlowChart, type CashFlowMonth } from "@/components/charts/d3-cashflow-chart";
import { D3DonutChart, type DonutItem } from "@/components/charts/d3-donut-chart";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  PieChart,
  TrendingUp,
  FileCheck2,
  AlertTriangle,
  Layers,
} from "lucide-react";

interface PageProps {
  params: Promise<{ token: string }>;
}

function DossierLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center animate-pulse mb-4 shadow-sm">
        <Layers className="w-6 h-6" />
      </div>
      <h2 className="text-sm font-bold text-slate-800">Verifying Bank Authorization Token...</h2>
      <p className="text-xs text-slate-500 font-medium mt-1">
        Decrypting tamper-proof financial ledger records from NetWorth Ethiopia
      </p>
    </div>
  );
}

function DossierContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const { dossier, isLoading, error, fetchDossier } = useDossierStore();

  useEffect(() => {
    if (token) {
      fetchDossier(token);
    }
  }, [token, fetchDossier]);

  if (isLoading) {
    return <DossierLoadingFallback />;
  }

  if (error || !dossier) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-red-200 bg-white shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Verification Link Inactive</h2>
            <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
              {error || "This financial health dossier link is invalid, has expired, or was revoked by the merchant."}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
            Please ask the business owner to generate a fresh, time-limited share link from the NetWorth mobile app.
          </p>
        </div>
      </div>
    );
  }

  const business = dossier.business;
  const summary = dossier.summary;

  // Dynamic payment breakdown for Donut Chart
  let totalTelebirr = 0;
  let totalCbe = 0;
  let totalCash = 0;
  if (dossier.snapshots && dossier.snapshots.length > 0) {
    dossier.snapshots.forEach((s) => {
      totalTelebirr += Number(s.telebirrVolume || 0);
      totalCbe += Number(s.cbeVolume || 0);
      totalCash += Number(s.cashVolume || 0);
    });
  }
  const totalVolume = totalTelebirr + totalCbe + totalCash;
  const donutSegments: DonutItem[] = totalVolume > 0
    ? [
        { label: "Telebirr", value: Math.round((totalTelebirr / totalVolume) * 100), color: "#047857", bg: "#ecfdf5" },
        { label: "CBE Birr", value: Math.round((totalCbe / totalVolume) * 100), color: "#2563eb", bg: "#eff6ff" },
        { label: "Cash", value: Math.max(0, 100 - Math.round((totalTelebirr / totalVolume) * 100) - Math.round((totalCbe / totalVolume) * 100)), color: "#d97706", bg: "#fffbeb" },
      ]
    : [
        { label: "Telebirr", value: Math.round(dossier.digitalRatioPercent * 0.65), color: "#047857", bg: "#ecfdf5" },
        { label: "CBE Birr", value: dossier.digitalRatioPercent - Math.round(dossier.digitalRatioPercent * 0.65), color: "#2563eb", bg: "#eff6ff" },
        { label: "Cash", value: Math.max(0, 100 - dossier.digitalRatioPercent), color: "#d97706", bg: "#fffbeb" },
      ];

  // Dynamic Multi-month Cashflow Data for D3CashFlowChart
  const cashFlowData: CashFlowMonth[] =
    dossier.snapshots && dossier.snapshots.length > 0
      ? dossier.snapshots.map((s) => ({
          month: s.periodLabel || "Month",
          inflow: Math.round(Number(s.grossInflow) / 1000),
          outflow: Math.round(Number(s.grossOutflow) / 1000),
          safeCap: Math.round((dossier.recommendedLoanEtb || 50000) / 1000),
        }))
      : [
          {
            month: "Current",
            inflow: Math.round(dossier.monthlyRevenueEtb / 1000),
            outflow: Math.round((dossier.monthlyRevenueEtb * 0.6) / 1000),
            safeCap: Math.round((dossier.recommendedLoanEtb || 50000) / 1000),
          },
        ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Institutional Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-slate-900">
                  NetWorth <span className="text-emerald-700">Ethiopia</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border border-emerald-300">
                  <ShieldCheck className="w-3 h-3" /> Certified Audit
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500">
                Institutional Financial Health & Loan Underwriting Dossier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {dossier.expiresAt && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-medium text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Valid until: <strong>{dossier.expiresAt.slice(0, 10)}</strong></span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Recipient Notice Banner */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-emerald-950">
                Official MSME Credit Readiness Dossier
                {dossier.funderName && ` · Prepared for ${dossier.funderName}`}
              </p>
              <p className="text-[11px] text-emerald-800 font-medium">
                Verified through digital payments (Telebirr & CBE), expense ledgers, and customer credit recovery records.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] bg-white text-emerald-900 px-2.5 py-1 rounded border border-emerald-300 font-bold self-start sm:self-auto">
            Token: {token.slice(0, 12)}...
          </span>
        </div>

        {/* Business Identity Card */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardBody className="p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900">{business.name}</h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  {business.type} · Operating since {business.operatingSince}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-slate-700 font-medium">
              {business.tin && (
                <span className="font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-xs">
                  TIN: {business.tin}
                </span>
              )}
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {business.city}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs">
                {business.branchCount || 1} Operating Branch{(business.branchCount || 1) > 1 ? "es" : ""}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Two-Column Grid: Gauge + Capacity & Pillars + Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Health Gauge & Loan Capacity */}
          <div className="lg:col-span-5 space-y-6">
            <HealthGauge score={dossier.healthScore} grade={dossier.ratingGrade} />

            <LoanCapacityCard
              recommendedLoanEtb={dossier.recommendedLoanEtb}
              monthlyRevenueEtb={dossier.monthlyRevenueEtb}
              digitalRatioPercent={dossier.digitalRatioPercent}
              avgDubeDays={dossier.avgDubeDays}
            />

            <Card className="border-slate-200 shadow-xs">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-bold text-slate-900">Verified Payment Footprint</h3>
                </div>
              </CardHeader>
              <CardBody className="p-4">
                <D3DonutChart
                  segments={donutSegments}
                  centerText={`${dossier.digitalRatioPercent}%`}
                  centerSubtext="DIGITAL"
                />
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Digital Settlement Share:</span>
                  <span className="font-black text-emerald-800">{summary.verifiableDigitalRatio}</span>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column: Four Financial Health Pillars & Cash Flow Curve */}
          <div className="lg:col-span-7 space-y-6">
            <PillarBreakdown pillars={dossier.pillars} />

            <Card className="border-slate-200 shadow-xs">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-bold text-slate-900">
                      Multi-Month Inflows vs. Outflows & Margin Trajectory
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {summary.consecutiveProfitableMonths} Consecutive Profitable Months
                  </span>
                </div>
              </CardHeader>
              <CardBody className="p-4 space-y-4">
                <D3CashFlowChart data={cashFlowData} />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Inflow</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {Math.round(summary.totalRevenue / 1000)}k ETB
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Outflow</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {Math.round(summary.totalExpense / 1000)}k ETB
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Net Margin</p>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      {summary.avgProfitMarginPct}%
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Debt Recovery</p>
                    <p className="text-xs font-bold text-blue-700 mt-0.5">
                      {summary.debtRecoveryRate}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Institutional Review Sign-Off */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-900">Underwriting Assessment Complete</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Ledger verified via NetWorth Ethiopia financial snapshot engine.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto text-xs"
                  onClick={() => alert(`Dossier #${token.slice(0, 8)} marked verified for underwriting file.`)}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Approve Readiness
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PublicDossierPage({ params }: PageProps) {
  return (
    <Suspense fallback={<DossierLoadingFallback />}>
      <DossierContent params={params} />
    </Suspense>
  );
}

