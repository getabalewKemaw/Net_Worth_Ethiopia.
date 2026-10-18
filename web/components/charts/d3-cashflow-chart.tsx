"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface CashFlowMonth {
  month: string;
  inflow: number;  // in thousands ETB
  outflow: number; // in thousands ETB
  safeCap: number; // monthly debt service ceiling in thousands ETB
}

const DEFAULT_FLOWS: CashFlowMonth[] = [
  { month: "May", inflow: 320, outflow: 210, safeCap: 55 },
  { month: "Jun", inflow: 380, outflow: 250, safeCap: 55 },
  { month: "Jul", inflow: 410, outflow: 270, safeCap: 55 },
  { month: "Aug", inflow: 440, outflow: 290, safeCap: 55 },
  { month: "Sep", inflow: 460, outflow: 300, safeCap: 55 },
  { month: "Oct", inflow: 485, outflow: 310, safeCap: 55 },
];

export function D3CashFlowChart({ data = DEFAULT_FLOWS }: { data?: CashFlowMonth[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState<CashFlowMonth | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 210;
    const margin = { top: 15, right: 15, bottom: 25, left: 40 };

    const defs = svg.append("defs");
    // Inflow pattern (emerald)
    const p1 = defs.append("pattern")
      .attr("id", "inflow-diag").attr("width", 8).attr("height", 8)
      .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    p1.append("rect").attr("width", 8).attr("height", 8).attr("fill", "#d1fae5");
    p1.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 8)
      .attr("stroke", "#047857").attr("stroke-width", 1.8).attr("stroke-opacity", 0.6);

    // Outflow pattern (slate)
    const p2 = defs.append("pattern")
      .attr("id", "outflow-diag").attr("width", 8).attr("height", 8)
      .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    p2.append("rect").attr("width", 8).attr("height", 8).attr("fill", "#e2e8f0");
    p2.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 8)
      .attr("stroke", "#475569").attr("stroke-width", 1.8).attr("stroke-opacity", 0.6);

    const x0 = d3.scaleBand().domain(data.map((d) => d.month))
      .range([margin.left, width - margin.right]).padding(0.25);
    const x1 = d3.scaleBand().domain(["inflow", "outflow"])
      .range([0, x0.bandwidth()]).padding(0.1);
    const y = d3.scaleLinear().domain([0, 550])
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    y.ticks(4).forEach((t) => {
      svg.append("line")
        .attr("x1", margin.left).attr("x2", width - margin.right)
        .attr("y1", y(t)).attr("y2", y(t))
        .attr("stroke", "#f1f5f9").attr("stroke-width", 1);
    });

    // Bars
    data.forEach((d) => {
      const g = svg.append("g").attr("transform", `translate(${x0(d.month)},0)`);
      // Inflow bar
      g.append("rect")
        .attr("x", x1("inflow")!).attr("y", y(d.inflow))
        .attr("width", x1.bandwidth()).attr("height", height - margin.bottom - y(d.inflow))
        .attr("rx", 3).attr("fill", "url(#inflow-diag)")
        .attr("stroke", "#047857").attr("stroke-width", 1.2).attr("cursor", "pointer")
        .on("mouseenter", () => setActive(d)).on("mouseleave", () => setActive(null));
      // Outflow bar
      g.append("rect")
        .attr("x", x1("outflow")!).attr("y", y(d.outflow))
        .attr("width", x1.bandwidth()).attr("height", height - margin.bottom - y(d.outflow))
        .attr("rx", 3).attr("fill", "url(#outflow-diag)")
        .attr("stroke", "#475569").attr("stroke-width", 1.2).attr("cursor", "pointer")
        .on("mouseenter", () => setActive(d)).on("mouseleave", () => setActive(null));
    });

    // Debt Service Capacity Ceiling line
    const capY = y(55);
    svg.append("line")
      .attr("x1", margin.left).attr("x2", width - margin.right)
      .attr("y1", capY).attr("y2", capY)
      .attr("stroke", "#d97706").attr("stroke-width", 1.5).attr("stroke-dasharray", "4,3");

    // Axes
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0).tickSize(0)).select(".domain").attr("stroke", "#e2e8f0");
    svg.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", "10px");

    svg.append("g").attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(4).tickFormat((d) => `${d}k`)).select(".domain").remove();
  }, [data]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs border border-emerald-700 bg-emerald-100" /> Revenue Inflow</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs border border-slate-600 bg-slate-200" /> Operating Outflow</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-b border-dashed border-amber-600" /> DSCR Ceiling</span>
        </div>
        {active && (
          <span className="text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {active.month}: Net +{(active.inflow - active.outflow)}k ETB
          </span>
        )}
      </div>
      <div className="w-full overflow-hidden">
        <svg ref={svgRef} viewBox="0 0 500 210" className="w-full h-auto max-h-[210px]" />
      </div>
    </div>
  );
}
