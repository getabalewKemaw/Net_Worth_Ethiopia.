"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataPoint {
  month: string;
  gtv: number;
  digital: number;
}

const DEFAULT_DATA: DataPoint[] = [
  { month: "May", gtv: 28, digital: 21 },
  { month: "Jun", gtv: 34, digital: 26 },
  { month: "Jul", gtv: 39, digital: 31 },
  { month: "Aug", gtv: 42, digital: 34 },
  { month: "Sep", gtv: 45, digital: 37 },
  { month: "Oct", gtv: 49, digital: 40 },
];

export function D3AreaChart({ data = DEFAULT_DATA }: { data?: DataPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 560;
    const height = 210;
    const margin = { top: 15, right: 15, bottom: 25, left: 35 };

    const x = d3.scalePoint()
      .domain(data.map((d) => d.month))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, 60])
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
      .datum(data)
      .attr("fill", "url(#area-diagonal-stripe)")
      .attr("d", area);

    // Line generator
    const line = d3.line<DataPoint>()
      .x((d) => x(d.month)!)
      .y((d) => y(d.gtv))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#047857")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Dots
    data.forEach((d) => {
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

    const yAxis = d3.axisLeft(y).ticks(4).tickFormat((d) => `${d}M`).tickSize(0);
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .select(".domain").remove();
  }, [data]);

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
