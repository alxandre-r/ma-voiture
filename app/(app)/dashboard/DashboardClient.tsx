'use client';

import React, { useEffect, useState } from "react";
import VehicleSwitcher from "@/components/vehicle/VehicleSwitcher";
import FillModal from "@/components/fill/forms/FillModal";
import Icon from "@/components/ui/Icon";
import Charts from "@/components/dashboard/Charts";
import LatestFills from "@/components/dashboard/LatestFills";
import { useFills } from "@/contexts/FillContext";
import { useVehicles } from "@/contexts/VehicleContext";

function AddFillClient() {
  const { vehicles } = useVehicles();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-3 bg-custom-2 text-white rounded-lg hover:bg-custom-2-hover flex items-center gap-2 transition-all duration-200 sm:px-6 sm:py-3 hover:cursor-pointer"
        aria-label="Ajouter un plein"
      >
        <Icon name="add" size={20} className="invert dark:invert-0" />
        <span className="font-medium">Ajouter un plein</span>
      </button>

      <FillModal open={open} onClose={() => setOpen(false)} vehicles={vehicles} />
    </>
  );
}

export default function DashboardClient() {
  const { vehicles, selectedVehicleId, setSelectedVehicleId, loading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const { setVehicles: setFillsVehicles, setSelectedVehicleIds } = useFills();

  // Initialisation unique de la sélection locale
  const [localSelectedVehicleId, setLocalSelectedVehicleId] = useState<number | null>(() => 
    selectedVehicleId ?? (vehicles[0]?.id ?? null)
  );

  useEffect(() => {
    // Remplit le FillContext avec les véhicules
    setFillsVehicles(vehicles);

    // Si un seul véhicule et aucune sélection initiale
    if (vehicles.length === 1 && !selectedVehicleId) {
      const id = vehicles[0].id;
      setLocalSelectedVehicleId(id);
      setSelectedVehicleIds([id]);
      setSelectedVehicleId(id);
    }
  }, [vehicles, setFillsVehicles, setSelectedVehicleIds, setSelectedVehicleId, selectedVehicleId]);

  // Gestion de la sélection provenant du VehicleSwitcher
  const handleVehicleChange = (vehicleIds: number[]) => {
    const id = vehicleIds.length > 0 ? vehicleIds[0] : null;
    setLocalSelectedVehicleId(id);         // LOCAL uniquement pour le label
    setSelectedVehicleIds(vehicleIds);     // FillContext
    setSelectedVehicleId(id);              // Parent sync
  };

  const isSwitcherDisabled = vehicles.length === 0;

  if (vehiclesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      {vehiclesError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          {vehiclesError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <VehicleSwitcher
          vehicles={vehicles}
          selectedVehicleIds={localSelectedVehicleId !== null ? [localSelectedVehicleId] : []}
          onVehicleChange={handleVehicleChange}
          disabled={isSwitcherDisabled}
        />
        <AddFillClient />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <Charts />
        <LatestFills />
      </div>
    </>
  );
}