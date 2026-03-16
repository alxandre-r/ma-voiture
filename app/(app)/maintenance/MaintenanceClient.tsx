'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback } from 'react';

import MaintenanceForm from '@/components/common/forms/MaintenanceForm';
import SelectorsHeader from '@/components/common/SelectorsHeader';
import Icon from '@/components/common/ui/Icon';
import MaintenanceTimeline from '@/components/maintenance/MaintenanceTimeline';
import { SelectorsProvider, useSelectors } from '@/contexts/SelectorsContext';
import { useMaintenanceActions } from '@/hooks/maintenance/useMaintenanceActions';

import type { MaintenanceFormData } from '@/hooks/maintenance/useMaintenanceActions';
import type { Expense } from '@/types/expense';
import type { User } from '@/types/user';
import type { VehicleMinimal } from '@/types/vehicle';

interface MaintenanceClientProps {
  user: User;
  vehicles: VehicleMinimal[];
  expenses: Expense[];
  selectorVehicles: VehicleMinimal[];
}

/**
 * Compute cutoff date based on selected period.
 */
function getCutoffDate(period: string | null) {
  const now = new Date();

  switch (period) {
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);

    case 'year':
      return new Date(now.getFullYear(), 0, 1);

    default:
      return null;
  }
}

/**
 * Maintenance content component that uses shared selectors.
 */
function MaintenanceContent({
  user,
  vehicles: initialVehicles,
  expenses,
}: {
  user: User;
  vehicles: VehicleMinimal[];
  expenses: Expense[];
}) {
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { saving, adding, deletingId, addMaintenance, updateMaintenance, deleteMaintenance } =
    useMaintenanceActions();

  const { selectedVehicleIds, selectedPeriod } = useSelectors();

  /**
   * Vehicles available in the form.
   * Only active vehicles owned by the user,
   * plus the vehicle of the expense being edited.
   */
  const vehicles = useMemo(() => {
    const activeVehicles = initialVehicles.filter((v) => {
      const isActive = v.status === 'active' || v.status == null;
      const isOwner = v.owner_id === user.id;
      return isActive && isOwner;
    });

    if (!editingExpense) return activeVehicles;

    const editingVehicleId = editingExpense.vehicle_id;

    if (activeVehicles.some((v) => v.vehicle_id === editingVehicleId)) {
      return activeVehicles;
    }

    const editingVehicle = initialVehicles.find((v) => v.vehicle_id === editingVehicleId);

    return editingVehicle ? [...activeVehicles, editingVehicle] : activeVehicles;
  }, [initialVehicles, editingExpense, user.id]);

  /**
   * Filter expenses according to selectors.
   */
  const filteredExpenses = useMemo(() => {
    let result = expenses;

    if (selectedVehicleIds.length > 0) {
      const vehicleSet = new Set(selectedVehicleIds);
      result = result.filter((e) => vehicleSet.has(e.vehicle_id));
    }

    const cutoffDate = getCutoffDate(selectedPeriod);

    if (cutoffDate) {
      result = result.filter((e) => new Date(e.date) >= cutoffDate);
    }

    return result;
  }, [expenses, selectedVehicleIds, selectedPeriod]);

  /**
   * Handlers
   */

  const handleEditExpense = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingExpense(null);
  }, []);

  const handleSaveForm = useCallback(
    async (data: MaintenanceFormData, expenseId?: number): Promise<boolean> => {
      const success = expenseId
        ? await updateMaintenance(expenseId, data)
        : await addMaintenance(data);

      if (success) {
        handleCancelForm();
        router.refresh();
      }

      return success;
    },
    [addMaintenance, updateMaintenance, handleCancelForm, router],
  );

  const handleDeleteExpense = useCallback(
    async (expenseId: number): Promise<boolean> => {
      const success = await deleteMaintenance(expenseId);

      if (success) {
        router.refresh();
      }

      return success;
    },
    [deleteMaintenance, router],
  );

  /**
   * Empty state
   */
  if (vehicles.length === 0) {
    return (
      <div className="text-center py-8">
        Aucun véhicule trouvé pour la sélection. Veuillez ajouter un véhicule pour commencer à
        suivre vos entretiens.
      </div>
    );
  }

  /**
   * Form mode
   */
  if (showForm) {
    const isAdding = !editingExpense;

    return (
      <MaintenanceForm
        initialExpense={editingExpense}
        vehicles={vehicles}
        onSave={handleSaveForm}
        onCancel={handleCancelForm}
        saving={isAdding ? adding : saving}
      />
    );
  }

  /**
   * Timeline view
   */
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => {
            setEditingExpense(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-custom-2 hover:bg-custom-2-hover text-white rounded-lg font-medium transition-colors flex items-center gap-2 self-center sm:self-auto cursor-pointer"
        >
          <Icon name="add" size={18} className="invert" />
          Ajouter une intervention
        </button>
      </div>

      <MaintenanceTimeline
        vehicles={vehicles}
        expenses={filteredExpenses}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpense}
        deletingId={deletingId}
      />
    </div>
  );
}

/**
 * Maintenance client component with shared selectors.
 */
export default function MaintenanceClient({
  user,
  vehicles,
  expenses,
  selectorVehicles,
}: MaintenanceClientProps) {
  return (
    <SelectorsProvider initialVehicles={selectorVehicles}>
      <SelectorsHeader title="Maintenance" vehicles={selectorVehicles} />
      <MaintenanceContent user={user} vehicles={vehicles} expenses={expenses} />
    </SelectorsProvider>
  );
}
