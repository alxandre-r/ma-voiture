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

export default function FillFilters({ fills, vehicles, onFilterChange, loading }: FillFiltersProps) {
  const [vehicleFilter, setVehicleFilter] = useState<number[]>([]);
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    onFilterChange({ vehicleFilter, yearFilter, monthFilter, sortBy, sortDirection });
  }, [vehicleFilter, yearFilter, monthFilter, sortBy, sortDirection, onFilterChange]);

  /* ---------------- VehicleSwitcher-like ---------------- */
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleVehicle = (id: number) => {
    if (id === 0) return setVehicleFilter([]); // Tous les véhicules
    setVehicleFilter(prev => (prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (vehicleFilter.length === vehicles.length) setVehicleFilter([]);
    else setVehicleFilter(vehicles.map(v => (v as Vehicle).vehicle_id));
  };

  const vehicleButtonText = () => {
    if (vehicleFilter.length === 0) return 'Tous les véhicules';
    if (vehicleFilter.length === 1) {
      const v = vehicles.find(v => (v as Vehicle).vehicle_id === vehicleFilter[0]) as Vehicle;
      return v ? v.name || `${v.make} ${v.model}` : 'Véhicule';
    }
    return `${vehicleFilter.length} véhicules sélectionnés`;
  };

  /* ---------------- Months & Years ---------------- */
  const uniqueVehicles = vehicles.filter((v): v is Vehicle => typeof (v as Vehicle).vehicle_id === 'number');
  const uniqueYears = fills
    ? Array.from(new Set(fills.map(f => f.date ? new Date(f.date).getFullYear().toString() : null).filter((y): y is string => !!y))).sort((a,b) => b.localeCompare(a))
    : [];
  const monthsForSelectedYear = fills && yearFilter !== 'all'
    ? Array.from(new Set(fills.filter(f => f.date && new Date(f.date).getFullYear().toString() === yearFilter).map(f => new Date(f.date).getMonth()))).sort((a,b) => a-b)
    : [];
  const monthsForAllYears = fills
    ? Array.from(new Set(fills.map(f => f.date ? new Date(f.date).getMonth() : null).filter((m): m is number => m !== null))).sort((a,b) => a-b)
    : [];
  const monthsToDisplay = yearFilter !== 'all' ? monthsForSelectedYear : monthsForAllYears;

  const formatMonth = (month: number) => ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][month] || 'Inconnu';
  const toggleSortDirection = () => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');

  /* ---------------- Render ---------------- */
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Filtres & Tri</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Vehicle Filter (6/12 desktop, full mobile) */}
        <div ref={ref} className="col-span-12 md:col-span-6 relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Véhicule</label>
          <button
            type="button"
            onClick={() => setDropdownOpen(o => !o)}
            disabled={loading || !fills || fills.length === 0}
            className="flex justify-between items-center w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <span className={`truncate ${vehicleFilter.length === 0 ? 'text-gray-400 dark:text-gray-500' : 'font-medium'}`}>{vehicleButtonText()}</span>
            <Icon name="arrow-down" size={16} className={`ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">Sélection multiple possible</div>
              <DropdownItem label="Tous les véhicules" checked={vehicleFilter.length === vehicles.length && vehicles.length > 0} onClick={toggleAll} />
              <div className="border-t dark:border-gray-700 my-1" />
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

        {/* Year Filter (2/12 desktop) */}
        <div className="col-span-12 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Année</label>
          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setMonthFilter('all'); }}
            disabled={loading || !fills || fills.length === 0}
            className="w-full px-3 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 disabled:opacity-50"
          >
            <option value="all">Toutes les années</option>
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Month Filter (2/12 desktop) */}
        <div className="col-span-12 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mois</label>
          <select
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            disabled={loading || !fills || fills.length === 0}
            className="w-full px-3 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 disabled:opacity-50"
          >
            <option value="all">Tous les mois</option>
            {monthsToDisplay.map(m => <option key={m} value={m.toString()}>{formatMonth(m)}</option>)}
          </select>
        </div>

        {/* Sort Filter (2/12 desktop) */}
        <div className="col-span-12 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trier par</label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              disabled={loading || !fills || fills.length === 0}
              className="flex-1 px-3 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 disabled:opacity-50"
            >
              <option value="date">Date</option>
              <option value="amount">Montant (€)</option>
              <option value="price_per_liter">Prix/Litre</option>
            </select>
            <button
              onClick={toggleSortDirection}
              disabled={loading || !fills || fills.length === 0}
              className="px-3 py-3 bg-custom-2 hover:bg-custom-2-hover rounded-lg"
            >
              {sortDirection === 'desc' ? '⬇️' : '⬆️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Dropdown Item ---------------- */
function DropdownItem({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 text-left transition hover:cursor-pointer ${checked ? 'bg-custom-1/20 dark:bg-custom-1/10' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
    >
      <span className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-custom-1 border-custom-1' : 'border-gray-400 dark:border-gray-500'}`}>
        <Icon name="check" size={12} className={`text-white transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`} />
      </span>
      <span className={`truncate ${checked ? 'font-medium text-dark dark:text-white' : ''}`}>{label}</span>
    </button>
  );
}
