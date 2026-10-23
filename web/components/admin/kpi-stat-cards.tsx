import React from "react";
import { Card, CardBody } from "@/components/ui/card";
import type { PlatformStats } from "@/types/admin";

interface KpiStatCardsProps {
  stats: PlatformStats;
}

export function KpiStatCards({ stats }: KpiStatCardsProps) {
  const vol = stats.totalPlatformVolumeEtb ?? stats.totalGtvEtb ?? 0;
  const isMillions = vol >= 1_000_000;
  const gtvFormatted = vol === 0 ? "0" : isMillions ? `${(vol / 1_000_000).toFixed(1)}M` : `${Math.round(vol / 1000)}k`;
  const activeDossiers = stats.activeDossiers ?? 0;
  const digitalShare = stats.digitalTrailShare ?? 0;

  const cards = [
    {
      label: "Total Merchants",
      value: (stats.totalMerchants ?? 0).toLocaleString(),
      unit: "",
      subValue: `${stats.totalBranches ?? 0} operating branches`,
      bg: "bg-emerald-50/50 border-emerald-200/70",
    },
    {
      label: "Gross Ecosystem GTV",
      value: gtvFormatted,
      unit: "ETB",
      subValue: vol === 0 ? "No transaction volume recorded" : "Cumulative transaction volume",
      bg: "bg-blue-50/50 border-blue-200/70",
    },
    {
      label: "Digital Trail Ratio",
      value: `${digitalShare}%`,
      unit: "",
      subValue: digitalShare === 0 ? "No digital inflows recorded" : "Telebirr & CBE digital inflows",
      bg: "bg-amber-50/50 border-amber-200/70",
    },
    {
      label: "Active Loan Dossiers",
      value: activeDossiers.toLocaleString(),
      unit: "tokens",
      subValue: activeDossiers === 0 ? "No active shared links" : "Verified shared underwriter links",
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
