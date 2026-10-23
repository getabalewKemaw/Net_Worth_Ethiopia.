import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary:
      "bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs font-semibold",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-semibold",
    outline:
      "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs font-semibold",
    ghost:
      "hover:bg-slate-100 text-slate-700",
    danger:
      "bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
