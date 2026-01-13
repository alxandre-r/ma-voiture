/**
 * @file components/fill/OdometerChart.tsx
 * @fileoverview Professional, responsive line chart for odometer evolution.
 *
 * Features:
 *  - Smooth curve using Catmull-Rom -> cubic Bezier conversion
 *  - Points drawn as HTML elements (ensures perfect circles on any scale)
 *  - Responsive (ResizeObserver) and recalculation on container resize
 *  - Tooltip on hover showing value + month
 *  - Axis labels (Y left, X bottom), clean spacing and layout
 *
 * Usage:
 *  <OdometerChart data={[{ month: "2025-01", odometer: 12345 }, ... ]} />
 *
 * Notes:
 *  - Expects data ordered chronologically.
 *  - Styling uses Tailwind classes; adapt as needed.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";

interface OdometerPoint {
  month: string;
  odometer: number;
}

interface OdometerChartProps {
  data: OdometerPoint[];
}

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

/** Convert YYYY-MM to "Mon YY" */
function formatMonthShort(monthString: string) {
  const parts = monthString.split("-");
  if (parts.length >= 2 && parts[0].length === 4) {
    const year = parts[0].slice(2);
    const m = parseInt(parts[1], 10);
    return `${MONTH_NAMES[m - 1]} ${year}`;
  }
  return monthString;
}

/**
 * Convert an array of points to a smooth cubic-bezier path using Catmull-Rom.
 * Returns an SVG path `d` string.
 *
 * Points are given as [{x,y}, ...] in pixel coordinates.
 */
