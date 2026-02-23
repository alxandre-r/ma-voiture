"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContainerSize, useMonthTicks, useDateRange, useMobileDetection, Padding } from "./ChartHelper";

interface OdometerPoint {
  date: string;
  odometer: number;
  vehicleId: string;
  vehicleName: string;
  color?: string;
  isVisible: boolean;
}

interface VehicleSeries {
  vehicleId: string;
  vehicleName: string;
  color?: string;
  points: OdometerPoint[];
}

interface OdometerChartProps {
  vehicles: VehicleSeries[];
}

export default function OdometerChart({ vehicles }: OdometerChartProps) {
  const [size, containerRef] = useContainerSize({ width: 600, height: 240 });
  const [mode, setMode] = useState<"normal" | "comparatif">("comparatif");
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string } | null>(null);

  const padding: Padding = { top: 30, bottom: 50, left: 60, right: 20 };
  const containerHeight = 160;
  const innerWidth = size.width - padding.left - padding.right;
  const innerHeight = containerHeight;
  const mobile = useMobileDetection();

  const normalizedVehicles: VehicleSeries[] = useMemo(() => {
    if (mode === "normal") return vehicles;

    return vehicles.map(vehicle => {
      if (!vehicle.points.length) return vehicle;

      const base = vehicle.points[0].odometer;

      return {
        ...vehicle,
        points: vehicle.points.map(p => ({
          ...p,
          odometer: p.odometer - base,
        })),
      };
    });
  }, [vehicles, mode]);

  const allPoints: OdometerPoint[] = useMemo(() => {
    return normalizedVehicles.flatMap(v => v.points);
  }, [normalizedVehicles]);

  if (!allPoints.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Aucune donnée disponible pour le graphique.</p>
      </div>
    );
  }

  const { minDate, maxDate } = useDateRange(allPoints);
  const minValue = Math.min(...allPoints.map(p => p.odometer));
  const maxValue = Math.max(...allPoints.map(p => p.odometer));
  const range = Math.max(1, maxValue - minValue);

  const getX = (date: string | Date) =>
    padding.left +
    ((new Date(date).getTime() - minDate.getTime()) /
      (maxDate.getTime() - minDate.getTime())) *
      innerWidth;

  const getY = (value: number) =>
    padding.top + (1 - (value - minValue) / range) * innerHeight;

  const monthTicks = useMonthTicks(minDate, maxDate, getX, mobile);

  // === Render ===
  return (
    <div className="w-full mt-6 relative bg-white dark:bg-gray-800 rounded-xl py-4 shadow-sm dark:shadow-xl px-2 lg:px-4">
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Evolution du kilométrage</h3>
        <motion.button
          type="button"
          role="switch"
          aria-checked={mode === "comparatif"}
          onClick={() => setMode(mode === "normal" ? "comparatif" : "normal")}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="relative w-44 h-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-full cursor-pointer flex items-center p-1 border border-gray-100 dark:border-gray-700 hover:shadow-sm dark:hover:shadow-xl transition-all"
        >
          <motion.div
            className="absolute w-20 h-6 bg-gradient-to-tl from-custom-1 to-violet-400 rounded-full shadow-md dark:shadow-xl"
            animate={{ x: mode === "normal" ? 0 : (mobile ? 76 : 86) }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
          <div className="flex justify-between w-full px-3 text-xs font-medium z-20">
            <span className={mode === "normal" ? "text-white" : "text-gray-700 dark:text-gray-300"}>Total</span>
            <span className={mode === "comparatif" ? "text-white" : "text-gray-700 dark:text-gray-300"}>Normalisé</span>
          </div>
        </motion.button>
      </div>

      <div ref={containerRef} className="relative w-full" style={{ minHeight: containerHeight + padding.top + padding.bottom }}>
        <svg width="100%" height={containerHeight + padding.top + padding.bottom}>
          {/* Lignes et points */}
          <AnimatePresence>
            {normalizedVehicles.map((vehicle, idx) => {
              const color = vehicle.color || `hsl(${(idx * 120) % 360}, 70%, 50%)`;
              const pts = vehicle.points.map(p => ({ id: `${vehicle.vehicleId}-${p.date}`, x: getX(p.date), y: getY(p.odometer) }));
              return pts.slice(1).map((point, i) => {
                const prev = pts[i];
                return (
                  <motion.line
                    key={`${prev.id}-${point.id}`}
                    stroke={color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    initial={{ x1: prev.x - 50, y1: prev.y, x2: point.x - 50, y2: point.y, opacity: 0 }}
                    animate={{ x1: prev.x, y1: prev.y, x2: point.x, y2: point.y, opacity: 1 }}
                    exit={{ x1: prev.x - 50, y1: prev.y, x2: point.x - 50, y2: point.y, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 140, damping: 20 }}
                  />
                );
              });
            })}
          </AnimatePresence>

          <AnimatePresence>
            {normalizedVehicles.flatMap(v =>
              v.points.map(p => (
                <motion.circle
                  key={`${v.vehicleId}-${p.date}`}
                  r={3}
                  fill={v.color || "hsl(200,70%,50%)"}
                  initial={{ cx: getX(p.date) - 50, cy: getY(p.odometer), opacity: 0 }}
                  animate={{ cx: getX(p.date), cy: getY(p.odometer), opacity: 1 }}
                  exit={{ cx: -50, cy: getY(p.odometer), opacity: 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                  onMouseEnter={() =>
                    setHoveredPoint({
                      x: getX(p.date),
                      y: getY(p.odometer),
                      label: `${v.vehicleName}: ${p.odometer.toFixed(0)} km (${new Date(p.date).toLocaleDateString("fr-FR")})`,
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))
            )}
          </AnimatePresence>

          {/* Axe X */}
          <line x1={padding.left} x2={size.width - padding.right} y1={innerHeight + padding.top} y2={innerHeight + padding.top} className="stroke-gray-300 dark:stroke-gray-500" />

          {/* Axe Y */}
          {[0, 0.5, 1].map(f => {
            const value = Math.round((minValue + f * range) / 1000) * 1000;
            const y = padding.top + (1 - f) * innerHeight;
            return (
              <g key={value}>
                <line x1={padding.left} x2={size.width - padding.right} y1={y} y2={y} className="stroke-gray-200 dark:stroke-gray-700" />
                <text x={padding.left - 4} y={y + 4} textAnchor="end" className="text-xs fill-gray-400 dark:fill-gray-400">{value} km</text>
              </g>
            );
          })}

          {/* Axe X ticks */}
          <AnimatePresence>
            {monthTicks.map((t, i) => {
              const xOffset = 50;
              const nextTick = monthTicks[i + 1];
              const labelX = nextTick ? (t.x + nextTick.x) / 2 : t.x;

              return (
                <motion.g key={t.id} initial={{ x: t.x - xOffset, opacity: 0 }} animate={{ x: t.x, opacity: 1 }} exit={{ x: -xOffset, opacity: 0 }} transition={{ type: "spring", stiffness: 140, damping: 20 }}>
                  <line x1={0} x2={0} y1={innerHeight + padding.top} y2={innerHeight + padding.top + 6} className="stroke-gray-300 dark:stroke-gray-500" />
                  {t.showLabel && <text x={labelX - t.x} y={innerHeight + padding.top + 16} textAnchor="middle" className="text-xs fill-gray-400 dark:fill-gray-400">{t.label}</text>}
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Tooltip */}
          {hoveredPoint && (
            <g>
              <rect x={hoveredPoint.x - hoveredPoint.label.length * 3} y={Math.max(0, hoveredPoint.y - 28)} width={hoveredPoint.label.length * 6 + 8} height={20} rx={4} ry={4} fill="black" opacity={0.8} />
              <text x={hoveredPoint.x - hoveredPoint.label.length * 3 + 4} y={Math.max(0, hoveredPoint.y - 14)} className="text-xs fill-white">{hoveredPoint.label}</text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}