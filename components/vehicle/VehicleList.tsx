'use client';

import React from 'react';
import { Vehicle } from '@/types/vehicle';
import VehicleCard from './VehicleCard';

interface VehicleListProps {
  vehicles: Vehicle[];
}

export default function VehicleList({ vehicles }: VehicleListProps): React.ReactElement {
  return (
    <div className="personal-vehicles-section">
      {vehicles && vehicles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {vehicles.map((vehicle, index) => (
            <VehicleCard key={vehicle.vehicle_id || `vehicle-${index}`} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-4">Aucun véhicule disponible.</p>
      )}
    </div>
  );
}