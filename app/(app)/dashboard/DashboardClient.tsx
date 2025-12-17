/**
 * @file app/(app)/dashboard/DashboardClient.tsx
 * @fileoverview Client component for dashboard with vehicle filtering.
 * 
 * This component handles the vehicle switcher and passes the selected vehicle
 * to child components for filtering data display.
 */

'use client';

import { useState, useEffect } from 'react';
import { useFills } from '@/contexts/FillContext';
import VehicleSwitcher from '@/components/vehicle/VehicleSwitcher';
import AddFillClient from './AddFillClient';
import FillList from '@/components/fill/FillList';

interface DashboardClientProps {
  vehicles: Array<{
    id: number;
    name: string | null;
    make: string | null;
    model: string | null;
    odometer: number | null;
  }>;
}

/**
 * DashboardClient Component
 * 
 * Client-side dashboard with vehicle filtering functionality.
 * Manages vehicle selection state and passes it to child components.
 */
export default function DashboardClient({ vehicles }: DashboardClientProps) {
  const { setSelectedVehicleId } = useFills();
  const [selectedVehicleId, setLocalSelectedVehicleId] = useState<string | null>(null);
  
  /**
   * Handle vehicle selection change
   */
  const handleVehicleChange = (vehicleId: string | null) => {
    setLocalSelectedVehicleId(vehicleId);
    setSelectedVehicleId(vehicleId);
  };
  
  /**
   * Determine if switcher should be disabled (single vehicle case)
   */
  const isSwitcherDisabled = vehicles.length <= 1;
  
  /**
   * Initialize with single vehicle selected if only one exists
   */
  useEffect(() => {
    if (vehicles.length === 1 && selectedVehicleId === null) {
      setLocalSelectedVehicleId(vehicles[0].id.toString());
      setSelectedVehicleId(vehicles[0].id.toString());
    }
  }, [vehicles, selectedVehicleId, setSelectedVehicleId]);
  
  return (
    <>
      {/* Vehicle Switcher and Add Fill Button */}
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Vehicle Switcher - Left side */}
        <div className="flex-1 min-w-[200px] max-w-full sm:max-w-[300px]">
          <VehicleSwitcher
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onVehicleChange={handleVehicleChange}
            disabled={isSwitcherDisabled}
          />
        </div>
        
        {/* Add Fill Button - Right side */}
        <div className="flex-shrink-0">
          <AddFillClient vehicles={vehicles} />
        </div>
      </div>
      
      {/* Fill List with filtered data */}
      <FillList />
    </>
  );
}