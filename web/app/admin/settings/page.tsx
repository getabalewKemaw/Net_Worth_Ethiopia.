"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { MOCK_SYSTEM_SETTINGS } from "@/constants/mock-stats";

export default function AdminSettingsPage() {
  return (
    <DashboardShell
      title="System Configuration & Scoring Rules"
      subtitle="Tune credit scoring thresholds, payment parsing multipliers, and platform maintenance toggles"
    >
      <div className="space-y-6">
        <SettingsForm initialSettings={MOCK_SYSTEM_SETTINGS} />
      </div>
    </DashboardShell>
  );
}
