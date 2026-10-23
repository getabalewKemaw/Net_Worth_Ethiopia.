"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSim } from "@/lib/auth-sim";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Building2,
  ArrowRight,
  Lock,
  Layers,
  CheckCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { switchPersona } = useAuthSim();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const handleQuickLogin = (role: "admin" | "wasasa" | "cbe") => {
    switchPersona(role);
    if (role === "admin") router.push("/admin");
    else router.push("/mfo");
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "admin123") {
      handleQuickLogin("admin");
    } else if (passcode === "mfo123") {
      handleQuickLogin("wasasa");
    } else {
      setError("Invalid passcode. Use 'admin123' for Admin or 'mfo123' for MFO.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 max-w-5xl mx-auto w-full font-sans">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900">
              NetWorth <span className="text-emerald-700">Ethiopia</span>
            </span>
            <p className="text-[11px] font-semibold text-slate-500">Enterprise Operations Portal</p>
          </div>
        </div>
      </header>

      <main className="my-auto py-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Role Access Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
            Simulated authentication environment for central administration and microfinance loan underwriting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Admin Card */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Central Admin Console</h2>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Manage all registered merchants, view ecosystem transaction volume, monitor MFO subscriptions, and tune platform rules.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Button className="w-full justify-between" onClick={() => handleQuickLogin("admin")}>
                <span>Sign In as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* MFO Underwriter Card */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Bank & MFO Portal</h2>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Look up merchant share codes, inspect audited financial health dossiers, review Telebirr & CBE digital trails, and approve debt.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <Button className="w-full justify-between" variant="secondary" onClick={() => handleQuickLogin("wasasa")}>
                <span>Wasasa Microfinance</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline" onClick={() => handleQuickLogin("cbe")}>
                <span>Commercial Bank of Ethiopia</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Passcode fallback */}
        <form onSubmit={handlePasscodeSubmit} className="mt-8 max-w-sm mx-auto flex gap-2">
          <input
            type="password"
            placeholder="Or enter passcode (admin123 / mfo123)"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-emerald-700 shadow-2xs"
          />
          <Button type="submit" size="sm">
            <Lock className="w-3.5 h-3.5" /> Unlock
          </Button>
        </form>
        {error && <p className="text-xs text-red-600 text-center mt-2 font-bold">{error}</p>}
      </main>

      <footer className="text-center py-4 text-xs text-slate-500 font-medium border-t border-slate-200 flex items-center justify-center gap-1.5">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
        <span>NetWorth Ethiopia · National Microfinance Ledger Network</span>
      </footer>
    </div>
  );
}
