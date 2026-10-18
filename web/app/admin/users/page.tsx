"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UsersTable } from "@/components/admin/users-table";
import { D3UserDistributionChart } from "@/components/charts/d3-user-distribution";
import { Card, CardBody } from "@/components/ui/card";
import { MOCK_USERS_LIST } from "@/constants/mock-users";

export default function AdminUsersPage() {
  return (
    <DashboardShell
      title="User & Entity Management"
      subtitle="Inspect roles, operational statuses, and permissions across merchants, sales, and MFO officers"
    >
      <div className="space-y-6">
        <Card>
          <CardBody className="p-4">
            <D3UserDistributionChart />
          </CardBody>
        </Card>
        <UsersTable initialUsers={MOCK_USERS_LIST} />
      </div>
    </DashboardShell>
  );
}
