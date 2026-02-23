"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function OdometerChartSkeleton() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0); // largeur par défaut SSR

    const padding = { top: 30, bottom: 50, left: 60, right: 60 };
    const containerHeight = 160;

    useEffect(() => {
        const updateWidth = () => {
        if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const innerWidth = containerWidth - padding.left - padding.right;
    const innerHeight = containerHeight;
    const pointsCount = 6;

    // Création de points pour la courbe fictive
    const points = Array.from({ length: pointsCount }, (_, i) => {
    const x = padding.left + (i * innerWidth) / (pointsCount - 1);
    const y = padding.top + innerHeight * (0.7 - (i % 3) * 0.1);
    return { x, y };
    });



    // Génère un path SVG lisse
    const pathD = points
        .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(" ");

    return (
        <div
        ref={containerRef}
        className="w-full mt-6 relative bg-white dark:bg-gray-800 rounded-xl py-4 shadow-sm dark:shadow-xl px-2 lg:px-4 animate-pulse"
        style={{ minHeight: containerHeight + padding.top + padding.bottom }}
        >
        <div className="flex items-center justify-between px-2 mb-2">
            <div className="h-6 w-48 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-8 w-44 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>

        <svg width={containerWidth} height={containerHeight + padding.top + padding.bottom}>
            {/* Axe Y (grille) */}
            {[0, 0.5, 1].map((f, i) => {
            const y = padding.top + (1 - f) * innerHeight;
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

            {/* Axe X */}
            <line
            x1={padding.left}
            x2={containerWidth - padding.right}
            y1={padding.top + innerHeight}
            y2={padding.top + innerHeight}
            className="stroke-gray-200 dark:stroke-gray-700"
            />

            {/* Courbe skeleton animée */}
            <motion.path
            d={pathD}
            strokeWidth={3}
            fill="none"
            className="stroke-gray-300 dark:stroke-gray-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            />

            {/* Points sur la courbe */}
            {points.map((p, i) => (
            <motion.circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                className="fill-gray-300 dark:fill-gray-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
            />
            ))}
        </svg>
        </div>
    );
}