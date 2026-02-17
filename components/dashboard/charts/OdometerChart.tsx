"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFills } from "@/contexts/FillContext";
import { useContainerSize, useMonthTicks, useDateRange, useMobileDetection, Padding } from "./ChartHelper";

interface OdometerPoint {
  date: string;
  odometer: number;
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
  const { selectedPeriod } = useFills();
  const [size, containerRef] = useContainerSize({ width: 600, height: 240 });
  const [mode, setMode] = useState<"normal" | "comparatif">("normal");
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);

  const padding: Padding = { top: 30, bottom: 50, left: 60, right: 20 };
  const containerHeight = 160;
  const innerWidth = size.width - padding.left - padding.right;
  const innerHeight = containerHeight;
  const mobile = useMobileDetection();

  // --- Filtrage période
  const processedVehicles = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case "3m":
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case "6m":
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case "12m":
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        break;
      default:
        startDate = new Date(0);
    }

    return vehicles
      .map(v => {
        const filtered = v.points.filter(p => {
          const d = new Date(p.date);
          return d >= startDate && d <= now;
        });

        if (mode === "comparatif" && filtered.length > 0) {
          const base = filtered[0].odometer;
          return {
            ...v,
            points: filtered.map(p => ({
              ...p,
              odometer: p.odometer - base,
            })),
          };
        }

        return { ...v, points: filtered };
      })
      .filter(v => v.points.length > 0);
  }, [vehicles, selectedPeriod, mode]);

  if (!processedVehicles.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Aucune donnée disponible pour le graphique.</p>
      </div>
    );
  }

  const allPoints = processedVehicles.flatMap(v => v.points);
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

  return (
    <div className="w-full mt-6 relative bg-white dark:bg-gray-800 rounded-xl py-4 shadow-sm dark:shadow-xl px-2 lg:px-4">
      <div className="flex items-center justify-between px-2 lg:px-4 mb-2">
        {/* Titre */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Evolution du kilométrage
        </h3>
        {/* Toggle comparatif */}
        {processedVehicles.length > 1 && (
        <motion.button
          type="button"
          role="switch"
          aria-checked={mode === "comparatif"}
          onClick={() =>
            setMode(mode === "normal" ? "comparatif" : "normal")
          }
          whileTap={{ scale: 0.96, y: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="relative w-44 h-8 bg-gradient-to-br 
          from-gray-50 to-gray-100 
          dark:from-gray-800 dark:to-gray-900
          rounded-full cursor-pointer flex items-center p-1 
          border border-gray-100 dark:border-gray-700
          hover:shadow-sm dark:hover:shadow-xl
          transition-all"
        >
          <motion.div
            className="absolute w-20 h-6 bg-gradient-to-tl 
            from-custom-1 to-violet-400 
            rounded-full shadow-md dark:shadow-xl"
            animate={{ x: mode === "normal" ? 0 : 86 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />

          <div className="flex justify-between w-full px-3 text-xs font-medium z-20">
            <span
              className={
                mode === "normal"
                  ? "text-white"
                  : "text-gray-700 dark:text-gray-300"
              }
            >
              Total
            </span>
            <span
              className={
                mode === "comparatif"
                  ? "text-white"
                  : "text-gray-700 dark:text-gray-300"
              }
            >
              Normalisé
            </span>
          </div>
        </motion.button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full"
        style={{ minHeight: containerHeight + padding.top + padding.bottom }}
      >
        <svg width="100%" height={containerHeight + padding.top + padding.bottom}>

          {/* Lignes véhicules morphing fluide */}
          <AnimatePresence>
            {processedVehicles.map((vehicle, index) => {
              const color =
                vehicle.color || `hsl(${(index * 120) % 360}, 70%, 50%)`;

              const pts = vehicle.points.map(p => ({
                id: `${vehicle.vehicleId}-${p.date}`,
                x: getX(p.date),
                y: getY(p.odometer),
              }));

              return pts.map((point, i) => {
                if (i === 0) return null;

                const prev = pts[i - 1];
                const segmentId = `${prev.id}-${point.id}`;
                const offset = 50;

                return (
                  <motion.line
                    key={segmentId}
                    stroke={color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    initial={{
                      x1: prev.x - offset,
                      y1: prev.y,
                      x2: point.x - offset,
                      y2: point.y,
                      opacity: 0,
                    }}
                    animate={{
                      x1: prev.x,
                      y1: prev.y,
                      x2: point.x,
                      y2: point.y,
                      opacity: 1,
                    }}
                    exit={{
                      x1: prev.x - offset,
                      y1: prev.y,
                      x2: point.x - offset,
                      y2: point.y,
                      opacity: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 140,
                      damping: 20,
                    }}
                  />
                );
              });
            })}
          </AnimatePresence>

          {/* Points alignés sur ligne, animés */}
          <AnimatePresence>
            {processedVehicles.flatMap((vehicle) =>
              vehicle.points.map((p) => {
                const cx = getX(p.date);
                const cy = getY(p.odometer);
                const offset = 50;
                const pointId = `${vehicle.vehicleId}-${p.date}`;

                return (
                  <motion.circle
                    key={pointId}
                    r={3}
                    fill={vehicle.color || "hsl(200,70%,50%)"}
                    initial={{ cx: cx - offset, cy, opacity: 0 }}
                    animate={{ cx, cy, opacity: 1 }}
                    exit={{ cx: -offset, cy, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 140, damping: 20 }}
                    onMouseEnter={() =>
                      setHoveredPoint({
                        x: cx,
                        y: cy,
                        label: `${vehicle.vehicleName}: ${p.odometer.toFixed(
                          0
                        )} km (${new Date(p.date).toLocaleDateString("fr-FR")})`,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })
            )}
          </AnimatePresence>

          {/* Axe X */}
          <line
            x1={padding.left}
            x2={size.width - padding.right}
            y1={innerHeight + padding.top}
            y2={innerHeight + padding.top}
            stroke="rgba(0,0,0,0.2)"
          />

          {/* Axe Y + ticks avec 3 lignes */}
          {[0, 0.5, 1].map((f, i) => {
            let value = minValue + f * range;

            // Arrondir au millier le plus proche (ou modifier pour un autre pas)
            const precision = 1000; 
            value = Math.round(value / precision) * precision;

            const y = padding.top + (1 - f) * innerHeight;

            return (
              <g key={i}>
                {/* ligne horizontale de grille */}
                <line
                  x1={padding.left}
                  x2={size.width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(0,0,0,0.05)"
                />
                {/* label Y */}
                <text
                  x={padding.left - 4}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-400"
                >
                  {value} km
                </text>
              </g>
            );
          })}

          {/* Ticks X */}
          <AnimatePresence>
            {monthTicks.map(t => {
              const offset = 50;
              const xInitial = t.x - offset;

              return (
                <motion.g
                  key={t.id}
                  initial={{ x: xInitial, opacity: 0 }}
                  animate={{ x: t.x, opacity: 1 }}
                  exit={{ x: -offset, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                >
                  <line
                    x1={0}
                    x2={0}
                    y1={innerHeight + padding.top}
                    y2={innerHeight + padding.top + 6}
                    stroke="rgba(0,0,0,0.2)"
                  />
                  {t.showLabel && (
                    <text
                      x={0}
                      y={innerHeight + padding.top + 16}
                      textAnchor="middle"
                      className="text-xs fill-gray-400"
                    >
                      {t.label}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Tooltip hover */}
          {hoveredPoint && (
            <g>
              <rect
                x={hoveredPoint.x - hoveredPoint.label.length * 3}
                y={Math.max(0, hoveredPoint.y - 28)}
                width={hoveredPoint.label.length * 6 + 8}
                height={20}
                rx={4}
                ry={4}
                fill="black"
                opacity={0.8}
              />
              <text
                x={hoveredPoint.x - hoveredPoint.label.length * 3 + 4}
                y={Math.max(0, hoveredPoint.y - 14)}
                className="text-xs fill-white"
              >
                {hoveredPoint.label}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}