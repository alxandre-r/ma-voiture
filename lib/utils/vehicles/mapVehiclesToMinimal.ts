import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

export function mapVehiclesToMinimal(vehicles: Vehicle[]): VehicleMinimal[] {
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
