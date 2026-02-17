"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFills } from "@/contexts/FillContext";
import { useContainerSize, useMonthTicks, useDateRange, useMobileDetection, clampTooltipX, Padding } from "./ChartHelper";

interface FillPoint {
  date: string;
  amount: number;
}

interface VehicleFillSeries {
  vehicleId: string;
  vehicleName: string;
  color?: string;
  points: FillPoint[];
}

interface FillChartProps {
  vehicles: VehicleFillSeries[];
}

export default function FillChart({ vehicles }: FillChartProps) {
  const { selectedPeriod } = useFills();
  const [size, containerRef] = useContainerSize({ width: 600, height: 240 });
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string } | null>(null);
  const [mode, setMode] = useState<"plein" | "mensuel">("mensuel");

  const padding: Padding = { top: 30, bottom: 50, left: 60, right: 20 };
  const containerHeight = 160;
  const innerWidth = size.width - padding.left - padding.right;
  const innerHeight = containerHeight;
  const mobile = useMobileDetection();
  const radiusTop = 12;

  // ---- Barres filtrées et visibles ----
  const filteredVehicles = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    switch (selectedPeriod) {
      case "3m": startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); break;
      case "6m": startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1); break;
      case "12m": startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1); break;
      default: startDate = new Date(0);
    }

    return vehicles.map(v => {
      const filteredPoints = v.points.filter(p => {
        const d = new Date(p.date);
        return d >= startDate && d <= now;
      });
      return {
        ...v,
        points: filteredPoints.map(p => ({
          ...p,
          vehicleId: v.vehicleId,
          vehicleName: v.vehicleName,
          color: v.color,
          isVisible: true,
        }))
      };
    });
  }, [vehicles, selectedPeriod]);

  const barsWithVisibility = useMemo(() => {
    return filteredVehicles.flatMap(v => v.points);
  }, [filteredVehicles]);

  const visibleBars = useMemo(() => barsWithVisibility.filter(b => b.isVisible), [barsWithVisibility]);

  if (!barsWithVisibility.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Aucune donnée disponible pour le graphique.</p>
      </div>
    );
  }

  // ---- Dates min/max pour visible bars uniquement ----
  const { minDate, maxDate } = useDateRange(visibleBars);

  const getX = (date: string | Date) =>
    padding.left + ((new Date(date).getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * innerWidth;
  const getY = (amount: number, maxAmount: number) => padding.top + innerHeight * (1 - amount / maxAmount);

  const maxStackAmount = useMemo(() => {
    if (mode === "mensuel") {
      const monthMap: Record<string, number> = {};
      barsWithVisibility.forEach(p => {
        const d = new Date(p.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthMap[key] = (monthMap[key] || 0) + p.amount;
      });
      return Math.max(...Object.values(monthMap), 10);
    }
    return Math.max(...barsWithVisibility.map(p => p.amount), 10);
  }, [barsWithVisibility, mode]);

  const baseBarWidth = mobile
    ? Math.min(6, innerWidth / (visibleBars.length * 1.2))
    : Math.min(20, innerWidth / (visibleBars.length * 1.2));

  type Bar = {
    id: string;
    color?: string;
    vehicleName: string;
    date: string;
    amount: number;
    isVisible: boolean;
    xPlein: number;
    yPlein: number;
    widthPlein: number;
    heightPlein: number;
    xMonth: number;
    yMonth: number;
    widthMonth: number;
    heightMonth: number;
  };

  const bars: Bar[] = useMemo(() => {
    const monthStacks: Record<string, Bar[]> = {};
    const b: Bar[] = [];

    barsWithVisibility.forEach(p => {
      const xPlein = getX(p.date);
      const yPlein = getY(p.amount, maxStackAmount);
      const heightPlein = Math.max(getY(0, maxStackAmount) - yPlein, 6);

      const bar: Bar = {
        id: `${p.vehicleId}-${p.date}`,
        color: p.color,
        vehicleName: p.vehicleName,
        date: p.date,
        amount: p.amount,
        isVisible: p.isVisible,
        xPlein,
        yPlein,
        widthPlein: baseBarWidth,
        heightPlein,
        xMonth: 0,
        yMonth: 0,
        widthMonth: 0,
        heightMonth: 0,
      };

      const key = `${new Date(p.date).getFullYear()}-${new Date(p.date).getMonth()}`;
      if (!monthStacks[key]) monthStacks[key] = [];
      monthStacks[key].push(bar);

      b.push(bar);
    });

    // Stacking mensuel
    Object.values(monthStacks).forEach(stack => {
      let cumulative = 0;
      const monthStart = new Date(stack[0].date);
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const xCenter = (getX(monthStart) + getX(monthEnd)) / 2;
      const widthMonth = getX(monthEnd) - getX(monthStart) - 4;

      stack.sort((a, b) => b.amount - a.amount).forEach(bar => {
        const h = Math.max(getY(0, maxStackAmount) - getY(bar.amount, maxStackAmount), 6);
        const y = getY(cumulative + bar.amount, maxStackAmount);
        cumulative += bar.amount;

        bar.xMonth = xCenter - widthMonth / 2;
        bar.yMonth = y;
        bar.widthMonth = widthMonth;
        bar.heightMonth = h;
      });
    });

    return b;
  }, [barsWithVisibility, getX, getY, maxStackAmount, baseBarWidth]);

  const monthTotals = useMemo(() => {
    const totals: Record<string, { total: number; topBar: Bar }> = {};
    const stacks: Record<string, Bar[]> = {};

    bars.forEach(b => {
      const key = `${new Date(b.date).getFullYear()}-${new Date(b.date).getMonth()}`;
      if (!stacks[key]) stacks[key] = [];
      stacks[key].push(b);
    });

    Object.entries(stacks).forEach(([key, stack]) => {
      const total = stack.reduce((s, b) => s + b.amount, 0);
      const topBar = stack.reduce((prev, curr) => (curr.yMonth < prev.yMonth ? curr : prev), stack[0]);
      totals[key] = { total, topBar };
    });

    return totals;
  }, [bars]);

  const clampTooltip = (x: number, textLength: number) => {
    return clampTooltipX(x, textLength, size, padding);
  };

  const yLines = useMemo(() => {
    const maxLines = 3;

    if (maxStackAmount <= 0) return [];

    const rawStep = maxStackAmount / maxLines;

    // On arrondit à une valeur "propre"
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;

    let niceStep;
    if (normalized < 1.5) niceStep = 1;
    else if (normalized < 3) niceStep = 2;
    else if (normalized < 7) niceStep = 5;
    else niceStep = 10;

    const step = niceStep * magnitude;

    const lines: number[] = [];
    for (let v = step; v <= maxStackAmount; v += step) {
      lines.push(v);
    }

    return lines;
  }, [maxStackAmount]);


  const monthTicks = useMonthTicks(minDate, maxDate, getX, mobile, visibleBars);

  // ---- Render ----
  return (
    <div className="w-full mt-6 relative bg-white dark:bg-gray-800 rounded-xl py-4 shadow-sm dark:shadow-xl px-2 lg:px-4">
    {/* Header avec titre et toggle */}
    <div className="flex items-center justify-between px-2 lg:px-4 mb-2">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Pleins enregistrés
      </h3>

      {/* Toggle comparatif / mensuel */}
      <motion.button
        type="button"
        role="switch"
        aria-checked={mode === "mensuel"}
        onClick={() => setMode(mode === "plein" ? "mensuel" : "plein")}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative w-44 h-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full cursor-pointer 
        flex items-center p-1 border border-gray-100 hover:shadow-sm transition-all 
        dark:border-gray-700 dark:hover:shadow-xl dark:from-gray-800 dark:to-gray-900"
      >
        <motion.div
          className="absolute w-20 h-6 bg-gradient-to-tl from-custom-1 to-violet-400 rounded-full shadow-md dark:shadow-xl"
          animate={{ x: mode === "plein" ? 0 : 86 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />

        <div className="flex justify-between w-full px-3 text-xs font-medium z-20">
          <span className={mode === "plein" ? "text-white" : "text-gray-700 dark:text-gray-300"}>
            Par plein
          </span>
          <span className={mode === "mensuel" ? "text-white" : "text-gray-700 dark:text-gray-300"}>
            Par mois
          </span>
        </div>
      </motion.button>
    </div>

      <div ref={containerRef} className="relative w-full" style={{ minHeight: containerHeight + padding.top + padding.bottom }}>
        <svg width="100%" height={containerHeight + padding.top + padding.bottom}>
          {/* Y lines */}
          {yLines.map((amt, i) => (
            <line key={i} x1={padding.left} x2={size.width - padding.right} y1={getY(amt, maxStackAmount)} y2={getY(amt, maxStackAmount)} stroke="rgba(0,0,0,0.05)" />
          ))}
          {yLines.map((amt, i) => (
            <text key={i} x={padding.left - 8} y={getY(amt, maxStackAmount) + 4} textAnchor="end" className="text-xs fill-gray-400">{amt} €</text>
          ))}

          {/* Bars */}
          <AnimatePresence>
            {bars.map(bar => {
              const xTarget = mode === "plein" ? bar.xPlein : bar.xMonth;
              const yTarget = mode === "plein" ? bar.yPlein : bar.yMonth;
              const width = mode === "plein" ? bar.widthPlein : bar.widthMonth;
              const height = mode === "plein" ? bar.heightPlein : bar.heightMonth;

              const isTop =
                mode === "mensuel"
                  ? monthTotals[`${new Date(bar.date).getFullYear()}-${new Date(bar.date).getMonth()}`]?.topBar?.id === bar.id
                  : Math.max(...bars.filter(b => b.date === bar.date).map(b => b.amount)) === bar.amount;

              const mainBarHeight = isTop ? Math.max(height - radiusTop + 6, 0) : height;
              const mainBarY = isTop ? yTarget + radiusTop - 6 : yTarget;

              // Définir le décalage pour le rect arrondi
              const roundedY = isTop ? yTarget : yTarget - 6; // <- ici le décalage pour cacher l'arrondi
              const roundedHeight = radiusTop;

              const offset = width + 50;
              const xInitial = bar.isVisible ? xTarget : -offset;

              return (
                <g key={bar.id}>
                  {/* Barre principale */}
                  <motion.rect
                    layout
                    initial={{ x: xInitial, y: mainBarY, width, height: mainBarHeight }}
                    animate={{ x: bar.isVisible ? xTarget : -offset, y: mainBarY, width, height: mainBarHeight }}
                    exit={{ x: -offset, y: mainBarY, width, height: mainBarHeight }}
                    fill={bar.color}
                    className="hover:opacity-80 cursor-pointer"
                    transition={{ type: "spring", stiffness: 140, damping: 20 }}
                    onMouseEnter={() =>
                      setHoveredPoint({
                        x: xTarget + width / 2,
                        y: yTarget,
                        label: `${bar.vehicleName}: ${bar.amount.toFixed(2)}€ (${new Date(bar.date).toLocaleDateString("fr-FR")})`,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {/* Rect arrondi */}
                  <motion.rect
                    layout
                    initial={{ x: xInitial, y: roundedY, width, height: roundedHeight }}
                    animate={{ x: bar.isVisible ? xTarget : -offset, y: roundedY, width, height: roundedHeight }}
                    exit={{ x: -offset, y: roundedY, width, height: roundedHeight }}
                    fill={bar.color}
                    rx={radiusTop}
                    ry={radiusTop}
                    transition={{ type: "spring", stiffness: 140, damping: 20 }}
                  />
                </g>
              );
            })}
          </AnimatePresence>


          {/* Montants totaux */}
          {Object.values(monthTotals).map(({ total, topBar }) => {
            const isVisible = topBar.isVisible;

            // Montants mensuels (stackés)
            if (mode === "mensuel") {
              return (
                <motion.text
                  key={topBar.id + "-total"}
                  initial={{ opacity: 0, y: topBar.yMonth + radiusTop + 10 }}
                  animate={{
                  opacity: isVisible ? 1 : 0,
                  x: topBar.xMonth + topBar.widthMonth / 2,
                  y: topBar.yMonth + radiusTop + 2
                  }}
                  exit={{ opacity: 0, y: topBar.yMonth + radiusTop + 10 }}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium"
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                >
                  {mobile ? total.toFixed(0) : total.toFixed(2)}€
                </motion.text>
              );
            }

            // Montants plein (desktop uniquement)
            if (mode === "plein" && !mobile) {
              return (
                <motion.text
                  key={topBar.id + "-total-plein"}
                  initial={{ opacity: 0, y: topBar.yPlein - 4 }}
                  animate={{
                    opacity: isVisible ? 1 : 0,
                    x: topBar.xPlein + topBar.widthPlein / 2,
                    y: topBar.yPlein - 4
                  }}
                  exit={{ opacity: 0, y: topBar.yPlein - 4 }}
                  textAnchor="middle"
                  className="text-xs fill-black font-medium"
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                >
                </motion.text>
              );
            }

            return null;
          })}

          {/* Axe X */}
          <line
            x1={padding.left}
            x2={size.width - padding.right}
            y1={innerHeight + padding.top}
            y2={innerHeight + padding.top}
            stroke="rgba(0,0,0,0.2)"
          />

          {/* Ticks et labels X animés */}
          <AnimatePresence>
            {monthTicks.map(t => {
              const xInitial = t.isVisible ? t.x : -50;

              return (
                <motion.g
                  key={t.id}
                  initial={{ x: xInitial, opacity: 0 }}
                  animate={{ x: t.x, opacity: t.isVisible ? 1 : 0 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                >
                  <line x1={0} x2={0} y1={innerHeight + padding.top} y2={innerHeight + padding.top + 6} stroke="rgba(0,0,0,0.2)" />
                  {t.showLabel && (
                    <text x={0} y={innerHeight + padding.top + 16} textAnchor="middle" className="text-xs fill-gray-400">
                      {t.label}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Hover */}
          {hoveredPoint && (
            <g>
              <rect
                x={clampTooltip(hoveredPoint.x, hoveredPoint.label.length)}
                y={Math.max(0, hoveredPoint.y - 28)}
                width={hoveredPoint.label.length * 6 + 8}
                height={20}
                rx={4}
                ry={4}
                fill="black"
                opacity={0.8}
              />
              <text
                x={clampTooltip(hoveredPoint.x, hoveredPoint.label.length) + 4}
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