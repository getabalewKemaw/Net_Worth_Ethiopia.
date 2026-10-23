"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ShieldCheck, LogOut } from "lucide-react";
import { useAdminStore } from "@/store/admin-store";
import { useRouter } from "next/navigation";

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAdminStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/");
  };

  const adminName = currentUser?.name || "Super Administrator";
  const adminEmail = currentUser?.email || "admin@networth.et";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
          SA
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold leading-tight text-slate-900">{adminName}</p>
          <p className="text-[10px] text-slate-500 font-medium capitalize">Platform Admin</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 text-xs">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{adminName}</span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5 truncate">{adminEmail}</p>
          </div>
          <div className="pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 font-semibold rounded-lg cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
