"use client";

import React from "react";

interface FillChartProps {
  data: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

export default function FillChart({ data }: FillChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Aucune donnée disponible pour le graphique.</p>
        <p className="text-sm mt-1">Ajoute des pleins pour voir tes statistiques.</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  const containerHeight = 160;
  const minBarHeight = 6;
  const valueOffset = 8;

  const formatMonth = (monthString: string) => {
    const parts = monthString.split("-");
    if (parts.length >= 2 && parts[0].length === 4) {
      const year = parts[0];
      const month = parseInt(parts[1], 10);
      const monthNames = [
        "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
        "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
      ];
      return `${monthNames[Math.max(0, month - 1)]} ${year.slice(2)}`;
    }
    return monthString;
  };

  return (
    <div className="w-full">
      <h4 className="text-sm font-medium mb-3">Dépenses mensuelles en carburant</h4>

      {/* CHART CONTAINER */}
      <div className="relative w-full overflow-x-auto pl-1" style={{ paddingBottom: 24, paddingTop: 46 }}>
        {/* Bars row */}
        <div
          className="flex items-end gap-1 min-w-[350px]"
          style={{ height: `${containerHeight}px` }}
        >
          {data.map((item, idx) => {
            const barHeight = Math.max(
              (item.amount / maxAmount) * containerHeight,
              minBarHeight
            );

            return (
              <div
                key={idx}
                className="relative flex-1 flex flex-col items-center min-w-0"
              >
                {/* Value label */}
                <div
                  className="absolute text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  style={{
                    bottom: `${barHeight + valueOffset}px`,
                    transform: "translateX(-50%)",
                    left: "50%",
                  }}
                >
                  {item.amount.toFixed(0)}€
                </div>

                {/* Bar */}
                <div
                  title={`${formatMonth(item.month)} — ${item.amount.toFixed(
                    2
                  )} € — ${item.count} plein(s)`}
                  className="flex items-end justify-center h-full w-full"
                >
                  <div
                    className="bg-blue-500 rounded-t-md w-full"
                    style={{ height: `${barHeight}px` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Month labels - aligned with bars */}
        <div className="mt-2 flex gap-1 pl-1">
          {data.map((item, idx) => (
            <div key={idx} className="flex-1 min-w-[60px] text-center">
              <span className="text-xs text-gray-400 truncate block">
                {formatMonth(item.month)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}