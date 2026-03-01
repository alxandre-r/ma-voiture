// components/vehicle/VehicleList.tsx
// Component to display a list of vehicles, both personal and family. Used in GarageClient.

'use client';

import React from 'react';

import VehicleCard from './VehicleCard';
import VehicleCardReadOnly from './VehicleCardReadOnly';

import type { Vehicle } from '@/types/vehicle';

export default function VehicleList({
  vehicles,
  familyVehicles,
}: {
  vehicles: Vehicle[];
  familyVehicles: Vehicle[];
}) {
  return (
    <>
      {vehicles && vehicles.length > 0 ? (
        <section className="personal-vehicles-section">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-3">
            Vos véhicules
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {vehicles.map((vehicle, index) => (
              <VehicleCard key={vehicle.vehicle_id || `vehicle-${index}`} vehicle={vehicle} />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-4">
          Aucun véhicule disponible.
        </p>
      )}

      {familyVehicles && familyVehicles.length > 0 && (
        <section className="family-vehicles-section">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-3">
            Véhicules de la famille
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {familyVehicles.map((vehicle, index) => (
              <VehicleCardReadOnly
                key={vehicle.vehicle_id || `family-vehicle-${index}`}
                vehicle={vehicle}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
