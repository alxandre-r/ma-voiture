"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface FillChartSkeletonProps {
  barsCount?: number;
}

export default function FillChartSkeleton({ barsCount = 8 }: FillChartSkeletonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0); // largeur par défaut SSR

  const padding = { top: 30, bottom: 50, left: 60, right: 60 };
  const containerHeight = 160;

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const innerWidth = containerWidth - padding.left - padding.right;
  const innerHeight = containerHeight;

  // Barres déterministes pour éviter le mismatch SSR/CSR
  const heights = Array.from({ length: barsCount }, (_, i) => 40 + (i % 4) * 15);
    const bars = heights.map((h, i) => {
    const barWidth = Math.min(20, innerWidth / (barsCount * 1.5));
    const x = padding.left + (i * innerWidth) / (barsCount - 1) - barWidth / 2; 
    const y = padding.top + innerHeight - h;
    return { x, y, width: barWidth, height: h };
    });


  return (
    <div
      ref={containerRef}
      className="w-full mt-6 relative bg-white dark:bg-gray-800 rounded-xl py-4 shadow-sm dark:shadow-xl px-2 lg:px-4 animate-pulse"
      style={{ minHeight: containerHeight + padding.top + padding.bottom }}
    >
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-8 w-44 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>

      <svg width={containerWidth} height={containerHeight + padding.top + padding.bottom}>
        {[0, 1, 2, 3].map((_, i) => {
          const y = padding.top + (innerHeight / 4) * i;
          return (
            <line
              key={i}
              x1={padding.left}
              x2={containerWidth - padding.right}
              y1={y}
              y2={y}
              className="stroke-gray-200 dark:stroke-gray-700"
            />
          );
        })}

        {bars.map((bar, i) => (
          <motion.rect
            key={i}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            rx={6}
            ry={6}
            className="fill-gray-200 dark:fill-gray-700"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        ))}

        <line
          x1={padding.left}
          x2={containerWidth - padding.right}
          y1={innerHeight + padding.top}
          y2={innerHeight + padding.top}
          className="stroke-gray-300 dark:stroke-gray-500"
        />
      </svg>
    </div>
  );
}