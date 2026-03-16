/**
 * @file app/statistics/StatisticsClient.tsx
 */

'use client';

import { useEffect, useMemo, useState } from 'react';

import SelectorsHeader from '@/components/common/SelectorsHeader';
import Spinner from '@/components/common/ui/Spinner';
import { EXPENSE_CATEGORIES } from '@/components/expenses/expenseCategories';
import {
  StatisticsOverview,
  ExpenseCategoryChart,
  MonthlyExpenseChart,
  VehicleComparison,
  BottomStats,
} from '@/components/statistics';
import OdometerEvolutionChart from '@/components/statistics/charts/OdometerEvolutionChart';
import { SelectorsProvider, useSelectors } from '@/contexts/SelectorsContext';
import { getCategoryName } from '@/types/expense';

import type { Expense } from '@/types/expense';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MonthlyData = {
  month: string;
  Carburant: number;
  Assurance: number;
  Entretien: number;
  Autre: number;
  total: number;
};

type VehicleMonthlyData = {
  month: string;
  [vehicleId: number]: number | string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns an array of { sortKey: "YYYY-MM", displayKey: "mmm AA" } for the given period. */
function buildMonthKeys(
  selectedPeriod: string,
  now: Date,
  monthsNum: number,
): { sortKey: string; displayKey: string }[] {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { year: '2-digit', month: 'short' });

  if (selectedPeriod === 'year') {
    return Array.from({ length: currentMonth + 1 }, (_, i) => {
      const d = new Date(currentYear, i, 1);
      return { sortKey: `${d.getFullYear()}-${String(i).padStart(2, '0')}`, displayKey: fmt(d) };
    });
  }

  const count = selectedPeriod === 'month' ? 1 : monthsNum;
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return {
      sortKey: `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`,
      displayKey: fmt(d),
    };
  });
}

// ---------------------------------------------------------------------------
// StatisticsContent
// ---------------------------------------------------------------------------

