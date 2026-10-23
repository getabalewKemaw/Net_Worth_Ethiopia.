"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, ArrowUpRight } from "lucide-react";
import type { UserRecord } from "@/types/admin";
import type { MfoOrganization } from "@/types/mfo";

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
        {merchants.map((m) => (
          <div key={m.id} className="p-3.5 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">{m.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">{m.businessName}</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {m.branchCount} branches
            </span>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

export function EnrolledMfoCard({ orgs }: { orgs: MfoOrganization[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-bold text-slate-900">
            Enrolled MFO Organizations
          </h3>
        </div>
        <Link href="/admin/mfo-partners">
          <Button variant="ghost" size="sm" className="text-xs">
            <span>Manage</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardBody className="p-0 divide-y divide-slate-100 text-xs">
        {orgs.map((org) => (
          <div key={org.id} className="p-3.5 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">{org.name}</p>
              <p className="text-[10px] text-slate-500 font-medium">{org.licenseNo}</p>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-slate-900">{org.totalPulls} pulls</p>
              <p className="text-[10px] text-emerald-700 font-bold uppercase">
                {org.subscriptionPlan.replace("_", " ")}
              </p>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
