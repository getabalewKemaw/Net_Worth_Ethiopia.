"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/admin-store";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Search,
  ArrowRight,
  Layers,
  Lock,
  Mail,
  AlertCircle,
  FileCheck2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error: adminAuthError } = useAdminStore();

  // Public Dossier Verification state
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState("");

  // Admin Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) {
      setTokenError("Please enter a valid share token or link.");
      return;
    }
    // If user pasted a full URL (e.g. http://.../dossier/abc), extract the token
    const token = clean.includes("/") ? clean.split("/").pop() || clean : clean;
    router.push(`/dossier/${token}`);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Please enter your admin email and password.");
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.push("/admin");
    } else {
      setLoginError(adminAuthError || "Invalid admin credentials");
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
            <p className="text-[11px] font-semibold text-slate-500">
              Enterprise Operations & Underwriting Portal
            </p>
          </div>
        </div>
      </header>

      <main className="my-auto py-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Central Portal & Verification Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
            Inspect an audited credit dossier using a merchant&apos;s shared link, or sign in as Superadmin to manage platform operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Card 1: Public Dossier Verification (NO LOGIN REQUIRED FOR BANKS) */}
          <div className="p-6 rounded-2xl border border-emerald-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Verify Credit Dossier</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  No Login Required
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Banks and loan officers: Paste the share link or token received from a business owner to inspect their certified financial health records.
              </p>

              <form onSubmit={handleLookupSubmit} className="mt-5 space-y-3">
                <div className="relative">
                  <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Paste verification link or token..."
                    value={tokenInput}
                    onChange={(e) => {
                      setTokenInput(e.target.value);
                      setTokenError("");
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-emerald-700 shadow-2xs font-mono"
                  />
                </div>
                {tokenError && (
                  <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {tokenError}
                  </p>
                )}
                <Button type="submit" className="w-full justify-between" size="sm">
                  <span>Open Audited Dossier</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Read-only ledger snapshot generated directly by registered merchants.
            </div>
          </div>

          {/* Card 2: Real Admin Login */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Central Admin Sign-In</h2>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Authorized superadmins: Sign in to manage registered merchants, monitor ecosystem volumes, and tune platform rules.
              </p>

              <form onSubmit={handleAdminLogin} className="mt-4 space-y-3">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="Admin Email (e.g. admin1g@gmail.com)"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError("");
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-emerald-700 shadow-2xs"
                  />
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Admin Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError("");
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-emerald-700 shadow-2xs"
                  />
                </div>
                {(loginError || adminAuthError) && (
                  <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {loginError || adminAuthError}
                  </p>
                )}
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full justify-between font-bold"
                  size="sm"
                  disabled={isLoading}
                >
                  <span>{isLoading ? "Authenticating..." : "Sign In to Admin Console"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Restricted to authorized system superadministrators.
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-500 font-medium border-t border-slate-200">
        NetWorth Ethiopia · Official Financial Health & Loan Underwriting Network
      </footer>
    </div>
  );
}