function StatisticsContent({ vehicles }: { vehicles: (Vehicle | VehicleMinimal)[] }) {
  const { selectedVehicleIds, selectedPeriod } = useSelectors();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const vehicleIds = useMemo(() => vehicles.map((v) => v.vehicle_id), [vehicles]);

  useEffect(() => {
    if (!vehicleIds.length) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }

    fetch(`/api/expenses/get?vehicleIds=${vehicleIds.join(',')}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.expenses) setExpenses(data.expenses);
      })
      .catch((err) => console.error('Failed to fetch expenses:', err))
      .finally(() => setIsLoading(false));
  }, [vehicleIds]);

  // Filter by selected vehicles + period
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const cutoffs: Record<string, Date> = {
      month: new Date(now.getFullYear(), now.getMonth(), 1),
      year: new Date(now.getFullYear(), 0, 1),
    };
    return expenses.filter((e) => {
      if (!selectedVehicleIds.includes(e.vehicle_id)) return false;
      const cutoff = cutoffs[selectedPeriod];
      return cutoff ? new Date(e.date) >= cutoff : true;
    });
  }, [expenses, selectedVehicleIds, selectedPeriod]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // --- Period length ---
    let monthsNum = 12;
    if (selectedPeriod === 'year') {
      monthsNum = currentMonth + 1;
    } else if (selectedPeriod === 'all') {
      const filtered = expenses.filter((e) => selectedVehicleIds.includes(e.vehicle_id));
      if (filtered.length) {
        const times = filtered.map((e) => new Date(e.date).getTime());
        const min = new Date(Math.min(...times));
        const max = new Date(Math.max(...times));
        monthsNum =
          (max.getFullYear() - min.getFullYear()) * 12 + (max.getMonth() - min.getMonth()) + 1;
      }
    }

    const monthKeys = buildMonthKeys(selectedPeriod, now, monthsNum);

    // --- Odometer series (for OdometerEvolutionChart) ---
    const odometerSeries = selectedVehicleIds.map((vehicleId) => {
      const vehicle = vehicles.find((v) => v.vehicle_id === vehicleId);
      return {
        vehicle_id: vehicleId,
        name: vehicle?.name ?? `Véhicule ${vehicleId}`,
        color: vehicle?.color ?? undefined,
        entries: filteredExpenses
          .filter(
            (e) =>
              e.vehicle_id === vehicleId && (e as Expense & { odometer?: number }).odometer! > 0,
          )
          .map((e) => ({
            date: e.date,
            odometer: (e as Expense & { odometer?: number }).odometer!,
          })),
      };
    });

    // --- Early return when no data ---
    if (!filteredExpenses.length) {
      return {
        totalExpenses: 0,
        totalCost: 0,
        fuelCost: 0,
        electricChargeCost: 0,
        insuranceCost: 0,
        maintenanceCost: 0,
        otherCost: 0,
        energyCost: 0,
        fillsCount: 0,
        avgFillAmount: 0,
        totalKilometers: 0,
        electricShare: 0,
        avgConsumption: 0,
        hasElectricVehicle: false,
        totalLiters: 0,
        avgCostPerMonth: 0,
        annualProjection: 0,
        monthsWithData: 0,
        previousPeriodCost: 0,
        trendPercentage: 0,
        firstExpenseDate: null as string | null,
        lastExpenseDate: null as string | null,
        expensesByMonth: [] as MonthlyData[],
        expenseByCategory: [] as { name: string; value: number; color: string }[],
        vehicleStats: [] as ReturnType<typeof buildVehicleStats>,
        vehicleExpensesByMonth: [] as VehicleMonthlyData[],
        odometerSeries,
      };
    }

    // --- Costs by category ---
    let fuelCost = 0,
      electricChargeCost = 0,
      insuranceCost = 0,
      maintenanceCost = 0,
      otherCost = 0;
    filteredExpenses.forEach(({ type, amount = 0 }) => {
      if (type === 'fuel') fuelCost += amount;
      else if (type === 'electric_charge') electricChargeCost += amount;
      else if (type === 'insurance') insuranceCost += amount;
      else if (type === 'maintenance') maintenanceCost += amount;
      else otherCost += amount;
    });

    const energyCost = fuelCost + electricChargeCost;
    const totalCost = energyCost + insuranceCost + maintenanceCost + otherCost;

    // --- Monthly expenses ---
    const expensesMonthMap = new Map<string, MonthlyData>(
      monthKeys.map(({ sortKey, displayKey }) => [
        sortKey,
        { month: displayKey, Carburant: 0, Assurance: 0, Entretien: 0, Autre: 0, total: 0 },
      ]),
    );
    filteredExpenses.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const row = expensesMonthMap.get(key);
      if (!row) return;
      const cat = getCategoryName(e.type);
      const amount = e.amount ?? 0;
      if (cat === 'Carburant') row.Carburant += amount;
      else if (cat === 'Assurance') row.Assurance += amount;
      else if (cat === 'Entretien') row.Entretien += amount;
      else row.Autre += amount;
      row.total += amount;
    });
    const expensesByMonth = Array.from(expensesMonthMap.values());

    // --- Vehicle monthly expenses ---
    const vehicleMonthMap = new Map<string, VehicleMonthlyData>(
      monthKeys.map(({ sortKey, displayKey }) => {
        const entry: VehicleMonthlyData = { month: displayKey };
        selectedVehicleIds.forEach((vid) => (entry[vid] = 0));
        return [sortKey, entry];
      }),
    );
    filteredExpenses.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const row = vehicleMonthMap.get(key);
      if (row) row[e.vehicle_id] = ((row[e.vehicle_id] as number) || 0) + (e.amount ?? 0);
    });
    const vehicleExpensesByMonth = Array.from(vehicleMonthMap.values());

    // --- Projections & trends ---
    const avgCostPerMonth = totalCost / monthsNum;
    const currentYearCost = expenses
      .filter(
        (e) =>
          new Date(e.date).getFullYear() === currentYear &&
          selectedVehicleIds.includes(e.vehicle_id),
      )
      .reduce((s, e) => s + (e.amount ?? 0), 0);
    const annualProjection = (currentYearCost / (currentMonth + 1)) * 12;

    let previousPeriodCost = 0;
    if (selectedPeriod === 'month') {
      const pm = currentMonth === 0 ? 11 : currentMonth - 1;
      const py = currentMonth === 0 ? currentYear - 1 : currentYear;
      previousPeriodCost = expenses
        .filter((e) => {
          const d = new Date(e.date);
          return (
            d.getMonth() === pm &&
            d.getFullYear() === py &&
            selectedVehicleIds.includes(e.vehicle_id)
          );
        })
        .reduce((s, e) => s + (e.amount ?? 0), 0);
    } else if (selectedPeriod === 'year') {
      previousPeriodCost = expenses
        .filter(
          (e) =>
            new Date(e.date).getFullYear() === currentYear - 1 &&
            selectedVehicleIds.includes(e.vehicle_id),
        )
        .reduce((s, e) => s + (e.amount ?? 0), 0);
    }
    const trendPercentage =
      previousPeriodCost > 0 ? ((totalCost - previousPeriodCost) / previousPeriodCost) * 100 : 0;

    // --- Expense by category (pie) ---
    const expenseByCategory = EXPENSE_CATEGORIES.map((cat) => ({
      name: cat.name,
      color: cat.color,
      value:
        cat.name === 'Carburant'
          ? energyCost
          : cat.name === 'Assurance'
            ? insuranceCost
            : cat.name === 'Entretien'
              ? maintenanceCost
              : otherCost,
    }));

    // --- Vehicle stats ---
    function buildVehicleStats() {
      const map = new Map<
        number,
        {
          name: string;
          color: string;
          isElectric: boolean;
          count: number;
          cost: number;
          vehicle: Vehicle | VehicleMinimal | undefined;
        }
      >();
      filteredExpenses.forEach((e) => {
        const v = vehicles.find((vv) => vv.vehicle_id === e.vehicle_id);
        const existing = map.get(e.vehicle_id);
        if (existing) {
          existing.count++;
          existing.cost += e.amount ?? 0;
        } else
          map.set(e.vehicle_id, {
            name: v?.name ?? e.vehicle_name ?? `Véhicule ${e.vehicle_id}`,
            color: v?.color || 'gray',
            isElectric: v?.fuel_type === 'Électrique' || v?.fuel_type === 'Hybride',
            count: 1,
            cost: e.amount ?? 0,
            vehicle: v,
          });
      });
      return Array.from(map.entries())
        .map(([vehicleId, d], i) => ({
          vehicleId,
          vehicleName: d.name,
          vehicleColor: d.color,
          isElectric: d.isElectric,
          count: d.count,
          cost: d.cost,
          rank: i + 1,
          percentage: totalCost > 0 ? (d.cost / totalCost) * 100 : 0,
          vehicle: d.vehicle
            ? {
                vehicle_id: d.vehicle.vehicle_id,
                name: d.vehicle.name ?? undefined,
                make: d.vehicle.make ?? undefined,
                model: d.vehicle.model ?? undefined,
                image: 'image' in d.vehicle ? (d.vehicle.image ?? null) : null,
                plate: 'plate' in d.vehicle ? (d.vehicle.plate ?? undefined) : undefined,
                color: d.vehicle.color ?? undefined,
                fuel_type: d.vehicle.fuel_type ?? undefined,
              }
            : undefined,
        }))
        .sort((a, b) => b.cost - a.cost)
        .map((v, i) => ({ ...v, rank: i + 1 }));
    }
    const vehicleStats = buildVehicleStats();

    // --- Misc ---
    const sorted = [...filteredExpenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const vehicleDistances = new Map<number, { min: number; max: number }>();
    filteredExpenses.forEach((e) => {
      const odo = (e as Expense & { odometer?: number }).odometer;
      if (odo) {
        const ex = vehicleDistances.get(e.vehicle_id);
        if (ex) {
          ex.min = Math.min(ex.min, odo);
          ex.max = Math.max(ex.max, odo);
        } else vehicleDistances.set(e.vehicle_id, { min: odo, max: odo });
      }
    });
    const totalKilometers = Array.from(vehicleDistances.values()).reduce(
      (s, d) => s + d.max - d.min,
      0,
    );
    const totalLiters = filteredExpenses
      .filter((e) => e.type === 'fuel')
      .reduce((s, e) => s + ((e as Expense & { liters?: number }).liters ?? 0), 0);
    const hasElectricVehicle = vehicles
      .filter((v) => selectedVehicleIds.includes(v.vehicle_id))
      .some((v) => v.fuel_type === 'Électrique' || v.fuel_type === 'Hybride');

    return {
      totalExpenses: filteredExpenses.length,
      totalCost,
      fuelCost,
      electricChargeCost,
      insuranceCost,
      maintenanceCost,
      otherCost,
      energyCost,
      fillsCount: filteredExpenses.filter((e) => e.type === 'fuel' || e.type === 'electric_charge')
        .length,
      avgFillAmount:
        filteredExpenses.filter((e) => e.type === 'fuel' || e.type === 'electric_charge').length > 0
          ? energyCost /
            filteredExpenses.filter((e) => e.type === 'fuel' || e.type === 'electric_charge').length
          : 0,
      totalKilometers,
      electricShare: energyCost > 0 ? (electricChargeCost / energyCost) * 100 : 0,
      avgConsumption:
        totalKilometers > 0 && totalLiters > 0 ? (totalLiters / totalKilometers) * 100 : 0,
      hasElectricVehicle,
      totalLiters,
      avgCostPerMonth,
      annualProjection,
      monthsWithData: monthsNum,
      previousPeriodCost,
      trendPercentage,
      firstExpenseDate: sorted[0]?.date ?? null,
      lastExpenseDate: sorted[sorted.length - 1]?.date ?? null,
      expensesByMonth,
      expenseByCategory,
      vehicleStats,
      vehicleExpensesByMonth,
      odometerSeries,
    };
  }, [filteredExpenses, vehicles, selectedPeriod, selectedVehicleIds, expenses]);

  if (!vehicles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-xl font-semibold">Aucun véhicule trouvé</h2>
        <p className="text-gray-600">Ajoutez un véhicule pour voir vos statistiques.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner />
        <p className="text-gray-600">Chargement des données...</p>
      </div>
    );
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
        monthsWithData={stats.monthsWithData}
        previousPeriodCost={stats.previousPeriodCost}
        selectedPeriod={selectedPeriod}
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
          totalFills={stats.fillsCount}
          totalLiters={stats.totalLiters}
          avgFillAmount={stats.avgFillAmount}
          avgPricePerLiter={0}
          totalKilometers={stats.totalKilometers}
          electricShare={stats.electricShare}
          hasElectricVehicle={stats.hasElectricVehicle}
          avgConsumption={stats.avgConsumption}
        />
      </div>

      <OdometerEvolutionChart series={stats.odometerSeries} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

interface StatisticsClientProps {
  vehicles: (Vehicle | VehicleMinimal)[];
  selectorVehicles: VehicleMinimal[];
}

export default function StatisticsClient({ vehicles, selectorVehicles }: StatisticsClientProps) {
  return (
    <SelectorsProvider initialVehicles={selectorVehicles}>
      <SelectorsHeader title="Analyses & Statistiques" vehicles={selectorVehicles} />
      <StatisticsContent vehicles={vehicles} />
    </SelectorsProvider>
  );
}
