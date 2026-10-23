"use client";

import React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthSim } from "@/lib/auth-sim";
import { D3PortfolioScatter } from "@/components/charts/d3-portfolio-scatter";
import { Search, CreditCard, FileCheck, ArrowRight } from "lucide-react";
import { MOCK_DOSSIERS } from "@/constants/mock-dossiers";

export default function MfoDashboardPage() {
  const { currentUser } = useAuthSim();
  const sampleDossiers = Object.values(MOCK_DOSSIERS);

  return (
    <DashboardShell
      title="MSME Underwriting & Credit Review Hub"
      subtitle={`Authenticated as ${currentUser.organization} · ${currentUser.jobTitle}`}
    >
      <div className="space-y-6">
        {/* Banner with Query Balance */}
        <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Institutional Underwriting License
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Authorized to inspect merchant sales, digital trails & Dube recovery ledgers
              </p>
            </div>
          </div>
          <Link href="/mfo/lookup">
            <Button size="sm">
              <Search className="w-3.5 h-3.5" /> Lookup Merchant Dossier
            </Button>
          </Link>
        </div>

        {/* Risk vs Debt Capacity Scatter Matrix */}
        <D3PortfolioScatter />

        {/* Recently Shared Dossiers */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-900">
                Active Merchant Loan Dossiers
              </h3>
            </div>
          </CardHeader>
          <CardBody className="p-0 divide-y divide-slate-100 text-xs">
            {sampleDossiers.map((d) => (
              <div key={d.shareCode} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{d.businessName}</p>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Score: {d.healthScore}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    TIN: {d.tin} · Code: <span className="font-mono font-bold text-slate-800">{d.shareCode}</span> · {d.city}
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Safe Capacity</p>
                    <p className="font-extrabold text-slate-900">
                      {d.recommendedLoanEtb.toLocaleString()} ETB
                    </p>
                  </div>
                  <Link href={`/mfo/dossier/${d.shareCode}`}>
                    <Button variant="outline" size="sm">
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
