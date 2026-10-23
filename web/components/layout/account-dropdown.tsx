"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Shield, Building2, LogOut } from "lucide-react";
import { useAuthSim } from "@/lib/auth-sim";
import { useRouter } from "next/navigation";

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, switchPersona, logout } = useAuthSim();
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

  const handleSelect = (key: "admin" | "wasasa" | "cbe") => {
    switchPersona(key);
    setIsOpen(false);
    if (key === "admin") router.push("/admin");
    else router.push("/mfo");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
          {currentUser.avatarText}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold leading-tight text-slate-900">{currentUser.name}</p>
          <p className="text-[10px] text-slate-500 font-medium capitalize">{currentUser.role === "bank" ? "MFO Underwriter" : currentUser.role}</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 text-xs">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="font-bold text-slate-900">{currentUser.organization}</p>
            <p className="text-slate-500 text-[11px]">{currentUser.email}</p>
          </div>
          <div className="py-1">
            <p className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">Switch Persona</p>
            <button onClick={() => handleSelect("admin")} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700 font-medium cursor-pointer">
              <Shield className="w-3.5 h-3.5 text-emerald-700" /> System Admin
            </button>
            <button onClick={() => handleSelect("wasasa")} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700 font-medium cursor-pointer">
              <Building2 className="w-3.5 h-3.5 text-blue-700" /> Wasasa MFO Officer
            </button>
            <button onClick={() => handleSelect("cbe")} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700 font-medium cursor-pointer">
              <Building2 className="w-3.5 h-3.5 text-amber-700" /> CBE MSME Lead
            </button>
          </div>
          <div className="pt-1 border-t border-slate-100">
            <button onClick={() => { logout(); router.push("/"); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 font-medium rounded-lg cursor-pointer">
              <LogOut className="w-3.5 h-3.5" /> Return to Switcher
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
