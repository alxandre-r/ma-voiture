/**
 * @file components/fill/FillFilters.tsx
 * @fileoverview Advanced filtering and sorting controls for fuel fill-up records.
 * 
 * This component provides comprehensive filtering by vehicle, date (month/year),
 * and sorting options for the history page.
 */

'use client';

import { useState, useEffect } from 'react';
import { Fill } from '@/types/fill';
import { useFills } from '@/contexts/FillContext';

/**
 * FillFilters Component Props
 */
export interface FillFiltersProps {
  fills: Fill[] | null;
  onFilterChange: (filters: {
    vehicleFilter: string | number;
    yearFilter: string;
    monthFilter: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  }) => void;
  loading: boolean;
}

/**
 * FillFilters Component
 * 
 * Advanced filtering and sorting controls for fuel fill-up history.
 */
export default function FillFilters({ fills, onFilterChange, loading }: FillFiltersProps) {
  // Get vehicles from context
  const { vehicles, getVehicleName } = useFills();

  // Filter state
  const [vehicleFilter, setVehicleFilter] = useState<'all' | number>('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  
  // Sort state
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Apply filters when they change
  useEffect(() => {
    onFilterChange({
      vehicleFilter,
      yearFilter,
      monthFilter,
      sortBy,
      sortDirection
    });
  }, [vehicleFilter, yearFilter, monthFilter, sortBy, sortDirection, onFilterChange]);

  /**
   * Get unique vehicles for filter dropdown
   */
  const uniqueVehicles = vehicles ? vehicles
    .filter(v => v.name && v.name.trim() !== '')
    .sort((a, b) => (a.name || '').localeCompare(b.name || '')) : [];

  /**
   * Get unique years for filter dropdown
   */
  const uniqueYears = fills ? Array.from(new Set(fills
    .map(fill => fill.date ? new Date(fill.date).getFullYear().toString() : null)
    .filter((year): year is string => !!year)
  )).sort((a, b) => b.localeCompare(a)) : [];

  /**
   * Get months for selected year
   */
  const monthsForSelectedYear = fills && yearFilter !== 'all' 
    ? Array.from(new Set(fills
      .filter(fill => fill.date && new Date(fill.date).getFullYear().toString() === yearFilter)
      .map(fill => fill.date ? new Date(fill.date).getMonth() : null)
      .filter((month): month is number => month !== null)
    )).sort((a, b) => a - b)
    : [];

  /**
   * Get months for all years (when no specific year is selected)
   */
  const monthsForAllYears = fills 
    ? Array.from(new Set(fills
      .map(fill => fill.date ? new Date(fill.date).getMonth() : null)
      .filter((month): month is number => month !== null)
    )).sort((a, b) => a - b)
    : [];

  /**
   * Format month number to French month name
   */
  const formatMonth = (month: number) => {
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return monthNames[month] || 'Inconnu';
  };

  /**
   * Get vehicle name by ID for display
   */
  const getVehicleDisplayName = (vehicleId: number | 'all'): string => {
    if (vehicleId === 'all') return 'Tous les véhicules';
    if (!vehicles) return `Véhicule #${vehicleId}`;
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.name || `Véhicule #${vehicleId}`;
  };

  /**
   * Get the months to display based on current filters
   */
  const monthsToDisplay = yearFilter !== 'all' ? monthsForSelectedYear : monthsForAllYears;

  /**
   * Handle sort direction toggle
   */
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Filtres & Tri</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vehicle Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Véhicule
          </label>
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            disabled={loading || !fills || fills.length === 0}
            className="w-full bg-white dark:bg-gray-950 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700 disabled:opacity-50"
          >
            <option value="all">Tous les véhicules</option>
            {uniqueVehicles.length === 0 && (
              <option value="all" disabled>
                {loading ? 'Chargement...' : 'Aucun véhicule disponible'}
              </option>
            )}
            {uniqueVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Année
          </label>
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setMonthFilter('all'); // Reset month when year changes
            }}
            disabled={loading || !fills || fills.length === 0}
            className="w-full bg-white dark:bg-gray-950 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700 disabled:opacity-50"
          >
            <option value="all">Toutes les années</option>
            {uniqueYears.length === 0 && (
              <option value="all" disabled>
                {loading ? 'Chargement...' : 'Aucune année disponible'}
              </option>
            )}
            {uniqueYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mois
          </label>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            disabled={loading || !fills || fills.length === 0}
            className="w-full bg-white dark:bg-gray-950 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700 disabled:opacity-50"
          >
            <option value="all">Tous les mois</option>
            {monthsToDisplay.length === 0 && (
              <option value="all" disabled>
                {loading ? 'Chargement...' : 'Aucun mois disponible'}
              </option>
            )}
            {monthsToDisplay.map((month) => (
              <option key={month} value={month.toString()}>{formatMonth(month)}</option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trier par
          </label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={loading || !fills || fills.length === 0}
              className="bg-white dark:bg-gray-950 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700 disabled:opacity-50 flex-1"
            >
              <option value="date">Date</option>
              <option value="amount">Montant (€)</option>
              <option value="price_per_liter">Prix/Litre</option>
            </select>
            <button
              onClick={toggleSortDirection}
              disabled={loading || !fills || fills.length === 0}
              className="px-3 py-2 bg-custom-2 hover:bg-custom-2-hover rounded"
              title={sortDirection === 'desc' ? 'Tri décroissant' : 'Tri croissant'}
            >
              <img
              src={sortDirection === 'desc' ? '/icons/sort-descending.svg' : '/icons/sort-ascending.svg'}
              alt={sortDirection === 'desc' ? 'Tri décroissant' : 'Tri croissant'}
              className="w-6 h-6 invert"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {(vehicleFilter !== 'all' || yearFilter !== 'all' || monthFilter !== 'all') && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
          <span className="font-medium">Filtres actifs : </span>
          {vehicleFilter !== 'all' && <span className="text-indigo-600 dark:text-indigo-400">Véhicule: {getVehicleDisplayName(vehicleFilter)}</span>}
          {(vehicleFilter !== 'all' && (yearFilter !== 'all' || monthFilter !== 'all')) && <span className="mx-1">•</span>}
          {yearFilter !== 'all' && <span className="text-indigo-600 dark:text-indigo-400">Année: {yearFilter}</span>}
          {(yearFilter !== 'all' && monthFilter !== 'all') && <span className="mx-1">•</span>}
          {monthFilter !== 'all' && <span className="text-indigo-600 dark:text-indigo-400">Mois: {formatMonth(parseInt(monthFilter))}</span>}
          <button
            onClick={() => {
              setVehicleFilter('all');
              setYearFilter('all');
              setMonthFilter('all');
            }}
            className="ml-3 text-red-600 dark:text-red-400 hover:underline text-xs"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
