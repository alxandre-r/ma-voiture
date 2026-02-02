'use client';

import React from 'react';
import { useVehicles } from '@/contexts/VehicleContext';
import { Vehicle } from '@/types/vehicle';
import VehicleCard from './VehicleCard';

export default function VehicleListPersonal() {
  const { vehiclesFull, selectedVehicleId, setSelectedVehicleId } = useVehicles();

  const handleVehicleSelect = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
  };

  if (vehiclesFull.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Aucun véhicule personnel trouvé
      </div>
    );
  }

  return (
    <div className="vehicle-list-personal">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Mes véhicules ({vehiclesFull.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehiclesFull.map((vehicle: Vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}                     // ici on passe bien le Vehicle complet
            isSelected={selectedVehicleId === vehicle.id}
            onSelect={() => handleVehicleSelect(vehicle.id)}
          />
        ))}
      </div>
    </div>
  );
}