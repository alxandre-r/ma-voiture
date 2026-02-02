// components/fill/FillCharts.tsx
"use client";

import React from "react";
import { useFills } from "@/contexts/FillContext";
import FillChart from "./charts/FillChart";
import OdometerChart from "./charts/OdometerChart";

export default function FillCharts() {
  const { stats, fills, selectedVehicleIds, getFilteredStats, loading, error } = useFills();

  const filteredStats = getFilteredStats(selectedVehicleIds);

  if (!stats || !fills || fills.length === 0) return null;

  const monthlyChart = filteredStats.monthly_chart || [];

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    return value.toFixed(2) + " €";
  };

  const hasOdometer = monthlyChart.filter((m: { odometer: number | null }) => m.odometer !== null).length > 0;

  return (
    <div className="space-y-4">


        {(filteredStats.avg_consumption !== null && filteredStats.avg_consumption !== 0) ||
        (filteredStats.total_cost !== null && filteredStats.total_cost !== 0) ||
        (filteredStats.avg_price_per_liter !== null && filteredStats.avg_price_per_liter !== 0) ? (
        <>
          {/* Key metrics */} 
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 sm:p-3 lg:p-4">
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 sm:gap-3">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded sm:p-3">
                <div className="text-gray-700 dark:text-gray-300 text-xs">Consommation moyenne</div>
                <div className="text-gray-800 dark:text-gray-100 font-medium text-lg sm:text-xl">
                  {filteredStats.avg_consumption} L/100km
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded sm:p-3">
                <div className="text-gray-700 dark:text-gray-300 text-xs">Coût total</div>
                <div className="text-gray-800 dark:text-gray-100 font-medium text-lg sm:text-xl">
                  {formatCurrency(filteredStats.total_cost)}
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded sm:p-3">
                <div className="text-gray-700 dark:text-gray-300 text-xs">Prix moyen/L</div>
                <div className="text-gray-800 dark:text-gray-100 font-medium text-lg sm:text-xl">
                  {formatCurrency(filteredStats.avg_price_per_liter)}
                </div>
              </div>
            </div>
          </div>
        </>
        ) : (
          // nothing
          <></>
        )}


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
  );
}