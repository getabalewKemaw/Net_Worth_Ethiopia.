"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/store/admin-store";
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAdminStore();

  const adminNav = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Business Owners", href: "/admin/users", icon: Users },
    { label: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="w-60 border-r border-slate-200 bg-white flex flex-col shrink-0 h-screen sticky top-0 shadow-xs z-40">
      <div className="h-12 px-4 border-b border-slate-200 flex items-center gap-2.5 bg-slate-50/50">
        <Image
          src="/logo.png"
          alt="NetWorth ET"
          width={28}
          height={28}
          className="rounded-lg shadow-2xs object-contain shrink-0"
        />
        <div>
          <span className="text-xs font-black tracking-tight text-slate-900">
            NetWorth <span className="text-emerald-700">ET</span>
          </span>
          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500">
            Central Admin Console
          </p>
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto sidebar-scroll">
        <p className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Management
        </p>
        <div className="space-y-1">
          {adminNav.map((item) => {
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
      </nav>

      <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <div className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Superadmin</span>
          </div>
          <p className="text-[11px] font-extrabold text-slate-900 mt-0.5 truncate">
            {currentUser?.email || "admin@networth.et"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors text-xs font-bold cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
