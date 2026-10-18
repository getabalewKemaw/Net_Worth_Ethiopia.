"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export interface CandidatePoint {
  code: string;
  name: string;
  score: number;
  capacity: number; // in thousands ETB
  branches: number;
  grade: string;
}

const CANDIDATES: CandidatePoint[] = [
  { code: "NW-78219", name: "Abyssinia Spices", score: 84, capacity: 485, branches: 3, grade: "A" },
  { code: "NW-54012", name: "Sheger Wholesale Mart", score: 91, capacity: 620, branches: 4, grade: "A" },
  { code: "NW-31904", name: "Blue Nile Electronics", score: 68, capacity: 290, branches: 2, grade: "C" },
  { code: "NW-89211", name: "Bole Fresh Produce", score: 76, capacity: 380, branches: 2, grade: "B" },
  { code: "NW-44120", name: "Entoto Textiles & Apparel", score: 58, capacity: 180, branches: 1, grade: "D" },
];

export function D3PortfolioScatter({ onSelect }: { onSelect?: (code: string) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<CandidatePoint | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 540;
    const height = 230;
    const margin = { top: 20, right: 25, bottom: 30, left: 45 };

    const defs = svg.append("defs");
    // Quadrant pattern
    const pat = defs.append("pattern").attr("id", "quad-diag").attr("width", 8).attr("height", 8)
      .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    pat.append("rect").attr("width", 8).attr("height", 8).attr("fill", "#ecfdf5");
    pat.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 8)
      .attr("stroke", "#047857").attr("stroke-width", 1.2).attr("stroke-opacity", 0.3);

    const x = d3.scaleLinear().domain([45, 100]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([100, 750]).range([height - margin.bottom, margin.top]);

    // Prime quadrant background box
    svg.append("rect")
      .attr("x", x(75)).attr("y", y(750))
      .attr("width", width - margin.right - x(75)).attr("height", y(350) - y(750))
      .attr("fill", "url(#quad-diag)").attr("rx", 6);

    svg.append("text").attr("x", width - margin.right - 8).attr("y", margin.top + 14)
      .attr("text-anchor", "end").attr("fill", "#047857").attr("font-size", "9px").attr("font-weight", "800")
      .text("PRIME UNSECURED ZONE");

    // Grid & Threshold Dividers
    svg.append("line").attr("x1", x(75)).attr("x2", x(75)).attr("y1", margin.top).attr("y2", height - margin.bottom)
      .attr("stroke", "#cbd5e1").attr("stroke-dasharray", "3,3");
    svg.append("line").attr("x1", margin.left).attr("x2", width - margin.right).attr("y1", y(350)).attr("y2", y(350))
      .attr("stroke", "#cbd5e1").attr("stroke-dasharray", "3,3");

    // Candidate Bubbles
    CANDIDATES.forEach((c) => {
      const isPrime = c.score >= 75 && c.capacity >= 350;
      const g = svg.append("g").attr("cursor", "pointer")
        .on("mouseenter", () => setHovered(c))
        .on("mouseleave", () => setHovered(null))
        .on("click", () => onSelect?.(c.code));

      g.append("circle")
        .attr("cx", x(c.score)).attr("cy", y(c.capacity)).attr("r", 7 + c.branches * 1.5)
        .attr("fill", isPrime ? "#047857" : "#d97706").attr("fill-opacity", 0.85)
        .attr("stroke", "#ffffff").attr("stroke-width", 2);

      g.append("text")
        .attr("x", x(c.score)).attr("y", y(c.capacity) - 12)
        .attr("text-anchor", "middle").attr("fill", "#0f172a").attr("font-size", "9px").attr("font-weight", "700")
        .text(c.name.split(" ")[0]);
    });

    // Axes
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat((d) => `${d} pts`)).select(".domain").attr("stroke", "#e2e8f0");
    svg.append("g").attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(4).tickFormat((d) => `${d}k`)).select(".domain").remove();
  }, [onSelect]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
        <span className="uppercase tracking-wider">Loan Underwriting Scatter Matrix (Score vs Debt Capacity)</span>
        {hovered && (
          <span className="text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {hovered.name} · Score: {hovered.score}/100 · Safe Cap: {hovered.capacity}k ETB
          </span>
        )}
      </div>
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-2xs">
        <svg ref={svgRef} viewBox="0 0 540 230" className="w-full h-auto max-h-[230px]" />
      </div>
    </div>
  );
}
