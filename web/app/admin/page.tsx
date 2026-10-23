"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { KpiStatCards } from "@/components/admin/kpi-stat-cards";
import { D3AreaChart, type DataPoint } from "@/components/charts/d3-area-chart";
import { D3DonutChart, type DonutItem } from "@/components/charts/d3-donut-chart";
import { D3UserDistributionChart, type UserRoleDistribution } from "@/components/charts/d3-user-distribution";
import { RecentMerchantsCard } from "@/components/admin/dashboard-recent-entities";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/store/admin-store";
import { Users, ArrowUpRight, TrendingUp, PieChart } from "lucide-react";

export default function AdminDashboardPage() {
  const { stats, users, fetchStats, fetchUsers } = useAdminStore();

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  const recentMerchants = users.slice(0, 5);

  const activeStats = stats || {
    totalMerchants: users.length,
    totalBranches: users.reduce((sum, u) => sum + (u.totalBranches || 1), 0),
    totalPlatformVolumeEtb: 0,
    digitalTrailShare: 0,
    activeDossiers: 0,
  };

  // 1. Dynamic Merchant Distribution from Real API Data
  const merchantCount = activeStats.totalMerchants ?? users.length;
  const branchCount = activeStats.totalBranches ?? 0;
  const dossierCount = activeStats.activeDossiers ?? 0;

  const userDistribution: UserRoleDistribution[] = [
    {
      role: "merchant",
      label: "Business Owners",
      count: merchantCount,
      sub: `${branchCount} active operating branches`,
      color: "#047857",
      bg: "#d1fae5",
      cardBg: "bg-emerald-50/50 border-emerald-200/70",
    },
    {
      role: "branches",
      label: "Operating Branches",
      count: branchCount,
      sub: "Physical & retail storefronts",
      color: "#2563eb",
      bg: "#dbeafe",
      cardBg: "bg-blue-50/50 border-blue-200/70",
    },
    {
      role: "dossiers",
      label: "Shared Dossiers",
      count: dossierCount,
      sub: "Active verified credit links",
      color: "#0d9488",
      bg: "#ccfbf1",
      cardBg: "bg-teal-50/50 border-teal-200/70",
    },
    {
      role: "admin",
      label: "Superadmins",
      count: 1,
      sub: "Central platform console",
      color: "#b45309",
      bg: "#fef3c7",
      cardBg: "bg-amber-50/50 border-amber-200/70",
    },
  ];

  // 2. Real Platform GTV Curve from API Snapshots
  const platformVol = activeStats.totalPlatformVolumeEtb || 0;
  const volUnit = platformVol >= 1_000_000 ? "M" : "k";
  const areaChartData: DataPoint[] = stats?.trends && stats.trends.length > 0 ? stats.trends : [];

  // 3. Real Digital Settlement Composition from API Snapshots
  const digitalPct = activeStats.digitalTrailShare ?? 0;
  const donutSegments: DonutItem[] =
    stats?.settlementBreakdown &&
    (stats.settlementBreakdown.telebirrShare > 0 ||
      stats.settlementBreakdown.cbeShare > 0 ||
      stats.settlementBreakdown.cashShare > 0)
      ? [
          { label: "Telebirr", value: stats.settlementBreakdown.telebirrShare, color: "#047857", bg: "#ecfdf5" },
          { label: "CBE Birr", value: stats.settlementBreakdown.cbeShare, color: "#2563eb", bg: "#eff6ff" },
          { label: "Cash", value: stats.settlementBreakdown.cashShare, color: "#d97706", bg: "#fffbeb" },
        ].filter((s) => s.value > 0)
      : [];

  return (
    <DashboardShell
      title="Platform Operations Overview"
      subtitle="Real-time ecosystem metrics across registered merchants, branches, and ledger activity"
    >
      <div className="space-y-6">
        <KpiStatCards stats={activeStats} />

        {/* User Distribution Graph in Main Dashboard */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-900">
                Ecosystem Merchant Distribution & Growth Velocity
              </h3>
            </div>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-xs">
                <span>Manage Business Owners</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardBody className="p-4">
            <D3UserDistributionChart distribution={userDistribution} />
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
                    Gross Ecosystem Cash Flow Velocity (ETB)
                  </h3>
                </div>
              </CardHeader>
              <CardBody className="p-4">
                <D3AreaChart data={areaChartData} unit={volUnit} />
              </CardBody>
            </Card>

            <RecentMerchantsCard merchants={recentMerchants} />
          </div>

          {/* Right Column (5/12) */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Settlement Method Composition
                  </h3>
                </div>
              </CardHeader>
              <CardBody className="p-4">
                <D3DonutChart
                  segments={donutSegments}
                  centerText={`${digitalPct}%`}
                  centerSubtext="DIGITAL"
                />
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Digital vs Cash Share:</span>
                  <span className="font-bold text-emerald-800">
                    {digitalPct > 0 ? `${digitalPct}% Digital (Telebirr & CBE)` : "0% (No transactions recorded)"}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
