'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/Icon';
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

export default function FillFilters({
  fills,
  vehicles,
  onFilterChange,
  loading,
}: FillFiltersProps) {
  const [vehicleFilter, setVehicleFilter] = useState<number[]>([]);
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Mobile toggle
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    onFilterChange({ vehicleFilter, yearFilter, monthFilter, sortBy, sortDirection });
  }, [vehicleFilter, yearFilter, monthFilter, sortBy, sortDirection, onFilterChange]);

  /* ---------------- Active filters badge ---------------- */
  const activeFiltersCount =
    (vehicleFilter.length > 0 ? 1 : 0) +
    (yearFilter !== 'all' ? 1 : 0) +
    (monthFilter !== 'all' ? 1 : 0) +
    (sortBy !== 'date' || sortDirection !== 'desc' ? 1 : 0);

  /* ---------------- Vehicle dropdown ---------------- */
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniqueVehicles = vehicles.filter(
    (v): v is Vehicle => typeof (v as Vehicle).vehicle_id === 'number'
  );

  const toggleVehicle = (id: number) => {
    setVehicleFilter(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (vehicleFilter.length === uniqueVehicles.length) {
      setVehicleFilter([]);
    } else {
      setVehicleFilter(uniqueVehicles.map(v => v.vehicle_id));
    }
  };

  const vehicleButtonText = () => {
    if (vehicleFilter.length === 0) return 'Tous les véhicules';
    if (vehicleFilter.length === 1) {
      const v = uniqueVehicles.find(v => v.vehicle_id === vehicleFilter[0]);
      return v ? v.name || `${v.make} ${v.model}` : 'Véhicule';
    }
    return `${vehicleFilter.length} véhicules sélectionnés`;
  };

  /* ---------------- Years & months ---------------- */
  const uniqueYears = fills
    ? Array.from(
        new Set(
          fills
            .map(f => (f.date ? new Date(f.date).getFullYear().toString() : null))
            .filter((y): y is string => !!y)
        )
      ).sort((a, b) => b.localeCompare(a))
    : [];

  const monthsToDisplay = fills
    ? Array.from(
        new Set(
          fills
            .filter(
              f =>
                yearFilter === 'all' ||
                new Date(f.date!).getFullYear().toString() === yearFilter
            )
            .map(f => new Date(f.date!).getMonth())
        )
      ).sort((a, b) => a - b)
    : [];

  const formatMonth = (m: number) =>
    [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ][m];

  /* ---------------- Render ---------------- */
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filtres & Tri
          </h3>

          {activeFiltersCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-custom-1/20 dark:bg-custom-1/30 text-custom-1 dark:text-custom-1-dark font-medium">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setFiltersOpen(o => !o)}
          className="md:hidden px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2"
        >
          {filtersOpen ? <Icon name="arrow-up" size={16} /> : <Icon name="arrow-down" size={16} />}
        </button>
      </div>

      {/* Filters */}
      <div
        className={`
          ${filtersOpen ? 'block' : 'hidden'}
          md:grid
          grid-cols-1 md:grid-cols-12 mt-6 gap-4 space-y-4 md:space-y-0
        `}
      >
        {/* Vehicle (custom dropdown) */}
        <div ref={dropdownRef} className="col-span-12 md:col-span-6 relative">
          <label className="block text-sm font-medium mb-1">Véhicule</label>

          <button
            type="button"
            onClick={() => setDropdownOpen(o => !o)}
            disabled={loading || !fills?.length}
            className="flex justify-between items-center w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          >
            <span
              className={`truncate ${
                vehicleFilter.length === 0 ? 'text-gray-400' : 'font-medium'
              }`}
            >
              {vehicleButtonText()}
            </span>
            <Icon
              name="arrow-down"
              size={16}
              className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-2 text-xs opacity-70 border-b border-gray-200 dark:border-gray-700">
                Sélection multiple possible
              </div>

              <DropdownItem
                label="Tous les véhicules"
                checked={
                  vehicleFilter.length === uniqueVehicles.length &&
                  uniqueVehicles.length > 0
                }
                onClick={toggleAll}
              />

              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

              <div className="max-h-64 overflow-y-auto">
                {uniqueVehicles.map(v => (
                  <DropdownItem
                    key={v.vehicle_id}
                    label={v.name || `${v.make} ${v.model}`}
                    checked={vehicleFilter.includes(v.vehicle_id)}
                    onClick={() => toggleVehicle(v.vehicle_id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Year + Month */}
        <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Année</label>
            <select
              value={yearFilter}
              onChange={e => {
                setYearFilter(e.target.value);
                setMonthFilter('all');
              }}
              className="w-full px-3 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <option value="all">-</option>
              {uniqueYears.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mois</label>
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="w-full px-3 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <option value="all">-</option>
              {monthsToDisplay.map(m => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="col-span-12 md:col-span-2">
          <label className="block text-sm font-medium mb-1">Trier par</label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="flex-1 px-3 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <option value="date">Date</option>
              <option value="amount">Montant (€)</option>
              <option value="price_per_liter">Prix/Litre</option>
            </select>

            <button
              onClick={() =>
                setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'))
              }
              className="px-3 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-custom-2 hover:bg-custom-2-hover flex items-center justify-center"
            >
              <Icon
                name={sortDirection === 'desc' ? 'sort-descending' : 'sort-ascending'}
                size={20}
                className="invert dark:invert-0"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Dropdown Item ---------------- */
function DropdownItem({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 text-left transition ${
        checked
          ? 'bg-custom-1/10 dark:bg-custom-1/10'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center ${
          checked
            ? 'bg-custom-1 border-custom-1'
            : 'border-gray-400 dark:border-gray-500'
        }`}
      >
        <Icon
          name="check"
          size={12}
          className={`text-white invert dark:invert-0 ${checked ? 'opacity-100' : 'opacity-0'}`}
        />
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}