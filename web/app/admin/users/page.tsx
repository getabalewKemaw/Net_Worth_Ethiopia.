"use client";

import React, { useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UsersTable } from "@/components/admin/users-table";
import { D3UserDistributionChart, type UserRoleDistribution } from "@/components/charts/d3-user-distribution";
import { Card, CardBody } from "@/components/ui/card";
import { useAdminStore } from "@/store/admin-store";

export default function AdminUsersPage() {
  const { stats, users, fetchStats, fetchUsers } = useAdminStore();

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  const merchantCount = stats?.totalMerchants || users.length || 0;
  const branchCount = stats?.totalBranches || users.reduce((sum, u) => sum + (u.totalBranches || 1), 0);
  const dossierCount = stats?.activeDossiers || 0;

  const distribution: UserRoleDistribution[] = [
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

  return (
    <DashboardShell
      title="Business Owner Management"
      subtitle="Inspect registered merchants, verify operating locations, and manage platform account statuses"
    >
      <div className="space-y-6">
        <Card>
          <CardBody className="p-4">
            <D3UserDistributionChart distribution={distribution} />
          </CardBody>
        </Card>
        <UsersTable />
      </div>
    </DashboardShell>
  );
}
