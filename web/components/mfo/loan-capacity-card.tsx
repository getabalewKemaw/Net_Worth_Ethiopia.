import React from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Landmark, TrendingUp, Smartphone, Clock } from "lucide-react";

interface LoanCapacityCardProps {
  recommendedLoanEtb: number;
  monthlyRevenueEtb: number;
  digitalRatioPercent: number;
  avgDubeDays: number;
}

export function LoanCapacityCard({
  recommendedLoanEtb,
  monthlyRevenueEtb,
  digitalRatioPercent,
  avgDubeDays,
}: LoanCapacityCardProps) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/20">
      <CardBody className="p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800">
            <Landmark className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Recommended Safe Loan Capacity
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {recommendedLoanEtb.toLocaleString()}{" "}
            <span className="text-sm font-bold text-slate-600">ETB</span>
          </p>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">
            Based on verifiable 6-mo cashflow, Telebirr digital share & Dube recovery tenure
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 text-xs">
          <div>
            <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-600" /> Mo. Revenue
            </p>
            <p className="font-bold text-slate-900 mt-0.5">
              {(monthlyRevenueEtb / 1000).toFixed(0)}k ETB
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-600" /> Digital Trail
            </p>
            <p className="font-bold text-slate-900 mt-0.5">
              {digitalRatioPercent}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" /> Repay Velocity
            </p>
            <p className="font-bold text-slate-900 mt-0.5">
              {avgDubeDays} days
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
