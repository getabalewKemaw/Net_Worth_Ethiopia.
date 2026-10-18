import React from "react";
import { Card, CardBody } from "@/components/ui/card";
import type { PlatformStats } from "@/types/admin";

interface KpiStatCardsProps {
  stats: PlatformStats;
}

export function KpiStatCards({ stats }: KpiStatCardsProps) {
  const cards = [
    {
      label: "Total Merchants",
      value: stats.totalMerchants.toLocaleString(),
      unit: "",
      subValue: `${stats.totalBranches} operating branches`,
      bg: "bg-emerald-50/50 border-emerald-200/70",
    },
    {
      label: "Gross Ecosystem GTV",
      value: `${(stats.totalGtvEtb / 1000000).toFixed(1)}M`,
      unit: "ETB",
      subValue: "Cumulative transaction volume",
      bg: "bg-blue-50/50 border-blue-200/70",
    },
    {
      label: "Digital Trail Ratio",
      value: `${stats.digitalTrailShare}%`,
      unit: "",
      subValue: "Telebirr & CBE digital inflows",
      bg: "bg-amber-50/50 border-amber-200/70",
    },
    {
      label: "MFO Credit Queries",
      value: stats.monthlyPulls.toLocaleString(),
      unit: "pulls",
      subValue: `Across ${stats.activeMfoPartners} partner institutions`,
      bg: "bg-purple-50/50 border-purple-200/70",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className={`${c.bg} shadow-2xs transition-all hover:shadow-xs`}>
          <CardBody className="p-4 flex flex-col justify-between min-h-[105px]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {c.label}
              </p>
              <div className="flex items-baseline gap-1 mt-1.5 whitespace-nowrap">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  {c.value}
                </span>
                {c.unit && (
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {c.unit}
                  </span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-600 font-medium mt-2 pt-2 border-t border-slate-200/60 truncate">
              {c.subValue}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
