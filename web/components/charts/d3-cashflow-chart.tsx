"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export interface CashFlowMonth {
  month: string;
  inflow: number;  // in thousands ETB
  outflow: number; // in thousands ETB
  safeCap: number; // monthly debt service ceiling in thousands ETB
}

export function D3CashFlowChart({ data }: { data?: CashFlowMonth[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState<CashFlowMonth | null>(null);
  const chartData = data || [];

  useEffect(() => {
    if (!svgRef.current || !chartData.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 210;
    const margin = { top: 15, right: 15, bottom: 25, left: 45 };

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

    const x0 = d3.scaleBand().domain(chartData.map((d) => d.month))
      .range([margin.left, width - margin.right]).padding(0.25);
    const x1 = d3.scaleBand().domain(["inflow", "outflow"])
      .range([0, x0.bandwidth()]).padding(0.1);

    // Dynamic Max Domain based on data
    const maxVal = Math.max(50, d3.max(chartData, (d) => Math.max(d.inflow, d.outflow, d.safeCap)) || 200);
    const y = d3.scaleLinear().domain([0, maxVal * 1.15])
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    y.ticks(4).forEach((t) => {
      svg.append("line")
        .attr("x1", margin.left).attr("x2", width - margin.right)
        .attr("y1", y(t)).attr("y2", y(t))
        .attr("stroke", "#f1f5f9").attr("stroke-width", 1);
    });

    // Bars
    chartData.forEach((d) => {
      const g = svg.append("g").attr("transform", `translate(${x0(d.month)},0)`);
      // Inflow bar
      g.append("rect")
        .attr("x", x1("inflow")!)
        .attr("y", y(d.inflow))
        .attr("width", x1.bandwidth())
        .attr("height", height - margin.bottom - y(d.inflow))
        .attr("fill", "url(#inflow-diag)")
        .attr("stroke", "#047857")
        .attr("stroke-width", 1.2)
        .attr("rx", 3)
        .attr("cursor", "pointer")
        .on("mouseenter", () => setActive(d))
        .on("mouseleave", () => setActive(null));

      // Outflow bar
      g.append("rect")
        .attr("x", x1("outflow")!)
        .attr("y", y(d.outflow))
        .attr("width", x1.bandwidth())
        .attr("height", height - margin.bottom - y(d.outflow))
        .attr("fill", "url(#outflow-diag)")
        .attr("stroke", "#475569")
        .attr("stroke-width", 1.2)
        .attr("rx", 3)
        .attr("cursor", "pointer")
        .on("mouseenter", () => setActive(d))
        .on("mouseleave", () => setActive(null));
    });

    // Ceiling reference line for safe loan capacity
    const avgCap = chartData[chartData.length - 1]?.safeCap || chartData[0]?.safeCap || 50;
    const safeCapY = y(avgCap);
    svg.append("line")
      .attr("x1", margin.left).attr("x2", width - margin.right)
      .attr("y1", safeCapY).attr("y2", safeCapY)
      .attr("stroke", "#2563eb").attr("stroke-dasharray", "4,4").attr("stroke-width", 1.5);

    svg.append("text")
      .attr("x", width - margin.right)
      .attr("y", safeCapY - 4)
      .attr("text-anchor", "end")
      .attr("fill", "#2563eb")
      .attr("font-size", "10px")
      .attr("font-weight", "800")
      .text(`Max Safe Debt: ${avgCap}k`);

    // Axes
    const xAxis = d3.axisBottom(x0).tickSize(0);
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .select(".domain").attr("stroke", "#e2e8f0");
    svg.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", "10px").attr("dy", "10px");

    const yAxis = d3.axisLeft(y).ticks(4).tickFormat((d) => `${d}k`).tickSize(0);
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .select(".domain").remove();
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-44 flex flex-col items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        <p className="font-semibold text-slate-600">No cash flow periods recorded yet</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Monthly inflows and outflows will be computed from transaction history</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-100 border border-emerald-700" />
            <span className="text-[11px] font-bold text-slate-700">Gross Inflows</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-slate-200 border border-slate-700" />
            <span className="text-[11px] font-bold text-slate-700">Outflows</span>
          </div>
        </div>
        {active && (
          <span className="font-mono text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {active.month}: +{active.inflow}k ETB / -{active.outflow}k ETB (Net: +{active.inflow - active.outflow}k ETB)
          </span>
        )}
      </div>

      <div className="w-full overflow-hidden">
        <svg ref={svgRef} viewBox="0 0 500 210" className="w-full h-auto max-h-[220px]" />
      </div>
    </div>
  );
}
