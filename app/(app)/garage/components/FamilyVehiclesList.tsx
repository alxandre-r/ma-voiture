'use client';

/**
 * @file FamilyVehiclesList.tsx
 * @fileoverview Client component for rendering the family vehicles list.
 */
import VehicleCard from '@/app/(app)/garage/components/cards/VehicleCard';
import Icon from '@/components/common/ui/Icon';

import type { FamilyMemberDisplay } from '@/types/family';
import type { Vehicle } from '@/types/vehicle';

interface FamilyVehiclesListProps {
  vehicles: Vehicle[];
  familyMembers: FamilyMemberDisplay[];
  onVehicleClick: (vehicle: Vehicle) => void;
}

export function FamilyVehiclesList({
  vehicles,
  familyMembers,
  onVehicleClick,
}: FamilyVehiclesListProps) {
  // Helper to get owner info for a family vehicle
  const getOwnerInfo = (vehicle: Vehicle) => {
    if (!vehicle.owner_id || !familyMembers) return null;
    const member = familyMembers.find((m) => m.user_id === vehicle.owner_id);
    if (!member) return null;
    return {
      user_id: member.user_id,
      user_name: member.user_name,
      avatar_url: member.avatar_url,
    };
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon name="family" size={24} className="text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
            Véhicules de la Famille
          </h3>
        </div>
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {vehicles.length} VÉHICULE{vehicles.length > 1 ? 'S' : ''} PARTAGÉ
          {vehicles.length > 1 ? 'S' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => {
          const ownerInfo = getOwnerInfo(vehicle);
          return (
            <VehicleCard
              key={vehicle.vehicle_id}
              vehicle={vehicle}
              onClick={onVehicleClick}
              isFamilyVehicle={true}
              owner={ownerInfo || undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
