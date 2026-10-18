"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthSim } from "@/lib/auth-sim";
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Search,
  FileText,
  CreditCard,
  Layers,
} from "lucide-react";

function NavLinks() {
  const pathname = usePathname();
  const { currentUser } = useAuthSim();
  const isAdmin = currentUser.role === "admin";

  const adminNav = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "MFO Organizations", href: "/admin/mfo-partners", icon: Building2 },
    { label: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  const mfoNav = [
    { label: "Underwriting Hub", href: "/mfo", icon: LayoutDashboard },
    { label: "Merchant Lookup", href: "/mfo/lookup", icon: Search },
    { label: "Credit Dossiers", href: "/mfo/dossier/NW-78219", icon: FileText },
  ];

  const navItems = isAdmin ? adminNav : mfoNav;

  return (
    <div className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              isActive
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Icon className="w-4 h-4 shrink-0 text-slate-500" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const { currentUser } = useAuthSim();
  const isAdmin = currentUser.role === "admin";

  return (
    <aside className="w-60 border-r border-slate-200 bg-white flex flex-col shrink-0 h-screen sticky top-0 shadow-xs z-40">
      <div className="h-12 px-4 border-b border-slate-200 flex items-center gap-2.5 bg-slate-50/50">
        <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-2xs">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-black tracking-tight text-slate-900">
            NetWorth <span className="text-emerald-700">ET</span>
          </span>
          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500">
            {isAdmin ? "Admin Console" : "Bank / MFO Portal"}
          </p>
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto sidebar-scroll">
        <p className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </p>
        <Suspense fallback={<div className="h-28 rounded-lg bg-slate-100 animate-pulse" />}>
          <NavLinks />
        </Suspense>
      </nav>

      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Institution</span>
          </div>
          <p className="text-[11px] font-extrabold text-slate-900 mt-0.5 truncate">
            {currentUser.organization || "Enterprise Core"}
          </p>
        </div>
      </div>
    </aside>
  );
}
