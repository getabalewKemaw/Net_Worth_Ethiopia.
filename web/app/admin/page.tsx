"use client";

import React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { KpiStatCards } from "@/components/admin/kpi-stat-cards";
import { D3AreaChart } from "@/components/charts/d3-area-chart";
import { D3DonutChart } from "@/components/charts/d3-donut-chart";
import { D3UserDistributionChart } from "@/components/charts/d3-user-distribution";
import { RecentMerchantsCard, EnrolledMfoCard } from "@/components/admin/dashboard-recent-entities";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_PLATFORM_STATS, MOCK_MFO_ORGS } from "@/constants/mock-stats";
import { MOCK_USERS_LIST } from "@/constants/mock-users";
import { Users, ArrowUpRight, TrendingUp, PieChart } from "lucide-react";

export default function AdminDashboardPage() {
  const recentMerchants = MOCK_USERS_LIST.filter((u) => u.role === "merchant").slice(0, 3);

  return (
    <DashboardShell
      title="Platform Operations Overview"
      subtitle="Real-time ecosystem metrics across merchants, branches, and MFO institutions"
    >
      <div className="space-y-6">
        <KpiStatCards stats={MOCK_PLATFORM_STATS} />

        {/* User Distribution Graph in Main Dashboard */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-900">
                Ecosystem User Distribution & Role Composition
              </h3>
            </div>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-xs">
                <span>Manage Users</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardBody className="p-4">
            <D3UserDistributionChart />
          </CardBody>
        </Card>

        {/* 2-Column Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Gross Ecosystem GTV Growth (Million ETB)
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  +18.4% MoM
                </span>
              </CardHeader>
              <CardBody className="p-4">
                <D3AreaChart />
              </CardBody>
            </Card>

            <RecentMerchantsCard merchants={recentMerchants} />
          </div>

          {/* Right Column (5/12) */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-blue-700" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Payment Channel Breakdown
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Verified Trails</span>
              </CardHeader>
              <CardBody className="p-5">
                <D3DonutChart />
              </CardBody>
            </Card>

            <EnrolledMfoCard orgs={MOCK_MFO_ORGS} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
