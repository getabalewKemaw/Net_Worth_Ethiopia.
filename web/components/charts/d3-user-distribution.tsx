"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export interface UserRoleDistribution {
  role: string;
  label: string;
  count: number;
  sub: string;
  color: string;
  bg: string;
  cardBg: string;
}

const DEFAULT_DISTRIBUTION: UserRoleDistribution[] = [
  { role: "merchant", label: "Merchants", count: 1420, sub: "1,895 active branches", color: "#047857", bg: "#d1fae5", cardBg: "bg-emerald-50/50 border-emerald-200/70" },
  { role: "sales", label: "Sales Agents", count: 450, sub: "Field onboarding staff", color: "#334155", bg: "#e2e8f0", cardBg: "bg-slate-50 border-slate-200/80" },
  { role: "bank", label: "Bank / MFO", count: 28, sub: "Underwriting officers", color: "#1d4ed8", bg: "#dbeafe", cardBg: "bg-blue-50/50 border-blue-200/70" },
  { role: "admin", label: "Admins", count: 6, sub: "System operators", color: "#b45309", bg: "#fef3c7", cardBg: "bg-amber-50/50 border-amber-200/70" },
];

export function D3UserDistributionChart({
  distribution = DEFAULT_DISTRIBUTION,
}: {
  distribution?: UserRoleDistribution[];
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const total = distribution.reduce((acc, curr) => acc + curr.count, 0);
  const [activeRole, setActiveRole] = useState<string | null>(null);

  // 1. Initial Render & Geometry (Only runs when data changes, NEVER on hover)
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 560;
    const height = 44;
    const defs = svg.append("defs");

    distribution.forEach((item, i) => {
      const p = defs.append("pattern")
        .attr("id", `user-dist-diag-${i}`)
        .attr("width", 8).attr("height", 8)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("patternTransform", "rotate(45)");

      p.append("rect").attr("width", 8).attr("height", 8).attr("fill", item.bg);
      p.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 8)
        .attr("stroke", item.color).attr("stroke-width", 2.2).attr("stroke-opacity", 0.65);
    });

    let currentX = 0;
    distribution.forEach((item, i) => {
      const segWidth = Math.max(12, (item.count / total) * width);

      const g = svg.append("g")
        .datum(item)
        .attr("class", `user-segment user-seg-${item.role}`)
        .attr("cursor", "pointer")
        .on("mouseenter", () => setActiveRole(item.role))
        .on("mouseleave", () => setActiveRole(null));

      g.append("rect")
        .attr("x", currentX)
        .attr("y", 4)
        .attr("width", segWidth - 2)
        .attr("height", height - 8)
        .attr("rx", i === 0 || i === distribution.length - 1 ? 5 : 2)
        .attr("fill", `url(#user-dist-diag-${i})`)
        .attr("stroke", item.color)
        .attr("stroke-width", 1.5);

      if (segWidth > 50) {
        g.append("text")
          .attr("x", currentX + segWidth / 2)
          .attr("y", height / 2 + 3)
          .attr("text-anchor", "middle")
          .attr("fill", item.color)
          .attr("font-size", "11px")
          .attr("font-weight", "800")
          .text(`${((item.count / total) * 100).toFixed(1)}%`);
      }

      currentX += segWidth;
    });
  }, [distribution, total]);

  // 2. Smooth Hover Opacity Highlight (Modifies attributes only, NEVER deletes/re-renders DOM)
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    if (activeRole) {
      svg.selectAll<SVGGElement, UserRoleDistribution>(".user-segment")
        .transition().duration(120)
        .attr("opacity", (d) => (d.role === activeRole ? 1 : 0.35));
    } else {
      svg.selectAll(".user-segment")
        .transition().duration(120)
        .attr("opacity", 1);
    }
  }, [activeRole]);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Ecosystem Role Composition · {total.toLocaleString()} Verified Entities
        </span>
        <span className="text-[11px] font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 min-w-[210px] text-right">
          {activeRole
            ? `${distribution.find((d) => d.role === activeRole)?.label}: ${distribution.find((d) => d.role === activeRole)?.count.toLocaleString()} accounts`
            : "Hover segment to inspect role"}
        </span>
      </div>

      <div className="w-full overflow-hidden rounded-xl bg-slate-50 p-1.5 border border-slate-200 shadow-2xs">
        <svg ref={svgRef} viewBox="0 0 560 44" className="w-full h-11 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {distribution.map((item) => {
          const pct = ((item.count / total) * 100).toFixed(1);
          const isSelected = activeRole === item.role;
          return (
            <div
              key={item.role}
              onMouseEnter={() => setActiveRole(item.role)}
              onMouseLeave={() => setActiveRole(null)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${item.cardBg} ${
                isSelected ? "ring-2 ring-slate-400 shadow-xs" : "hover:shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">
                  {pct}%
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 mt-1">
                {item.count.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                {item.sub}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
