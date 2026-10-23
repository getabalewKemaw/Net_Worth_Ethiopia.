"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export interface VerificationChannelData {
  name: string;
  pulls: number;
  remaining?: number;
  color: string;
  bg: string;
}

const DEFAULT_VERIFICATION_DATA: VerificationChannelData[] = [
  { name: "Direct Token Links", pulls: 142, remaining: 9999, color: "#047857", bg: "#d1fae5" },
  { name: "Underwriting Portals", pulls: 98, remaining: 9999, color: "#1d4ed8", bg: "#dbeafe" },
  { name: "QR Mobile Scans", pulls: 64, remaining: 9999, color: "#0d9488", bg: "#ccfbf1" },
  { name: "Bank Verification API", pulls: 85, remaining: 9999, color: "#b45309", bg: "#fef3c7" },
];

export function D3QueryVelocityChart({ data }: { data?: VerificationChannelData[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState<VerificationChannelData | null>(null);

  const chartData = data && data.length > 0 ? data : DEFAULT_VERIFICATION_DATA;

  useEffect(() => {
    if (!svgRef.current || !chartData.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 540;
    const height = 180;
    const margin = { top: 15, right: 20, bottom: 25, left: 35 };

    const defs = svg.append("defs");
    chartData.forEach((p, i) => {
      const pat = defs.append("pattern").attr("id", `vel-diag-${i}`).attr("width", 8).attr("height", 8)
        .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
      pat.append("rect").attr("width", 8).attr("height", 8).attr("fill", p.bg);
      pat.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 8)
        .attr("stroke", p.color).attr("stroke-width", 2).attr("stroke-opacity", 0.65);
    });

    const x = d3.scaleBand().domain(chartData.map((d) => d.name))
      .range([margin.left, width - margin.right]).padding(0.35);

    const maxVal = Math.max(20, (d3.max(chartData, (d) => d.pulls) || 100) * 1.25);
    const y = d3.scaleLinear().domain([0, maxVal]).range([height - margin.bottom, margin.top]);

    // Grid
    y.ticks(3).forEach((t) => {
      svg.append("line").attr("x1", margin.left).attr("x2", width - margin.right)
        .attr("y1", y(t)).attr("y2", y(t)).attr("stroke", "#f1f5f9");
    });

    // Bars
    chartData.forEach((d, i) => {
      const bar = svg.append("g").attr("cursor", "pointer")
        .on("mouseenter", () => setActive(d)).on("mouseleave", () => setActive(null));

      bar.append("rect")
        .attr("x", x(d.name)!).attr("y", y(d.pulls))
        .attr("width", x.bandwidth()).attr("height", height - margin.bottom - y(d.pulls))
        .attr("rx", 4).attr("fill", `url(#vel-diag-${i})`)
        .attr("stroke", d.color).attr("stroke-width", 1.5);

      bar.append("text")
        .attr("x", x(d.name)! + x.bandwidth() / 2).attr("y", y(d.pulls) - 6)
        .attr("text-anchor", "middle").attr("fill", "#0f172a")
        .attr("font-size", "10px").attr("font-weight", "800")
        .text(`${d.pulls}`);
    });

    // X Axis
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0)).select(".domain").attr("stroke", "#e2e8f0");
    svg.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", "10px");

    // Y Axis
    svg.append("g").attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(3).tickSize(0)).select(".domain").remove();
  }, [chartData]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
        <span className="uppercase tracking-wider">Institutional Dossier Pull Velocity</span>
        {active && (
          <span className="text-slate-900 font-extrabold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {active.name}: {active.pulls} pulls {active.remaining && active.remaining < 9000 ? `(${active.remaining} checks left)` : ""}
          </span>
        )}
      </div>
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-2xs">
        <svg ref={svgRef} viewBox="0 0 540 180" className="w-full h-auto max-h-[180px]" />
      </div>
    </div>
  );
}
