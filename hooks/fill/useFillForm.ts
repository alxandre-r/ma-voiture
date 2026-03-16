import { useState, useEffect, useCallback } from 'react';

import { useFillActions } from '@/hooks/fill/useFillActions';

import type { Fill, FillFormData } from '@/types/fill';
import type { VehicleMinimal } from '@/types/vehicle';

function getVehicleFuelType(vehicles: VehicleMinimal[], vehicleId: number) {
  return vehicles.find((v) => v.vehicle_id === vehicleId)?.fuel_type ?? null;
}

export function getAllowedTypes(fuelType: string | null) {
  if (!fuelType) return { fill: true, charge: true };
  if (fuelType === 'Électrique') return { fill: false, charge: true };
  if (fuelType === 'Hybride rechargeable') return { fill: true, charge: true };
  return { fill: true, charge: false };
}

function resolveDefaultChargeType(fuelType: string | null): 'fill' | 'charge' {
  return fuelType === 'Électrique' ? 'charge' : 'fill';
}

function buildInitialFormData(
  initialFill: Fill | null | undefined,
  vehicles: VehicleMinimal[],
  preselectedVehicleId?: number,
): FillFormData {
  const vehicleId =
    preselectedVehicleId ??
    initialFill?.vehicle_id ??
    (vehicles.length === 1 ? vehicles[0].vehicle_id : 0);

  const fuelType = getVehicleFuelType(vehicles, vehicleId);

  return {
    vehicle_id: vehicleId,
    date: initialFill?.date ?? new Date().toISOString().split('T')[0],
    odometer: initialFill?.odometer ?? 0,
    liters: initialFill?.liters ?? 0,
    amount: initialFill?.amount ?? 0,
    price_per_liter: initialFill?.price_per_liter ?? 0,
    notes: initialFill?.notes ?? '',
    charge_type: initialFill?.charge_type ?? resolveDefaultChargeType(fuelType),
    kwh: initialFill?.kwh ?? 0,
    price_per_kwh: initialFill?.price_per_kwh ?? 0,
  };
}

export function useFillForm(
  vehicles: VehicleMinimal[],
  initialFill?: Fill | null,
  preselectedVehicleId?: number,
  forcedType?: 'fill' | 'charge',
) {
  const { calculateFillValues } = useFillActions();

  const [formData, setFormData] = useState<FillFormData>(() =>
    buildInitialFormData(initialFill, vehicles, preselectedVehicleId),
  );

  const fuelType = getVehicleFuelType(vehicles, formData.vehicle_id);
  const allowedTypes = getAllowedTypes(fuelType);
  const canChangeChargeType = allowedTypes.fill && allowedTypes.charge;
  const activeChargeType = forcedType ?? formData.charge_type;
  const isElectric = activeChargeType === 'charge';

  // Sync odometer when vehicle changes (création uniquement)
  useEffect(() => {
    if (initialFill || !formData.vehicle_id) return;
    const vehicle = vehicles.find((v) => v.vehicle_id === formData.vehicle_id);
    if (vehicle?.odometer != null) {
      setFormData((prev) => ({ ...prev, odometer: vehicle.odometer! }));
    }
  }, [formData.vehicle_id, vehicles]);

  // Sync charge_type when vehicle changes
  useEffect(() => {
    if (!formData.vehicle_id || forcedType) return;
    const newType = resolveDefaultChargeType(fuelType);
    if (!canChangeChargeType && formData.charge_type !== newType) {
      setFormData((prev) => ({ ...prev, charge_type: newType }));
    }
  }, [formData.vehicle_id]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;

      if (type === 'number') {
        const parsed = value === '' ? null : parseFloat(value.replace(',', '.'));
        const numeric = Number.isNaN(parsed as number) ? null : parsed;
        setFormData((prev) => calculateFillValues({ ...prev, [name]: numeric }, prev));
        return;
      }

      setFormData((prev) => {
        const next = { ...prev, [name]: value } as FillFormData;
        return name === 'charge_type' ? next : calculateFillValues(next);
      });
    },
    [calculateFillValues],
  );

  return {
    formData,
    handleChange,
    allowedTypes,
    canChangeChargeType,
    activeChargeType,
    isElectric,
  };
}
