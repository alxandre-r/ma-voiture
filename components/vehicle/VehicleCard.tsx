'use client';

import Image from 'next/image';

import Icon from '@/components/common/ui/Icon';
import ProfilePicture from '@/components/user/ProfilePicture';

import type { Vehicle } from '@/types/vehicle';

interface VehicleOwner {
  user_id: string;
  user_name: string;
  avatar_url?: string | null;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: (vehicle: Vehicle) => void;
  isFamilyVehicle?: boolean;
  owner?: VehicleOwner;
}

export default function VehicleCard({
  vehicle,
  onClick,
  isFamilyVehicle,
  owner,
}: VehicleCardProps) {
  // Handle card click - use callback instead of navigation
  const handleClick = () => {
    if (onClick) {
      onClick(vehicle);
    }
  };

  // Use provided image or show placeholder
  const vehicleImage = vehicle.image;

  return (
    <div
      className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm 
      dark:bg-gray-800 dark:border-gray-700
      hover:shadow-md transition-shadow hover:-trangray-y-1 hover:border-custom-1/70 cursor-pointer transition-transform"
      onClick={handleClick}
    >
      {/* Click to view details - the whole card is clickable */}
      <div className="aspect-video w-full relative">
        {vehicleImage ? (
          <Image
            className="h-full w-full object-cover"
            alt={`${vehicle.make} ${vehicle.model}`}
            src={vehicleImage}
            fill
          />
        ) : (
          <div className="h-full w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Icon name="car" size={48} />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${vehicle.status === 'active' ? 'bg-emerald-500/50' : 'bg-gray-500/40'} backdrop-blur-sm `}
          >
            {vehicle.status === 'active' ? 'Actif' : 'Inactif'}
          </span>
        </div>

        {/* Owner badge - only show for family vehicles */}
        {isFamilyVehicle && owner && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 dark:bg-gray-700 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
            <ProfilePicture
              avatarUrl={owner.avatar_url}
              name={owner.user_name}
              size="sm"
              className="w-6 h-6"
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 pr-1">
              {owner.user_name}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h4 className="font-bold text-gray-900 dark:text-gray-100">
            <div className="flex items-center gap-2">
              <span>
                {vehicle.make} {vehicle.model}
              </span>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: vehicle.color || '#64748b' }}
              ></div>
            </div>
          </h4>
          <span className="text-xs font-mono font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded inline-block mt-1">
            {vehicle.plate || '—'}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Carburant</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {vehicle.fuel_type || '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Année</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {vehicle.year || '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Kilométrage</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {vehicle.odometer?.toLocaleString() || '—'} km
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Consommation</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {vehicle.calculated_consumption ? `${vehicle.calculated_consumption} L/100` : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
