"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ShieldAlert, KeyRound, ArrowRight } from "lucide-react";
import { MOCK_DOSSIERS } from "@/constants/mock-dossiers";

export default function MfoLookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (MOCK_DOSSIERS[clean]) {
      router.push(`/mfo/dossier/${clean}`);
    } else {
      setError(`No active dossier found for "${clean}". Try sample code "NW-78219" or "NW-34190".`);
    }
  };

  return (
    <DashboardShell
      title="Merchant Dossier Verification"
      subtitle="Enter the merchant's 8-character share code or verified taxpayer ID"
    >
      <div className="max-w-xl mx-auto space-y-6 pt-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-900">
                Enter Merchant Share Code
              </h3>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Share Access Code:
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
                    placeholder="e.g. NW-78219"
                    className="w-full pl-9 pr-4 py-2.5 text-sm uppercase font-mono font-bold tracking-wider rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-emerald-700 shadow-2xs"
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
                <span>Verify & Pull Audited Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Quick Test Codes:</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCode("NW-78219")}
                  className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold hover:bg-slate-200 cursor-pointer text-slate-800"
                >
                  NW-78219 (Mercato Wholesalers)
                </button>
                <button
                  type="button"
                  onClick={() => setCode("NW-34190")}
                  className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold hover:bg-slate-200 cursor-pointer text-slate-800"
                >
                  NW-34190 (Bole Boutique)
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
