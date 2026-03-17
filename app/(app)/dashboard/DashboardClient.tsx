'use client';

import { useMemo } from 'react';

import ExpenseButton from '@/components/common/ExpenseButton';
import SelectorsHeader from '@/components/common/SelectorsHeader';
import { RecentExpenses, StatsCards } from '@/components/dashboard';
import { SelectorsProvider, useSelectors } from '@/contexts/SelectorsContext';

import type { Expense } from '@/types/expense';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

interface DashboardClientProps {
  currentUserId: string;
  vehicles: Vehicle[];
  expenses: Expense[];
  selectorVehicles: VehicleMinimal[];
}

/**
 * Dashboard content component that uses shared selectors.
 */
function DashboardContent({
  currentUserId,
  vehicles,
  expenses,
}: Omit<DashboardClientProps, 'selectorVehicles'>) {
  const { selectedVehicleIds, selectedPeriod } = useSelectors();

  // Filter and sort expenses by selected vehicles and period
  const filteredExpenses = useMemo(() => {
    let result = expenses.filter((e) => selectedVehicleIds.includes(e.vehicle_id));

    // Filter by period
    if (selectedPeriod && selectedPeriod !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      if (selectedPeriod === 'month') {
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (selectedPeriod === 'year') {
        cutoffDate = new Date(now.getFullYear(), 0, 1);
      } else {
        cutoffDate = new Date(0);
      }

      result = result.filter((e) => new Date(e.date) >= cutoffDate);
    }

    return result;
  }, [expenses, selectedVehicleIds, selectedPeriod]);

  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Calculate stats
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  // Calculate average consumption from fuel expenses
  const avgConsumption = useMemo(() => {
    const fuelExpenses = filteredExpenses.filter((e) => e.type === 'fuel');
    if (fuelExpenses.length === 0) return 0;

    let totalLiters = 0;
    let totalDistance = 0;
    const odometers: Record<number, number[]> = {};

    fuelExpenses.forEach((expense) => {
      const fillData = expense as unknown as { liters?: number; odometer?: number };
      if (fillData.liters) {
        totalLiters += fillData.liters;
      }
      if (fillData.odometer) {
        if (!odometers[expense.vehicle_id]) {
          odometers[expense.vehicle_id] = [];
        }
        odometers[expense.vehicle_id].push(fillData.odometer);
      }
    });

    Object.values(odometers).forEach((values) => {
      if (values.length >= 2) {
        const sorted = [...values].sort((a, b) => a - b);
        totalDistance += sorted[sorted.length - 1] - sorted[0];
      }
    });

    if (totalDistance > 0) {
      return (totalLiters / totalDistance) * 100;
    }
    return 0;
  }, [filteredExpenses]);

  return (
    <div className="space-y-6 px-2 sm:px-0 pb-8">
      {/* Header row with Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <ExpenseButton vehicles={vehicles as VehicleMinimal[]} currentUserId={currentUserId} />
      </div>

      {/* Stats Cards */}
      <StatsCards avgConsumption={avgConsumption} totalExpenses={totalExpenses} />

      {/* Recent Expenses Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentExpenses expenses={sortedExpenses} vehicles={vehicles} />
      </div>

      {/* New version messages */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300">
        <p className="font-medium">Plus à venir</p>
        <p className="text-sm mt-1">
          Visitez la section &quot;Patchnotes&quot; de la page{' '}
          <a href="/settings" className="text-yellow-600 underline">
            Paramètres
          </a>{' '}
          pour découvrir les nouveautés de la version 1.2.0 ainsi que les améliorations à venir.
        </p>
      </div>
    </div>
  );
}

/**
 * Dashboard client component with shared selectors.
 */
export default function DashboardClient({
  currentUserId,
  vehicles,
  expenses,
  selectorVehicles,
}: DashboardClientProps) {
  return (
    <SelectorsProvider initialVehicles={selectorVehicles}>
      <SelectorsHeader title="Tableau de Bord" vehicles={selectorVehicles} />
      <DashboardContent currentUserId={currentUserId} vehicles={vehicles} expenses={expenses} />
    </SelectorsProvider>
  );
}
