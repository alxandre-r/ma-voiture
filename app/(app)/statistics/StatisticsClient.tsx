/**
 * @file app/statistics/StatisticsClient.tsx
 * @description Orchestrates data fetching, filtering, and layout for the statistics page.
 * All computation is delegated to statisticsUtils; all fetching to useExpenses.
 */

'use client';

import { useMemo } from 'react';

import {
  StatisticsOverview,
  ExpenseCategoryChart,
  MonthlyExpenseChart,
  VehicleComparison,
  BottomStats,
} from '@/app/(app)/statistics/components';
import CarbonFootprint from '@/app/(app)/statistics/components/CarbonFootprint';
import OdometerEvolutionChart from '@/app/(app)/statistics/components/charts/OdometerEvolutionChart';
import { useSelectors } from '@/contexts/SelectorsContext';
import { filterExpenses, computeStatistics } from '@/lib/utils/statisticsUtils';

import { useExpenses } from './hooks/useExpenses';
import Loading from './loading';

import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

interface StatisticsClientProps {
  vehicles: (Vehicle | VehicleMinimal)[];
}

export default function StatisticsClient({ vehicles }: StatisticsClientProps) {
  const { selectedVehicleIds, selectedPeriod } = useSelectors();
  const vehicleIds = useMemo(() => vehicles.map((v) => v.vehicle_id), [vehicles]);

  const { expenses, isLoading } = useExpenses(vehicleIds);

  const filteredExpenses = useMemo(
    () => filterExpenses(expenses, selectedVehicleIds, selectedPeriod),
    [expenses, selectedVehicleIds, selectedPeriod],
  );

  const stats = useMemo(
    () =>
      computeStatistics(filteredExpenses, expenses, vehicles, selectedVehicleIds, selectedPeriod),
    [filteredExpenses, expenses, vehicles, selectedVehicleIds, selectedPeriod],
  );

  if (isLoading) {
    return <Loading />;
  }

  const vehiclesForChart = selectedVehicleIds.map((id) => {
    const v = vehicles.find((v) => v.vehicle_id === id);
    return { vehicle_id: id, name: v?.name || `Véhicule ${id}`, color: v?.color || 'gray' };
  });

  return (
    <div className="space-y-4 px-2 sm:px-0">
      <StatisticsOverview
        totalCost={stats.totalCost}
        fillsCount={stats.totalExpenses}
        annualProjection={stats.annualProjection}
        annualKmProjection={stats.annualKmProjection}
        monthsWithData={stats.monthsWithData}
        previousPeriodCost={stats.previousPeriodCost}
        selectedPeriod={selectedPeriod}
        totalKilometers={stats.totalKilometers}
        costPerKm={stats.costPerKm}
      />

      <MonthlyExpenseChart
        data={stats.expensesByMonth}
        vehicleData={stats.vehicleExpensesByMonth}
        vehicles={vehiclesForChart}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.vehicleStats.length > 1 && (
          <VehicleComparison vehicleStats={stats.vehicleStats} totalCost={stats.totalCost} />
        )}
        <ExpenseCategoryChart data={stats.expenseByCategory} totalCost={stats.totalCost} />
        <BottomStats
          totalLiters={stats.totalLiters}
          avgFillAmount={stats.avgFillAmount}
          avgPricePerLiter={0}
          totalKilometers={stats.totalKilometers}
          electricShare={stats.electricShare}
          hasElectricVehicle={stats.hasElectricVehicle}
          avgConsumption={stats.avgConsumption}
          costPerKm={stats.costPerKm}
        />
      </div>

      <CarbonFootprint
        totalCO2Kg={stats.totalCO2Kg}
        co2PerKm={stats.co2PerKm}
        totalKilometers={stats.totalKilometers}
        totalLiters={stats.totalLiters}
        co2Method={stats.co2Method}
        officialCO2VehicleNames={stats.officialCO2VehicleNames}
        annualKmProjection={stats.annualKmProjection}
      />

      <OdometerEvolutionChart series={stats.odometerSeries} />
    </div>
  );
}
