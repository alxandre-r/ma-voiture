'use client';

/**
 * @file GarageVehiclesList.tsx
 * @fileoverview Client component for rendering the user's vehicles list.
 */
import VehicleCard from '@/app/(app)/garage/components/cards/VehicleCard';
import Icon from '@/components/common/ui/Icon';

import type { Vehicle } from '@/types/vehicle';

interface GarageVehiclesListProps {
  vehicles: Vehicle[];
  onVehicleClick: (vehicle: Vehicle) => void;
  onAddVehicle: () => void;
  activeInsuranceVehicleIds?: number[];
}

export function GarageVehiclesList({
  vehicles,
  onVehicleClick,
  onAddVehicle,
  activeInsuranceVehicleIds,
}: GarageVehiclesListProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon name="car" size={24} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
            Mes Véhicules
          </h3>
        </div>
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {vehicles.length} VÉHICULE{vehicles.length > 1 ? 'S' : ''}
        </span>
      </div>

      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.vehicle_id}
              vehicle={vehicle}
              onClick={onVehicleClick}
              hasActiveInsurance={activeInsuranceVehicleIds?.includes(vehicle.vehicle_id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Aucun véhicule personnel</p>
          <button
            onClick={onAddVehicle}
            className="mt-4 text-custom-2 hover:text-custom-2-hover font-medium"
          >
            + Ajouter un véhicule
          </button>
        </div>
      )}
    </section>
  );
}
