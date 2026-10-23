import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "emerald" | "amber" | "slate" | "red" | "blue";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "slate", children, className }: BadgeProps) {
  const variants = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold",
    amber: "bg-amber-50 text-amber-800 border-amber-300 font-bold",
    slate: "bg-slate-100 text-slate-800 border-slate-300 font-medium",
    red: "bg-red-50 text-red-800 border-red-300 font-bold",
    blue: "bg-blue-50 text-blue-800 border-blue-300 font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border shadow-2xs whitespace-nowrap shrink-0",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
