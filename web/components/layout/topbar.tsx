"use client";

import React from "react";
import { AccountDropdown } from "./account-dropdown";
import { ShieldCheck } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="h-12 px-5 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div>
          <h1 className="text-xs font-bold text-slate-900 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] text-slate-500 font-medium truncate max-w-sm sm:max-w-md">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <AccountDropdown />
      </div>
    </header>
  );
}