function catmullRomToBezier(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";

  // For n points, build a path that starts at p0 and uses cubic bezier segments
  const dParts: string[] = [];
  dParts.push(`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`);

  // When there are only two points, just draw a line
  if (points.length === 2) {
    dParts.push(`L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`);
    return dParts.join(" ");
  }

  // Catmull-Rom to Cubic Bezier for each segment
  for (let i = 0; i < points.length - 1; i++) {
    // p0 p1 p2 p3 for segment between p1 and p2
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    // tension 0.5 gives a good smooth curve
    const t = 0.5;

    const cp1x = p1.x + (p2.x - p0.x) * t / 6;
    const cp1y = p1.y + (p2.y - p0.y) * t / 6;

    const cp2x = p2.x - (p3.x - p1.x) * t / 6;
    const cp2y = p2.y - (p3.y - p1.y) * t / 6;

    dParts.push(
      `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
    );
  }

  return dParts.join(" ");
}

export default function OdometerChart({ data }: OdometerChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 600, height: 220 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // chart layout configuration
  const padding = { top: 12, bottom: 28, left: 44, right: 12 }; // px
  const svgHeight = 140; // logical SVG inner height (pixels)
  const pointRadius = 6; // px for HTML point element

  // get min/max odometer
  const maxOdom = data && data.length > 0 ? Math.max(...data.map((d) => d.odometer)) : 0;
  const minOdom = data && data.length > 0 ? Math.min(...data.map((d) => d.odometer)) : 0;
  const range = Math.max(1, maxOdom - minOdom);

  // Resize observer to compute container width/height
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setSize({ width: Math.max(200, cr.width), height: Math.max(120, cr.height) });
      }
    });
    ro.observe(el);
    // initial sizing
    const rect = el.getBoundingClientRect();
    setSize({ width: Math.max(200, rect.width), height: Math.max(120, rect.height) });
    return () => ro.disconnect();
  }, []);

  // compute inner drawing area
  const innerWidth = Math.max(10, size.width - padding.left - padding.right);
  const innerHeight = Math.max(10, svgHeight); // svgHeight is fixed logical drawing height

  // map data -> pixel coordinates
  const points = data.map((d, i) => {
    const t = data.length === 1 ? 0 : i / (data.length - 1); // normalized 0..1
    const x = padding.left + t * innerWidth;
    const y = padding.top + (1 - (d.odometer - minOdom) / range) * innerHeight;
    return { x, y, item: d };
  });

  // build path (smooth)
  const pathD = catmullRomToBezier(points.map((p) => ({ x: p.x, y: p.y })));

  // helper for tooltip position
  const tooltip = hoverIndex !== null ? {
    left: points[hoverIndex].x,
    top: points[hoverIndex].y - 10,
    text: `${formatMonthShort(points[hoverIndex].item.month)} — ${points[hoverIndex].item.odometer} km`
  } : null;

  return (
    <div className="odometer-chart mt-4 w-full">
      <h4 className="text-sm font-medium mb-3">Évolution du kilométrage</h4>

      {/* container: we give it a reasonable min-height and rely on ResizeObserver */}
      <div
        ref={containerRef}
        className="relative w-full bg-transparent"
        style={{ minHeight: 220, paddingLeft: 0, paddingRight: 0 }}
      >
        {/* left Y labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pr-2"
             style={{ paddingTop: padding.top, paddingBottom: padding.bottom }}>
          <span>{Math.round(maxOdom)} km</span>
          <span>{Math.round(minOdom + range / 2)} km</span>
          <span>{Math.round(minOdom)} km</span>
        </div>

        {/* The SVG line (fills width responsively) */}
        <svg
          width="100%"
          height={svgHeight + padding.top + 6} // allow some room bottom for labels
          viewBox={`0 0 ${size.width} ${svgHeight + padding.top + 6}`}
          preserveAspectRatio="xMinYMin meet"
          className="block"
          style={{ marginLeft: 0 }}
        >
          {/* horizontal grid lines (3) */}
          <g stroke="rgba(0,0,0,0.06)">
            <line x1={padding.left} x2={size.width - padding.right} y1={padding.top} y2={padding.top} />
            <line x1={padding.left} x2={size.width - padding.right} y1={padding.top + innerHeight / 2} y2={padding.top + innerHeight / 2} />
            <line x1={padding.left} x2={size.width - padding.right} y1={padding.top + innerHeight} y2={padding.top + innerHeight} />
          </g>

          {/* area fill under curve (optional subtle) */}
          {pathD && (
            <path
              d={`${pathD} L ${points[points.length - 1].x.toFixed(2)} ${padding.top + innerHeight} L ${points[0].x.toFixed(2)} ${padding.top + innerHeight} Z`}
              fill="rgba(242,110,82,0.08)"
              stroke="none"
            />
          )}

          {/* main smooth line */}
          <path d={pathD} fill="none" stroke="#F26E52" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {/* invisible thicker stroke to increase hover/touch target */}
          <path d={pathD} fill="none" stroke="transparent" strokeWidth={20} strokeLinecap="round" />

          {/* X labels (we will also render HTML labels to avoid clamping issues) */}
          {/* We keep SVG-only labels minimal; main labels below rendered in HTML for layout control */}
        </svg>

        {/* HTML points positioned absolutely to stay perfectly circular */}
        {points.map((p, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoverIndex(idx)}
            onMouseLeave={() => setHoverIndex(null)}
            onFocus={() => setHoverIndex(idx)}
            onBlur={() => setHoverIndex(null)}
            role="button"
            tabIndex={0}
            aria-label={`${data[idx].odometer} km on ${data[idx].month}`}
            style={{
              position: "absolute",
              left: p.x - pointRadius,
              top: p.y - pointRadius,
              width: pointRadius * 2,
              height: pointRadius * 2,
              transform: "translate(0,0)",
            }}
          >
            <div className="w-full h-full rounded-full bg-white border-2 border-custom-2 flex items-center justify-center">
            </div>
          </div>
        ))}

        {/* X axis labels as HTML (full control) */}
        <div className="absolute left-0 right-0 bottom-0 px-8" style={{ height: padding.bottom }}>
          <div className="flex" style={{ marginLeft: padding.left }}>
            {data.map((d, i) => (
              <div
                key={i}
                className="text-xs text-gray-400 text-center"
                style={{ width: `${100 / data.length}%` }}
              >
                <div className="truncate">{formatMonthShort(d.month).split(" ")[0]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip (HTML, positioned near point) */}
        {tooltip && (
          <div
            className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: tooltip.left,
              top: tooltip.top - 8,
              minWidth: 100,
            }}
          >
            <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 shadow">
              {tooltip.text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}