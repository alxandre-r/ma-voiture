'use client';

import React from 'react';
import AddVehicleButton from './AddVehicleButton';
import { useVehicles } from '@/contexts/VehicleContext';
import VehicleList from '@/components/vehicle/VehicleList';

export default function GarageClient() {
  const { vehiclesFull, loading, error } = useVehicles();

  if (loading) {
    return <div className="text-center py-8">Chargement des véhicules...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Erreur: {error}
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
        Vos véhicules
      </h1>

      <VehicleList vehicles={vehiclesFull} />

      <AddVehicleButton />
    </main>
  );
}