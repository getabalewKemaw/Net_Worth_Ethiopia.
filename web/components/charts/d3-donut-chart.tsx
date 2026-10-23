"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DonutItem {
  label: string;
  value: number;
  color: string;
  bg?: string;
}

const DEFAULT_SEGMENTS: DonutItem[] = [
  { label: "Telebirr", value: 54, color: "#047857", bg: "#ecfdf5" },
  { label: "CBE Birr", value: 28, color: "#2563eb", bg: "#eff6ff" },
  { label: "Cash", value: 18, color: "#d97706", bg: "#fffbeb" },
];

export function D3DonutChart({ segments = DEFAULT_SEGMENTS }: { segments?: DonutItem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 180;
    const height = 180;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.65;

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<DonutItem>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.04);

    const arc = d3.arc<d3.PieArcDatum<DonutItem>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 5)
      .cornerRadius(4);

    // SVG Diagonal Patterns for each segment
    const defs = svg.append("defs");
    segments.forEach((s, i) => {
      const p = defs.append("pattern")
        .attr("id", `donut-diag-${i}`)
        .attr("width", 8)
        .attr("height", 8)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("patternTransform", "rotate(45)");

      p.append("rect")
        .attr("width", 8)
        .attr("height", 8)
        .attr("fill", s.bg || "#f8fafc");

      p.append("line")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", 0).attr("y2", 8)
        .attr("stroke", s.color)
        .attr("stroke-width", 2.5);
    });

    g.selectAll("path")
      .data(pie(segments))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (_, i) => `url(#donut-diag-${i})`)
      .attr("stroke", (d) => d.data.color)
      .attr("stroke-width", 1.5);

    // Center metric
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.1em")
      .attr("font-size", "20px")
      .attr("font-weight", "900")
      .attr("fill", "#0f172a")
      .text("82%");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.3em")
      .attr("font-size", "10px")
      .attr("font-weight", "700")
      .attr("fill", "#64748b")
      .text("DIGITAL");
  }, [segments]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} viewBox="0 0 180 180" className="w-36 h-36" />
      <div className="flex items-center gap-3 mt-3 text-[11px] font-semibold text-slate-600">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-xs border"
              style={{
                borderColor: s.color,
                backgroundImage: `repeating-linear-gradient(45deg, ${s.color}, ${s.color} 1.5px, ${s.bg || "#fff"} 1.5px, ${s.bg || "#fff"} 4px)`,
              }}
            />
            <span>{s.label} ({s.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
