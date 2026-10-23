import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Award } from "lucide-react";

interface HealthGaugeProps {
  score: number;
  grade: "Grade A" | "Grade B" | "Grade C" | "Grade D";
}

export function HealthGauge({ score, grade }: HealthGaugeProps) {
  const getGradeColor = () => {
    switch (grade) {
      case "Grade A":
        return { text: "text-emerald-800", badge: "emerald" as const, desc: "Prime Loan Ready" };
      case "Grade B":
        return { text: "text-blue-800", badge: "blue" as const, desc: "Low Risk MSME" };
      case "Grade C":
        return { text: "text-amber-800", badge: "amber" as const, desc: "Moderate Risk" };
      default:
        return { text: "text-red-800", badge: "red" as const, desc: "Requires Collateral" };
    }
  };

  const info = getGradeColor();

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 bg-white shadow-xs text-center">
      <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-8 border-emerald-100 bg-emerald-50/50 shadow-inner">
        <div className="text-center">
          <span className={`text-4xl font-black tracking-tight ${info.text}`}>
            {score}
          </span>
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            / 100 PTS
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-emerald-700" />
        <Badge variant={info.badge} className="text-xs px-3 py-1 font-bold">
          {grade} · {info.desc}
        </Badge>
      </div>
      <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Verifiable Ledger-Backed Footprint
      </p>
    </div>
  );
}
