import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

// Get vehicle name from vehicle ID
function getVehicleName(vehicleId: number, vehicles: Vehicle[] | VehicleMinimal[]): string {
  const vehicle = vehicles.find((v) => v.vehicle_id === vehicleId);
  if (!vehicle) return 'Véhicule';

  return vehicle.name || `${vehicle.make} ${vehicle.model}`;
}

export { getVehicleName };
