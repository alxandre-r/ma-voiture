'use client';

import { useState, useEffect, useRef } from 'react';
import { Fill } from '@/types/fill';
import { Vehicle, VehicleMinimal } from '@/types/vehicle';

export interface FillFiltersProps {
  fills: Fill[] | null;
  vehicles: (Vehicle | VehicleMinimal)[];
  onFilterChange: (filters: {
    vehicleFilter: number[];
    yearFilter: string;
    monthFilter: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  }) => void;
  loading: boolean;
}

export default function FillFilters({ fills, vehicles, onFilterChange, loading }: FillFiltersProps) {
  const [vehicleFilter, setVehicleFilter] = useState<number[]>([]);
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Update parent on any filter change ---
  useEffect(() => {
    onFilterChange({ vehicleFilter, yearFilter, monthFilter, sortBy, sortDirection });
  }, [vehicleFilter, yearFilter, monthFilter, sortBy, sortDirection, onFilterChange]);

  // --- Close dropdown on outside click ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleVehicle = (id: number) => {
    if (id === 0) {
      // "Tous les véhicules" cliqué -> clear filter
      setVehicleFilter([]);
    } else {
      setVehicleFilter(prev =>
        prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
      );
    }
  };

  // --- Helpers ---
  const uniqueVehicles = vehicles.filter((v): v is Vehicle => typeof v.id === 'number');

  const uniqueYears = fills
    ? Array.from(new Set(
        fills
          .map(f => f.date ? new Date(f.date).getFullYear().toString() : null)
          .filter((y): y is string => !!y)
      )).sort((a, b) => b.localeCompare(a))
    : [];

  const monthsForSelectedYear = fills && yearFilter !== 'all'
    ? Array.from(new Set(
        fills
          .filter(f => f.date && new Date(f.date).getFullYear().toString() === yearFilter)
          .map(f => f.date ? new Date(f.date).getMonth() : null)
          .filter((m): m is number => m !== null)
      )).sort((a, b) => a - b)
    : [];

  const monthsForAllYears = fills
    ? Array.from(new Set(
        fills
          .map(f => f.date ? new Date(f.date).getMonth() : null)
          .filter((m): m is number => m !== null)
      )).sort((a, b) => a - b)
    : [];

  const monthsToDisplay = yearFilter !== 'all' ? monthsForSelectedYear : monthsForAllYears;

  const formatMonth = (month: number) => {
    const monthNames = [
      'Janvier','Février','Mars','Avril','Mai','Juin',
      'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
    ];
    return monthNames[month] || 'Inconnu';
  };

  const toggleSortDirection = () => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');

  // --- Display text for vehicle button ---
  const vehicleButtonText = () => {
    if (vehicleFilter.length === 0) return 'Tous les véhicules';
    if (vehicleFilter.length === 1) {
      const v = uniqueVehicles.find(v => v.id === vehicleFilter[0]);
      return v ? v.name || `${v.make} ${v.model}` : 'Véhicule sélectionné';
    }
    return `${vehicleFilter.length} sélectionnés`;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Filtres & Tri</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vehicle Filter */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Véhicule</label>
          <button
            type="button"
            onClick={() => setDropdownOpen(prev => !prev)}
            disabled={loading || !fills || fills.length === 0}
            className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded border border-gray-300 dark:border-gray-700 flex justify-between items-center focus:ring-1 focus:ring-indigo-500"
          >
            {vehicleButtonText()}
            {/* <FaChevronDown className="ml-2 text-gray-500" /> */}
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded shadow-lg max-h-60 overflow-auto">
              <button
                type="button"
                onClick={() => toggleVehicle(0)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
              >
                <span>Tous les véhicules</span>
                {vehicleFilter.length === 0 /* && coche */}
              </button>

              {uniqueVehicles.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleVehicle(v.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                >
                  <span>{v.name || `${v.make} ${v.model}`}</span>
                  {vehicleFilter.includes(v.id) /* && coche */}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Année</label>
          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setMonthFilter('all'); }}
            disabled={loading || !fills || fills.length === 0}
            className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700 disabled:opacity-50"
          >
            <option value="all">Toutes les années</option>
            {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mois</label>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            disabled={loading || !fills || fills.length === 0}
            className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700 disabled:opacity-50"
          >
            <option value="all">Tous les mois</option>
            {monthsToDisplay.map(month => (
              <option key={month} value={month.toString()}>{formatMonth(month)}</option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trier par</label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={loading || !fills || fills.length === 0}
              className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700 flex-1"
            >
              <option value="date">Date</option>
              <option value="amount">Montant (€)</option>
              <option value="price_per_liter">Prix/Litre</option>
            </select>
            <button
              onClick={toggleSortDirection}
              disabled={loading || !fills || fills.length === 0}
              className="px-3 py-2 bg-custom-2 hover:bg-custom-2-hover rounded"
            >
              {sortDirection === 'desc' ? '⬇️' : '⬆️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
