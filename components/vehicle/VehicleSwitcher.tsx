/**
 * @file components/vehicle/VehicleSwitcher.tsx
 * @fileoverview Vehicle switcher component for filtering dashboard data by vehicle.
 * 
 * This component provides a dropdown to select which vehicle's data to display
 * on the dashboard, with support for single vehicle selection and "All vehicles" option.
 */

'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

interface Vehicle {
  id: number;
  name: string | null;
  make: string | null;
  model: string | null;
  odometer: number | null;
}

interface VehicleSwitcherProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onVehicleChange: (vehicleId: string | null) => void;
  disabled?: boolean;
}

/**
 * VehicleSwitcher Component
 * 
 * Dropdown component for selecting which vehicle's data to display.
 * Supports single vehicle selection and "All vehicles" option.
 */
export default function VehicleSwitcher({ 
  vehicles, 
  selectedVehicleId, 
  onVehicleChange, 
  disabled = false 
}: VehicleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  /**
   * Handle vehicle selection change
   */
  const handleVehicleChange = (vehicleId: string | null) => {
    onVehicleChange(vehicleId);
    setIsOpen(false);
  };
  
  /**
   * Get display name for selected vehicle
   */
  const getSelectedVehicleName = () => {
    // If disabled (single vehicle), show that vehicle's name
    if (disabled && vehicles.length === 1) {
      const vehicle = vehicles[0];
      return vehicle.name || `${vehicle.make} ${vehicle.model}`;
    }
    
    if (selectedVehicleId === null) {
      return 'Tous les véhicules';
    }
    
    const selectedVehicle = vehicles.find(v => v.id.toString() === selectedVehicleId);
    return selectedVehicle ? selectedVehicle.name || `${selectedVehicle.make} ${selectedVehicle.model}` : 'Tous les véhicules';
  };
  
  return (
    <div className="relative">
      {/* Vehicle Switcher Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
          disabled 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        aria-label="Sélectionner un véhicule"
      >
        <Icon name="garage" size={20} className="text-gray-600 dark:text-gray-300" />
        <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">{getSelectedVehicleName()}</span>
        {!disabled && (
          <Icon 
            name="add" 
            size={16} 
            className={`transform transition-transform ${isOpen ? 'rotate-45' : ''} ${disabled ? 'text-gray-400' : 'text-gray-500'}`}
          />
        )}
      </button>
      
      {/* Vehicle Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="py-2">
            {/* All Vehicles Option */}
            <button
              onClick={() => handleVehicleChange(null)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedVehicleId === null ? 'bg-blue-50 dark:bg-blue-900/20 font-medium' : ''
              }`}
            >
              <Icon name="dashboard" size={18} className="text-blue-600" />
              <span>Tous les véhicules</span>
            </button>
            
            {/* Vehicle Options */}
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => handleVehicleChange(vehicle.id.toString())}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedVehicleId === vehicle.id.toString() ? 'bg-blue-50 dark:bg-blue-900/20 font-medium' : ''
                  }`}
                >
                  <Icon name="garage" size={18} className="text-gray-600 dark:text-gray-300" />
                  <div className="flex flex-col">
                    <span className="font-medium">{vehicle.name || `${vehicle.make} ${vehicle.model}`}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{vehicle.make} {vehicle.model}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                Aucun véhicule disponible
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}