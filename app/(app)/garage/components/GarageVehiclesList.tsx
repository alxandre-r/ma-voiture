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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.vehicle_id}
            vehicle={vehicle}
            onClick={onVehicleClick}
            hasActiveInsurance={activeInsuranceVehicleIds?.includes(vehicle.vehicle_id)}
          />
        ))}

        {/* Add vehicle card */}
        <button
          onClick={onAddVehicle}
          className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-custom-2/50 hover:border-custom-2 hover:bg-custom-2/5 transition-colors cursor-pointer min-h-[140px]"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-custom-2/50 group-hover:border-custom-2 flex items-center justify-center transition-colors mb-3">
            <Icon
              name="add"
              size={24}
              className="text-custom-2 opacity-60 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <span className="text-sm font-medium text-custom-2 opacity-60 group-hover:opacity-100 transition-opacity">
            Ajouter un véhicule
          </span>
        </button>
      </div>
    </section>
  );
}
