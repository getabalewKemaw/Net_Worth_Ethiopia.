"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export interface DataPoint {
  month: string;
  gtv: number;
  digital: number;
}

export function D3AreaChart({ data, unit = "M" }: { data?: DataPoint[]; unit?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartData = data || [];

  useEffect(() => {
    if (!svgRef.current || !chartData.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 560;
    const height = 210;
    const margin = { top: 15, right: 15, bottom: 25, left: 42 };

    const x = d3.scalePoint()
      .domain(chartData.map((d) => d.month))
      .range([margin.left, width - margin.right])
      .padding(0.5);

    // Dynamic Max Domain based on data
    const maxData = d3.max(chartData, (d) => Math.max(d.gtv, d.digital)) || 1;
    const maxVal = Math.max(1, maxData);
    const y = d3.scaleLinear()
      .domain([0, maxVal * 1.25])
      .range([height - margin.bottom, margin.top]);

    // Defs for SVG diagonal stripe pattern
    const defs = svg.append("defs");
    const diagPattern = defs.append("pattern")
      .attr("id", "area-diagonal-stripe")
      .attr("width", 10)
      .attr("height", 10)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("patternTransform", "rotate(45)");

    diagPattern.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "#d1fae5");

    diagPattern.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", 10)
      .attr("stroke", "#047857")
      .attr("stroke-width", 1.8)
      .attr("stroke-opacity", 0.55);

    // Horizontal grid lines
    y.ticks(4).forEach((t) => {
      svg.append("line")
        .attr("x1", margin.left).attr("x2", width - margin.right)
        .attr("y1", y(t)).attr("y2", y(t))
        .attr("stroke", "#f1f5f9").attr("stroke-width", 1);
    });

    // Area generator
    const area = d3.area<DataPoint>()
      .x((d) => x(d.month)!)
      .y0(height - margin.bottom)
      .y1((d) => y(d.gtv))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(chartData)
      .attr("fill", "url(#area-diagonal-stripe)")
      .attr("d", area);

    // Line generator
    const line = d3.line<DataPoint>()
      .x((d) => x(d.month)!)
      .y((d) => y(d.gtv))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "#047857")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Dots
    chartData.forEach((d) => {
      const cx = x(d.month)!;
      const cy = y(d.gtv);
      svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 4.5).attr("fill", "#ffffff").attr("stroke", "#047857").attr("stroke-width", 2);
    });

    // Axes
    const xAxis = d3.axisBottom(x).tickSize(0);
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .select(".domain").attr("stroke", "#e2e8f0");
    svg.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", "10px").attr("dy", "10px");

    const yAxis = d3.axisLeft(y).ticks(4).tickFormat((d) => `${d}${unit}`).tickSize(0);
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
  }, [chartData, unit]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-44 flex flex-col items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        <p className="font-semibold text-slate-600">No transaction volume recorded yet</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Historical ledger curve will appear when merchants record sales</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <svg
        ref={svgRef}
        viewBox="0 0 560 210"
        className="w-full h-auto max-h-[220px]"
      />
    </div>
  );
}
