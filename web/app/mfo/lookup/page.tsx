"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ShieldAlert, KeyRound, ArrowRight } from "lucide-react";

export default function MfoLookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim();
    if (clean) {
      router.push(`/dossier/${clean}`);
    } else {
      setError("Please enter a verified share token.");
    }
  };

  return (
    <DashboardShell
      title="Merchant Dossier Verification"
      subtitle="Enter the verified token provided by the business owner"
    >
      <div className="max-w-xl mx-auto space-y-6 pt-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-900">
                Enter Dossier Share Token
              </h3>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Verification Token:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError("");
                    }}
                    placeholder="e.g. 1a2b3c4d5e6f7g8h"
                    className="w-full pl-9 pr-4 py-2.5 text-sm font-mono font-bold tracking-wider rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-emerald-700 shadow-2xs"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full">
                <span>Inspect Verified Credit Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
