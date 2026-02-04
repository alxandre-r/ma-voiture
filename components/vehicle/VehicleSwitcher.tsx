'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/Icon';
import { VehicleMinimal } from '@/types/vehicle';

interface VehicleSwitcherProps {
  vehicles: VehicleMinimal[];
  selectedVehicleIds: number[];
  onVehicleChange: (vehicleIds: number[]) => void;
  disabled?: boolean;
}

export default function VehicleSwitcher({
  vehicles,
  selectedVehicleIds,
  onVehicleChange,
  disabled = false,
}: VehicleSwitcherProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Local copy de la sélection, sync initial seulement ---
  const [vehicleFilter, setVehicleFilter] = useState<number[]>(() => 
    selectedVehicleIds.length ? selectedVehicleIds : vehicles.length ? [vehicles[0].vehicle_id] : []
  );

  // --- Sync parent -> local uniquement si parent change réellement ---
  useEffect(() => {
    if (
      selectedVehicleIds.length !== vehicleFilter.length ||
      !selectedVehicleIds.every(id => vehicleFilter.includes(id))
    ) {
      setVehicleFilter(selectedVehicleIds.length ? selectedVehicleIds : [vehicles[0]?.vehicle_id].filter(Boolean));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicleIds]);

  // --- Sync local -> parent à chaque changement local ---
  useEffect(() => {
    if (vehicleFilter.length) {
      onVehicleChange(vehicleFilter);
    }
  }, [vehicleFilter, onVehicleChange]);

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

  // --- Toggle véhicule (toujours au moins 1 sélection) ---
  const toggleVehicle = (id: number) => {
    if (vehicleFilter.includes(id)) {
      if (vehicleFilter.length === 1) return; // toujours au moins 1
      setVehicleFilter(vehicleFilter.filter(v => v !== id));
    } else {
      setVehicleFilter([...vehicleFilter, id]);
    }
  };

  // --- Toggle "Tous les véhicules" ---
  const toggleAllVehicles = () => {
    if (vehicleFilter.length === vehicles.length) {
      setVehicleFilter([vehicles[0].vehicle_id]); // force 1 sélection minimum
    } else {
      setVehicleFilter(vehicles.map(v => v.vehicle_id));
    }
  };

  // --- Label bouton ---
  const getButtonLabel = () => {
    if (vehicleFilter.length === vehicles.length) return 'Tous les véhicules';
    if (vehicleFilter.length === 1) {
      const v = vehicles.find(v => v.vehicle_id === vehicleFilter[0]);
      return v ? v.name || `${v.make} ${v.model}` : 'Véhicule sélectionné';
    }
    return `${vehicleFilter.length} véhicules sélectionnés`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setDropdownOpen(prev => !prev)}
        disabled={disabled || vehicles.length === 0}
        className="flex items-center justify-between w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <div className="flex items-center gap-2">
          <Icon name="garage" size={20} className="text-gray-600 dark:text-gray-300" />
          <span className="font-medium truncate">{getButtonLabel()}</span>
        </div>
        <Icon
          name="add"
          size={16}
          className={`transform transition-transform ${dropdownOpen ? 'rotate-45' : ''} text-gray-500`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg max-h-60 overflow-auto">
          {/* Tous les véhicules */}
          <button
            type="button"
            onClick={toggleAllVehicles}
            className={`w-full text-left px-4 py-2 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 ${
              vehicleFilter.length === vehicles.length ? 'font-medium' : ''
            }`}
          >
            <span>Tous les véhicules</span>
            {/* coche manuelle possible ici */}
          </button>

          {/* Liste véhicules */}
          {vehicles.map(v => (
            <button
              key={v.vehicle_id}
              type="button"
              onClick={() => toggleVehicle(v.vehicle_id)}
              className={`w-full text-left px-4 py-2 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 ${
                vehicleFilter.includes(v.vehicle_id) ? 'font-medium' : ''
              }`}
            >
              <span>{v.name || `${v.make} ${v.model}`}</span>
              {vehicleFilter.includes(v.vehicle_id) /* && coche */}
            </button>
          ))}

          {vehicles.length === 0 && (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
              Aucun véhicule disponible
            </div>
          )}
        </div>
      )}
    </div>
  );
}