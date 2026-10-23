"use client";

import React, { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { HealthGauge } from "@/components/mfo/health-gauge";
import { LoanCapacityCard } from "@/components/mfo/loan-capacity-card";
import { PillarBreakdown } from "@/components/mfo/pillar-breakdown";
import { UnderwriterActions } from "@/components/mfo/underwriter-actions";
import { D3DonutChart } from "@/components/charts/d3-donut-chart";
import { D3CashFlowChart } from "@/components/charts/d3-cashflow-chart";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_DOSSIERS } from "@/constants/mock-dossiers";
import { Building2, ArrowLeft, Calendar, MapPin, PieChart, TrendingUp } from "lucide-react";

function DossierContent() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase() || "NW-78219";
  const dossier = MOCK_DOSSIERS[code] || MOCK_DOSSIERS["NW-78219"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.push("/mfo")}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Hub
        </Button>
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5" /> Valid until {dossier.expiresAt}
        </div>
      </div>

      <Card className="bg-white border-slate-200">
        <CardBody className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{dossier.businessName}</p>
              <p className="text-[11px] text-slate-500 font-medium">Owner: {dossier.ownerName} · {dossier.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-700 font-medium">
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">TIN: {dossier.tin}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {dossier.city}</span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[11px]">
              {dossier.branchCount} Active Branches
            </span>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          <HealthGauge score={dossier.healthScore} grade={dossier.ratingGrade} />
          <LoanCapacityCard
            recommendedLoanEtb={dossier.recommendedLoanEtb}
            monthlyRevenueEtb={dossier.monthlyRevenueEtb}
            digitalRatioPercent={dossier.digitalRatioPercent}
            avgDubeDays={dossier.avgDubeDays}
          />
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-slate-900">Verified Payment Footprint</h4>
              </div>
            </CardHeader>
            <CardBody className="p-4">
              <D3DonutChart />
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <PillarBreakdown pillars={dossier.pillars} />
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  6-Month Cash Flow Volatility & Debt Coverage (DSCR)
                </h4>
              </div>
            </CardHeader>
            <CardBody className="p-4">
              <D3CashFlowChart />
            </CardBody>
          </Card>
          <UnderwriterActions />
        </div>
      </div>
    </div>
  );
}

export default function DossierDetailPage() {
  return (
    <DashboardShell
      title="Financial Health & Loan Underwriting Dossier"
      subtitle="Verified credit scoring based on verifiable ledger history"
    >
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-medium">Loading audited dossier...</div>}>
        <DossierContent />
      </Suspense>
    </DashboardShell>
  );
}
