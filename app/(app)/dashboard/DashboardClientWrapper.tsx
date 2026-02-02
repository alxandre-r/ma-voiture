'use client';

import React from "react";
import { VehicleProvider, useVehicles } from "@/contexts/VehicleContext";
import { FillProvider } from "@/contexts/FillContext";
import DashboardClient from "./DashboardClient";

/**
 * Wrapper client pour fournir les contextes aux composants
 */
export default function DashboardClientWrapper() {
  return (
    <VehicleProvider>
      <VehicleDashboardContent />
    </VehicleProvider>
  );
}

/**
 * Tout ce qui utilise des hooks React doit être ici
 */
function VehicleDashboardContent() {
  const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles();

  if (vehiclesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (vehiclesError) {
    return (
      <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
        {vehiclesError}
      </div>
    );
  }

  // Passer les véhicules au FillProvider
  return (
    <FillProvider vehiclesProp={vehicles}>
      <DashboardClient />
    </FillProvider>
  );
}