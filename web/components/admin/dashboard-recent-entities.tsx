import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowUpRight } from "lucide-react";
import type { UserRecord } from "@/types/admin";

export function RecentMerchantsCard({ merchants }: { merchants: UserRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-bold text-slate-900">
            Recent Registered Merchants
          </h3>
        </div>
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" className="text-xs">
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardBody className="p-0 divide-y divide-slate-100 text-xs">
        {merchants.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs font-medium">
            No registered merchants recorded in database yet (0).
          </div>
        ) : (
          merchants.map((m) => {
            const store = m.primaryBusiness || m.businessName || "No enterprise assigned";
            const branches = m.totalBranches ?? m.branchCount ?? 0;
            return (
              <div key={m.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{m.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{store}</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {branches} branch{branches !== 1 ? "es" : ""}
                </span>
              </div>
            );
          })
        )}
      </CardBody>
    </Card>
  );
}
