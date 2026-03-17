import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

// Get vehicle name from vehicle ID
function getVehicleName(vehicleId: number, vehicles: Vehicle[]): string {
  const vehicle = vehicles.find((v) => v.vehicle_id === vehicleId);
  if (!vehicle) return 'Véhicule';

  return vehicle.name || `${vehicle.make} ${vehicle.model}`;
}

function mapVehiclesToMinimal(vehicles: Vehicle[]): VehicleMinimal[] {
  return vehicles.map((v) => ({
    vehicle_id: v.vehicle_id,
    name: v.name,
    make: v.make,
    model: v.model,
    color: v.color,
    odometer: v.odometer,
    owner_id: v.owner_id,
    status: v.status,
  }));
}

export { getVehicleName, mapVehiclesToMinimal };
