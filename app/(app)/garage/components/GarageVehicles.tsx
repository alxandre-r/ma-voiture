/**
 * @file GarageVehicles.tsx
 * @fileoverview Async Server Component that fetches and displays user's vehicles.
 * Wrapped in Suspense for streaming.
 */
import { getUserVehicles } from '@/lib/data/vehicles';

import { GarageVehiclesList } from './GarageVehiclesList';

import type { Vehicle } from '@/types/vehicle';

interface GarageVehiclesProps {
  onVehicleClick: (vehicle: Vehicle) => void;
  onAddVehicle: () => void;
}

export default async function GarageVehicles({
  onVehicleClick,
  onAddVehicle,
}: GarageVehiclesProps) {
  // Fetch user's vehicles on the server
  const vehicles = await getUserVehicles();

  return (
    <GarageVehiclesList
      vehicles={vehicles}
      onVehicleClick={onVehicleClick}
      onAddVehicle={onAddVehicle}
    />
  );
}
