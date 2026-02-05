'use client';

import React, { useEffect, useState } from 'react';

import VehicleSwitcher from '@/components/vehicle/VehicleSwitcher';
import FillModal from '@/components/fill/forms/FillModal';
import Charts from '@/components/dashboard/Charts';
import LatestFills from '@/components/dashboard/LatestFills';
import Icon from '@/components/ui/Icon';

import DashboardLandingPage from './DashboardLandingPage';
import DashboardAddFills from './DashboardAddFills';

import { useVehicles } from '@/contexts/VehicleContext';
import { useFills } from '@/contexts/FillContext';

/* -------------------------------------------------------------------------- */
/*                               Add fill CTA                                 */
/* -------------------------------------------------------------------------- */

function AddFillClient() {
  const { vehicles } = useVehicles();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-3 bg-custom-2 text-white rounded-lg hover:bg-custom-2-hover flex items-center gap-2 transition-all duration-200 sm:px-6 sm:py-3"
      >
        <Icon name="add" size={20} className="invert dark:invert-0" />
        <span className="font-medium">Ajouter un plein</span>
      </button>

      <FillModal
        open={open}
        onClose={() => setOpen(false)}
        vehicles={vehicles}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Dashboard client                               */
/* -------------------------------------------------------------------------- */

export default function DashboardClient() {
  const {
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    loading: vehiclesLoading,
    error: vehiclesError,
  } = useVehicles();

  const {
    fills,
    setVehicles: setFillsVehicles,
    setSelectedVehicleIds,
  } = useFills();

  /* ------------------------ Local selected vehicle ------------------------- */
  const [localSelectedVehicleId, setLocalSelectedVehicleId] = useState<number | null>(
    () => selectedVehicleId ?? vehicles[0]?.vehicle_id ?? null
  );

  /* --------------------------- Context synchronisation --------------------- */
  useEffect(() => {
    setFillsVehicles(vehicles);

    if (vehicles.length === 1 && !selectedVehicleId) {
      const id = vehicles[0].vehicle_id;
      setLocalSelectedVehicleId(id);
      setSelectedVehicleIds([id]);
      setSelectedVehicleId(id);
    }
  }, [
    vehicles,
    selectedVehicleId,
    setFillsVehicles,
    setSelectedVehicleIds,
    setSelectedVehicleId,
  ]);

  /* --------------------------- Vehicle switcher ---------------------------- */
  const handleVehicleChange = (vehicleIds: number[]) => {
    const id = vehicleIds[0] ?? null;

    setLocalSelectedVehicleId(id);      // UI
    setSelectedVehicleIds(vehicleIds);  // FillContext
    setSelectedVehicleId(id);           // VehicleContext
  };

  /* ------------------------------- Loading --------------------------------- */
  if (vehiclesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  /* ---------------------------- Empty states ------------------------------- */
  if (vehicles.length === 0) {
    return <DashboardLandingPage />;
  }

  if (vehicles.length > 0 && fills.length === 0) {
    return <DashboardAddFills />;
  }

  /* ---------------------------- Normal dashboard --------------------------- */
  return (
    <>
      {vehiclesError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          {vehiclesError}
        </div>
      )}

      <section>
        {/* Header actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <VehicleSwitcher
            vehicles={vehicles}
            selectedVehicleIds={
              localSelectedVehicleId !== null ? [localSelectedVehicleId] : []
            }
            onVehicleChange={handleVehicleChange}
          />
          <AddFillClient />
        </div>

        {/* Content */}
        <div className="mt-6 grid grid-cols-1 gap-6">
          <Charts />
          <LatestFills />
        </div>
      </section>
    </>
  );
}