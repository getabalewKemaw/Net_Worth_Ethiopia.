"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MfoOrgsList } from "@/components/admin/mfo-orgs-list";
import { D3QueryVelocityChart } from "@/components/charts/d3-query-velocity";
import { MOCK_MFO_ORGS } from "@/constants/mock-stats";

export default function AdminMfoPartnersPage() {
  return (
    <DashboardShell
      title="MFO Institutions & Query Billing"
      subtitle="Manage licensed microfinance organizations, subscription tiers, and query credit balances"
    >
      <div className="space-y-6">
        <D3QueryVelocityChart />
        <MfoOrgsList initialOrgs={MOCK_MFO_ORGS} />
      </div>
    </DashboardShell>
  );
}
