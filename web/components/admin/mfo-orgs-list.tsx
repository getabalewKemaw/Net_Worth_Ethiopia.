"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, PlusCircle } from "lucide-react";
import type { MfoOrganization } from "@/types/mfo";

interface MfoOrgsListProps {
  initialOrgs: MfoOrganization[];
}

export function MfoOrgsList({ initialOrgs }: MfoOrgsListProps) {
  const [orgs, setOrgs] = useState(initialOrgs);

  const addCredits = (id: string, amount: number) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, queryCreditsRemaining: o.queryCreditsRemaining + amount } : o
      )
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orgs.map((org) => (
        <Card key={org.id} className="flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2.5 min-w-0">
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate" title={org.name}>
                  {org.name}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{org.licenseNo}</p>
              </div>
              <Badge
                variant={org.status === "active" ? "emerald" : "red"}
                className="shrink-0 uppercase text-[9px] tracking-wider font-extrabold"
              >
                {org.status}
              </Badge>
            </div>
            <CardBody className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subscription Plan:</span>
                <span className="font-bold text-slate-900 uppercase text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                  {org.subscriptionPlan.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Dossiers Pulled:</span>
                <span className="font-bold text-slate-900">
                  {org.totalPulls} queries
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Credits Balance</p>
                  <p className="text-sm font-extrabold text-emerald-800 mt-0.5">
                    {org.queryCreditsRemaining > 9000 ? "Unlimited" : `${org.queryCreditsRemaining} checks`}
                  </p>
                </div>
                <CreditCard className="w-4 h-4 text-slate-500" />
              </div>
            </CardBody>
          </div>
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-[11px]"
              onClick={() => addCredits(org.id, 25)}
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-700" /> Top Up (+25)
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
