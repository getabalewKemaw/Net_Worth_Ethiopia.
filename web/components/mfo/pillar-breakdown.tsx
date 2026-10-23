import React from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { D3PillarRadarChart } from "@/components/charts/d3-pillar-radar";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { FinancialPillar } from "@/types/mfo";

interface PillarBreakdownProps {
  pillars: FinancialPillar[];
}

export function PillarBreakdown({ pillars }: PillarBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="text-xs font-bold text-slate-900">
            Four Financial Health Pillars & Audit Radar
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Weighted assessment of creditworthiness vs. institutional underwriting threshold
          </p>
        </div>
      </CardHeader>
      <CardBody className="p-4 space-y-4">
        <D3PillarRadarChart pillars={pillars} />

        <div className="space-y-3 pt-3 border-t border-slate-100">
          {pillars.map((p) => {
            const percent = Math.round((p.score / p.weight) * 100);
            const isStrong = p.status === "strong";
            return (
              <div key={p.title} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    {isStrong ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {p.title}
                  </span>
                  <span className="font-bold text-slate-800">
                    {p.score} / {p.weight} pts{" "}
                    <span className="text-[10px] text-slate-500 font-semibold">({percent}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percent >= 80 ? "bg-emerald-700" : percent >= 60 ? "bg-blue-600" : "bg-amber-500"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{p.description}</p>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
