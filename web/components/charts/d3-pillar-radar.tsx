"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { FinancialPillar } from "@/types/mfo";

export function D3PillarRadarChart({ pillars }: { pillars: FinancialPillar[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<FinancialPillar | null>(null);

  useEffect(() => {
    if (!svgRef.current || !pillars.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 280;
    const height = 240;
    const radius = 75;
    const center = { x: width / 2, y: height / 2 };

    const defs = svg.append("defs");
    const pattern = defs.append("pattern")
      .attr("id", "radar-diag-pattern")
      .attr("width", 8).attr("height", 8)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("patternTransform", "rotate(45)");

    pattern.append("rect").attr("width", 8).attr("height", 8).attr("fill", "#d1fae5");
    pattern.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 8)
      .attr("stroke", "#047857").attr("stroke-width", 2).attr("stroke-opacity", 0.6);

    const angleSlice = (Math.PI * 2) / pillars.length;

    // Concentric Web Rings
    [0.35, 0.7, 1.0].forEach((level) => {
      const ringPoints = pillars.map((_, i) => {
        const r = radius * level;
        const angle = i * angleSlice - Math.PI / 2;
        return `${center.x + r * Math.cos(angle)},${center.y + r * Math.sin(angle)}`;
      }).join(" ");
      svg.append("polygon")
        .attr("points", ringPoints)
        .attr("fill", level === 1 ? "#f8fafc" : "none")
        .attr("stroke", "#e2e8f0").attr("stroke-width", 1);
    });

    // Axis Lines & Labels
    pillars.forEach((p, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x2 = center.x + radius * Math.cos(angle);
      const y2 = center.y + radius * Math.sin(angle);
      svg.append("line")
        .attr("x1", center.x).attr("y1", center.y).attr("x2", x2).attr("y2", y2)
        .attr("stroke", "#cbd5e1").attr("stroke-width", 1);

      const labelDist = radius + 22;
      const lx = center.x + labelDist * Math.cos(angle);
      const ly = center.y + labelDist * Math.sin(angle);
      svg.append("text")
        .attr("x", lx).attr("y", ly)
        .attr("text-anchor", "middle").attr("dominant-baseline", "central")
        .attr("font-size", "9px").attr("font-weight", "700").attr("fill", "#475569")
        .text(p.title.split(" ")[0]);
    });

    // MFO Baseline Threshold (70%)
    const baselinePoints = pillars.map((_, i) => {
      const r = radius * 0.7;
      const angle = i * angleSlice - Math.PI / 2;
      return `${center.x + r * Math.cos(angle)},${center.y + r * Math.sin(angle)}`;
    }).join(" ");
    svg.append("polygon")
      .attr("points", baselinePoints)
      .attr("fill", "none").attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3");

    // Actual Merchant Polygon
    const actualPoints = pillars.map((p, i) => {
      const scoreRatio = Math.min(1, p.score / p.weight);
      const r = radius * scoreRatio;
      const angle = i * angleSlice - Math.PI / 2;
      return `${center.x + r * Math.cos(angle)},${center.y + r * Math.sin(angle)}`;
    }).join(" ");
    svg.append("polygon")
      .attr("points", actualPoints)
      .attr("fill", "url(#radar-diag-pattern)")
      .attr("stroke", "#047857").attr("stroke-width", 2);

    // Endpoint Dots
    pillars.forEach((p, i) => {
      const scoreRatio = Math.min(1, p.score / p.weight);
      const r = radius * scoreRatio;
      const angle = i * angleSlice - Math.PI / 2;
      const cx = center.x + r * Math.cos(angle);
      const cy = center.y + r * Math.sin(angle);
      svg.append("circle")
        .attr("cx", cx).attr("cy", cy).attr("r", 4.5)
        .attr("fill", "#ffffff").attr("stroke", "#047857").attr("stroke-width", 2)
        .attr("cursor", "pointer")
        .on("mouseenter", () => setHovered(p))
        .on("mouseleave", () => setHovered(null));
    });
  }, [pillars]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} viewBox="0 0 280 240" className="w-full max-w-[280px] h-auto" />
      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 mt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs border border-emerald-700 bg-emerald-100" /> Merchant Score
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-b border-dashed border-slate-400" /> Underwriting Threshold (70%)
        </span>
      </div>
      {hovered && (
        <p className="text-[11px] font-bold text-emerald-800 mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {hovered.title}: {hovered.score}/{hovered.weight} pts ({Math.round((hovered.score / hovered.weight) * 100)}%)
        </p>
      )}
    </div>
  );
}
