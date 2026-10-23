"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import type { SystemSetting } from "@/types/admin";

const DEFAULT_SYSTEM_SETTINGS: SystemSetting[] = [
  {
    key: "maintenance_mode",
    label: "Platform Maintenance Mode",
    value: false,
    description: "Temporarily pause mobile text-fetching and merchant write syncs",
    category: "general",
  },
  {
    key: "health_score_grade_a",
    label: "Grade A Health Score Minimum",
    value: 80,
    description: "Minimum aggregate score required for prime underwriter loan tier eligibility",
    category: "health_scoring",
  },
  {
    key: "telebirr_cbe_digital_weight",
    label: "Digital Transaction Multiplier",
    value: 1.25,
    description: "Credit boost multiplier for verified Telebirr & CBE digital inflows",
    category: "health_scoring",
  },
];

export default function AdminSettingsPage() {
  return (
    <DashboardShell
      title="System Configuration & Scoring Rules"
      subtitle="Tune credit scoring thresholds, payment parsing multipliers, and platform maintenance toggles"
    >
      <div className="space-y-6">
        <SettingsForm initialSettings={DEFAULT_SYSTEM_SETTINGS} />
      </div>
    </DashboardShell>
  );
}

