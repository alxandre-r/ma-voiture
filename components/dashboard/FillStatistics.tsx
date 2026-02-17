"use client";

import { formatCurrency } from "@/lib/fillUtils";

type FillStatisticsProps = {
  filteredStats: {
    avg_consumption: number;
    total_cost: number;
    avg_price_per_liter: number;
  };
};

export default function FillStatistics({ filteredStats }: FillStatisticsProps) {
  if (!filteredStats) return null;

  return (
    <div className="flex gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3">

      {/* Consommation moyenne */}
      <div className="flex-1 rounded-2xl bg-white dark:bg-gray-800 p-2 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition hover:shadow-md dark:border-none">
        <p className="hidden lg:block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Consommation moyenne
        </p>
        <p className="lg:hidden text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Consommation
        </p>
        <p className="mt-1 text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
          {filteredStats.avg_consumption.toFixed(1)}
          <span className="ml-1 text-sm sm:text-base font-normal text-gray-500 dark:text-gray-400">
            L/100km
          </span>
        </p>
      </div>

      {/* Coût total */}
      <div className="flex-1 rounded-2xl bg-white dark:bg-gray-800 p-2 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition hover:shadow-md dark:border-none">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Coût total
        </p>
        <p className="mt-1 text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
          {formatCurrency(filteredStats.total_cost)}
        </p>
      </div>

      {/* Prix moyen / L */}
      <div className="flex-1 rounded-2xl bg-white dark:bg-gray-800 p-2 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition hover:shadow-md dark:border-none">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Prix moyen / L
        </p>
        <p className="mt-1 text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
          {formatCurrency(filteredStats.avg_price_per_liter)}
        </p>
      </div>

    </div>
  );
}
