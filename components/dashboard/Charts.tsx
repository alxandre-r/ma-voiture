// components/fill/FillCharts.tsx
"use client";

import React from "react";
import { useFills } from "@/contexts/FillContext";
import FillChart from "./charts/FillChart";
import OdometerChart from "./charts/OdometerChart";

export default function FillCharts() {
  const { stats, fills, selectedVehicleId, getFilteredStats } = useFills();

  const filteredStats = getFilteredStats(selectedVehicleId);

  if (!stats || !fills || fills.length === 0) return null;

  const monthlyChart = filteredStats.monthly_chart || [];

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    return value.toFixed(2) + " €";
  };

  const hasOdometer = monthlyChart.filter((m: { odometer: number | null }) => m.odometer !== null).length > 0;

  return (
    <div className="space-y-4">
      {/* Key metrics */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 sm:p-3 lg:p-4">
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 sm:gap-3">
          <div className="bg-gray-200 p-2 rounded sm:p-3">
            <div className="text-gray-700 text-xs">Consommation moyenne</div>
            <div className="text-gray-800 font-medium text-lg sm:text-xl">
              {filteredStats.avg_consumption} L/100km
            </div>
          </div>

          <div className="bg-gray-200 p-2 rounded sm:p-3">
            <div className="text-gray-700 text-xs">Coût total</div>
            <div className="text-gray-800 font-medium text-lg sm:text-xl">
              {formatCurrency(filteredStats.total_cost)}
            </div>
          </div>

          <div className="bg-gray-200 p-2 rounded sm:p-3">
            <div className="text-gray-700 text-xs">Prix moyen/L</div>
            <div className="text-gray-800 font-medium text-lg sm:text-xl">
              {formatCurrency(filteredStats.avg_price_per_liter)}
            </div>
          </div>
        </div>

        {/* Charts: limit to last 6 months on small screens */}
        <div className="mt-4 space-y-4">
          {monthlyChart && monthlyChart.length > 0 && (
            <div>
              <FillChart data={monthlyChart.slice(-6)} />
            </div>
          )}

          {hasOdometer && (
            <div>
              <OdometerChart
                data={monthlyChart
                  .slice(-6)
                  .map((item: { month: string; odometer: number | null }) => ({ month: item.month, odometer: item.odometer || 0 }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}