'use client';

import { useState, useMemo, useCallback } from 'react';

import FillRowContainer from '@/components/fill/FillRowContainer';

import FillFilters from '../history/FillFilters';

import type { Fill } from '@/types/fill';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

interface FillHistoryListProps {
  vehicles?: (Vehicle | VehicleMinimal)[];
  fills?: Fill[];
  onRefresh?: () => void; // callback pour refresh parent / API
}

export default function FillHistoryList({
  vehicles = [],
  fills = [],
  onRefresh,
}: FillHistoryListProps) {
  const allVehicles = vehicles;

  // --- Filter State ---
  const [filters, setFilters] = useState({
    vehicleFilter: [] as number[],
    yearFilter: 'all',
    monthFilter: 'all',
    sortBy: 'date',
    sortDirection: 'desc' as 'asc' | 'desc',
  });

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  // --- Filtered & sorted fills ---
  const filteredFills = useMemo(() => {
    if (!fills) return [];

    let result = [...fills];

    if (filters.vehicleFilter.length > 0) {
      result = result.filter((f) => filters.vehicleFilter.includes(f.vehicle_id));
    }

    if (filters.yearFilter !== 'all') {
      result = result.filter(
        (f) => new Date(f.date).getFullYear().toString() === filters.yearFilter,
      );
    }

    if (filters.monthFilter !== 'all') {
      result = result.filter((f) => new Date(f.date).getMonth().toString() === filters.monthFilter);
    }

    if (filters.sortBy === 'date') {
      result.sort((a, b) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return filters.sortDirection === 'asc' ? diff : -diff;
      });
    } else if (filters.sortBy === 'amount') {
      result.sort((a, b) =>
        filters.sortDirection === 'asc'
          ? (a.amount ?? 0) - (b.amount ?? 0)
          : (b.amount ?? 0) - (a.amount ?? 0),
      );
    } else if (filters.sortBy === 'price_per_liter') {
      result.sort((a, b) =>
        filters.sortDirection === 'asc'
          ? (a.price_per_liter ?? 0) - (b.price_per_liter ?? 0)
          : (b.price_per_liter ?? 0) - (a.price_per_liter ?? 0),
      );
    }

    return result;
  }, [fills, filters]);

  // --- Statistics ---
  const totalLiters = useMemo(
    () => filteredFills.reduce((sum, f) => sum + (f.liters ?? 0), 0),
    [filteredFills],
  );
  const totalCost = useMemo(
    () => filteredFills.reduce((sum, f) => sum + (f.amount ?? 0), 0),
    [filteredFills],
  );
  const totalKilometers = useMemo(() => {
    if (!filteredFills.length) return 0;
    const odometers = filteredFills.map((f) => f.odometer).filter((o): o is number => o != null);
    return odometers.length ? Math.max(...odometers) - Math.min(...odometers) : 0;
  }, [filteredFills]);
  const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
  const formatCurrency = (value?: number | null) =>
    value == null ? 'N/A' : `${value.toFixed(2)} €`;

  return (
    <div className="fill-history">
      <div className="mb-4">
        <FillFilters
          fills={fills ?? null}
          vehicles={allVehicles}
          loading={false}
          onFilterChange={handleFilterChange}
        />
      </div>

      {filteredFills.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-4">
          <div className="bg-custom-1 p-3 rounded text-gray-100">
            <div className="text-sm">Pleins totaux</div>
            <div className="font-medium text-xl">{filteredFills.length}</div>
          </div>
          <div className="bg-custom-1 p-3 rounded text-gray-100">
            <div className="text-sm">Litres totaux</div>
            <div className="font-medium text-xl">{totalLiters.toFixed(1)} L</div>
          </div>
          <div className="bg-custom-1 p-3 rounded text-gray-100">
            <div className="text-sm">Coût total</div>
            <div className="font-medium text-xl">{formatCurrency(totalCost)}</div>
          </div>
          <div className="bg-custom-1 p-3 rounded text-gray-100">
            <div className="text-sm">KM parcourus</div>
            <div className="font-medium text-xl">{totalKilometers} km</div>
          </div>
          <div className="bg-custom-1 p-3 rounded text-gray-100">
            <div className="text-sm">Prix moyen/L</div>
            <div className="font-medium text-xl">{avgPricePerLiter.toFixed(3)} €/L</div>
          </div>
        </div>
      )}

      {filteredFills.length === 0 && (
        <div className="text-center py-8 text-gray-400">Aucun plein trouvé pour le moment.</div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 px-2 sm:px-4 space-y-2">
        {filteredFills.map((fill) => (
          <FillRowContainer
            key={fill.id}
            fill={fill}
            onRefresh={onRefresh} // <-- refresh après update / delete
          />
        ))}
      </div>
    </div>
  );
}
