import { useState, useEffect, useCallback } from 'react';

import { MAINTENANCE_TYPES } from '@/types/maintenance';

import type { MaintenanceFormData } from '@/app/(app)/maintenance/hooks/useMaintenanceActions';
import type { Expense } from '@/types/expense';
import type { VehicleMinimal } from '@/types/vehicle';

function resolveMaintenanceTypeCode(expense: Expense | null | undefined): string {
  if (!expense?.maintenance_type_label) return 'repair';
  return (
    MAINTENANCE_TYPES.find((t) => t.label === expense.maintenance_type_label)?.value ?? 'repair'
  );
}

function buildInitialFormData(
  initialExpense: Expense | null | undefined,
  vehicles: VehicleMinimal[],
): MaintenanceFormData {
  return {
    vehicle_id: initialExpense?.vehicle_id ?? (vehicles.length === 1 ? vehicles[0].vehicle_id : 0),
    date: initialExpense?.date ?? new Date().toISOString().split('T')[0],
    amount: initialExpense?.amount ?? 0,
    notes: initialExpense?.notes ?? '',
    maintenance_type: resolveMaintenanceTypeCode(initialExpense),
    odometer: initialExpense?.odometer ?? 0,
    garage: initialExpense?.garage ?? '',
  };
}

export function useMaintenanceForm(vehicles: VehicleMinimal[], initialExpense?: Expense | null) {
  const [formData, setFormData] = useState<MaintenanceFormData>(() =>
    buildInitialFormData(initialExpense, vehicles),
  );

  // Sync odometer when vehicle changes (création uniquement)
  useEffect(() => {
    if (initialExpense || !formData.vehicle_id) return;
    const vehicle = vehicles.find((v) => v.vehicle_id === formData.vehicle_id);
    if (vehicle?.odometer != null) {
      setFormData((prev) => ({ ...prev, odometer: vehicle.odometer! }));
    }
  }, [formData.vehicle_id, vehicles]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? (value ? Number(value) : 0) : value,
      }));
    },
    [],
  );

  return { formData, handleChange };
}
