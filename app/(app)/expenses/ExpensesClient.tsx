'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

import ExpenseButton from '@/components/common/ExpenseButton';
import FillForm from '@/components/common/forms/FillForm';
import MaintenanceForm from '@/components/common/forms/MaintenanceForm';
import SelectorsHeader from '@/components/common/SelectorsHeader';
import { ConfirmationModal } from '@/components/common/ui/ConfirmationModal';
import Spinner from '@/components/common/ui/Spinner';
import ExpenseList from '@/components/expenses/ExpenseList';
import { SelectorsProvider, useSelectors } from '@/contexts/SelectorsContext';
import { useExpenseActions } from '@/hooks/expense/useExpenseActions';

import type { MaintenanceFormData } from '@/hooks/maintenance/useMaintenanceActions';
import type { Expense } from '@/types/expense';
import type { FillFormData } from '@/types/fill';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

interface ExpensesClientProps {
  vehicles: (Vehicle | VehicleMinimal)[];
  currentUserId?: string;
  selectorVehicles: VehicleMinimal[];
}

type EditFormType = 'fill' | 'maintenance' | null;

/**
 * Expenses content component that uses shared selectors.
 */
function ExpensesContent({
  vehicles,
  currentUserId,
}: {
  vehicles: (Vehicle | VehicleMinimal)[];
  currentUserId?: string;
}) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);

  // State for edit form
  const [editFormType, setEditFormType] = useState<EditFormType>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [savingForm, setSavingForm] = useState(false);

  // Client-side data fetching
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { deleteExpense } = useExpenseActions();
  const { selectedVehicleIds, selectedPeriod } = useSelectors();

  // Get all vehicle IDs as an array (fetch all data once)
  const vehicleIds = useMemo(
    () => vehicles.map((v) => (v as Vehicle | VehicleMinimal).vehicle_id).filter((id) => id > 0),
    [vehicles],
  );

  // Fetch ALL expenses from API on client-side (once, with all vehicles)
  useEffect(() => {
    const fetchData = async () => {
      if (vehicleIds.length === 0) {
        setExpenses([]);
        setIsLoadingData(false);
        return;
      }

      try {
        const vehicleIdsParam = vehicleIds.join(',');

        // Fetch ALL expenses for all vehicles
        const expensesResponse = await fetch(`/api/expenses/get?vehicleIds=${vehicleIdsParam}`);
        const expensesData = await expensesResponse.json();

        if (expensesData.expenses) {
          setExpenses(expensesData.expenses);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [vehicleIds]);

  // Filter expenses by selected vehicles and period (client-side)
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Filter by selected vehicles
    if (selectedVehicleIds.length > 0) {
      result = result.filter((e) => selectedVehicleIds.includes(e.vehicle_id));
    }

    // Filter by period
    if (selectedPeriod && selectedPeriod !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      if (selectedPeriod === 'month') {
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (selectedPeriod === 'year') {
        cutoffDate = new Date(now.getFullYear(), 0, 1);
      } else {
        cutoffDate = new Date(0);
      }

      result = result.filter((e) => new Date(e.date) >= cutoffDate);
    }

    return result;
  }, [expenses, selectedVehicleIds, selectedPeriod]);

  // Handle successful operations - refresh SSR data
  const handleSuccess = () => {
    router.refresh();
  };

  // Handle edit expense - opens the appropriate form based on expense type
  const handleEditExpense = (expense: Expense) => {
    // Determine form type based on expense type
    if (expense.type === 'fuel' || expense.type === 'electric_charge') {
      setEditFormType('fill');
    } else if (expense.type === 'maintenance') {
      setEditFormType('maintenance');
    } else {
      // For other types (insurance, other), we could show a message or just close
      return;
    }
    setEditingExpense(expense);
  };

  // Cancel edit - go back to list view
  const handleCancelEdit = () => {
    setEditFormType(null);
    setEditingExpense(null);
  };

  // Handle save for fill form
  const handleSaveFill = async (data: FillFormData, _fillId?: number): Promise<boolean> => {
    setSavingForm(true);
    try {
      const payload = {
        vehicle_id: data.vehicle_id,
        date: data.date,
        amount: Number(data.amount),
        notes: data.notes || null,
        odometer: data.odometer ? Number(data.odometer) : null,
        liters: data.liters ?? null,
        price_per_liter: data.price_per_liter ?? null,
        kwh: data.kwh ?? null,
        price_per_kwh: data.price_per_kwh ?? null,
      };

      const res = await fetch('/api/expenses/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingExpense!.id, ...payload }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erreur lors de la modification du plein');
      }

      handleSuccess();
      handleCancelEdit();
      return true;
    } catch (err) {
      console.error('Failed to save fill:', err);
      return false;
    } finally {
      setSavingForm(false);
    }
  };

  // Handle save for maintenance form
  const handleSaveMaintenance = async (
    data: MaintenanceFormData,
    _expenseId?: number,
  ): Promise<boolean> => {
    setSavingForm(true);
    try {
      const payload = {
        vehicle_id: data.vehicle_id,
        date: data.date,
        amount: Number(data.amount),
        notes: data.notes || null,
        maintenance_type: data.maintenance_type || null,
        odometer: data.odometer ? Number(data.odometer) : null,
        garage: data.garage || null,
      };

      const res = await fetch('/api/expenses/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingExpense!.id, ...payload }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Erreur lors de la modification de l'entretien");
      }

      handleSuccess();
      handleCancelEdit();
      return true;
    } catch (err) {
      console.error('Failed to save maintenance:', err);
      return false;
    } finally {
      setSavingForm(false);
    }
  };

  // Handle delete expense - show confirmation modal
  const handleDeleteExpenseClick = (expenseId: number) => {
    setDeletingExpenseId(expenseId);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (deletingExpenseId) {
      const success = await deleteExpense(deletingExpenseId);
      if (success) {
        handleSuccess();
      }
    }
    setShowDeleteConfirm(false);
    setDeletingExpenseId(null);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingExpenseId(null);
  };

  // Convert vehicles to minimal format for forms
  const minimalVehicles = useMemo(() => {
    return vehicles.map((v) => ({
      vehicle_id: (v as Vehicle | VehicleMinimal).vehicle_id,
      name: v.name,
      make: v.make,
      model: v.model,
      fuel_type: v.fuel_type,
      odometer: (v as Vehicle | VehicleMinimal).odometer,
    }));
  }, [vehicles]);

  // Note: All hooks must be called before any conditional returns
  // Check if user has any vehicles - must be after all hooks
  const userHasVehicles = currentUserId ? vehicles.some((v) => v.owner_id === currentUserId) : true;

  // Early return if no vehicles - must be after all hooks
  if (!vehicles || vehicles.length === 0 || !userHasVehicles) {
    return (
      <div className="text-center py-8">
        Aucun véhicule trouvé. Veuillez ajouter un véhicule pour commencer à suivre vos dépenses.
      </div>
    );
  }

  // Early return for loading state - must be after all hooks
  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner />
        <p className="text-gray-600">Chargement des données...</p>
      </div>
    );
  }

  // When editing, show the form instead of the list (replaces page content)
  if (editFormType === 'fill' && editingExpense) {
    return (
      <div>
        {/* Edit Form - replaces content */}
        <FillForm
          initialFill={{
            id: editingExpense.id,
            vehicle_id: editingExpense.vehicle_id,
            owner: editingExpense.owner_id,
            date: editingExpense.date,
            odometer: editingExpense.odometer ?? 0,
            liters: editingExpense.liters ?? 0,
            amount: editingExpense.amount,
            price_per_liter: editingExpense.price_per_liter ?? 0,
            notes: editingExpense.notes ?? '',
            charge_type: editingExpense.type === 'electric_charge' ? 'charge' : 'fill',
            kwh: editingExpense.kwh ?? 0,
            price_per_kwh: editingExpense.price_per_kwh ?? 0,
          }}
          vehicles={minimalVehicles}
          onSave={handleSaveFill}
          onCancel={handleCancelEdit}
          saving={savingForm}
        />
      </div>
    );
  }

  if (editFormType === 'maintenance' && editingExpense) {
    return (
      <div>
        {/* Edit Form - replaces content */}
        <MaintenanceForm
          initialExpense={editingExpense}
          vehicles={minimalVehicles}
          onSave={handleSaveMaintenance}
          onCancel={handleCancelEdit}
          saving={savingForm}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header row with ExpenseButton - handles creating new expenses */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <ExpenseButton vehicles={vehicles} currentUserId={currentUserId} />
      </div>

      {/* Expense List */}
      <ExpenseList
        vehicles={vehicles}
        expenses={filteredExpenses}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpenseClick}
        currentUserId={currentUserId}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
      />
    </div>
  );
}

/**
 * Expenses client component with shared selectors.
 */
export default function ExpensesClient({
  vehicles,
  currentUserId,
  selectorVehicles,
}: ExpensesClientProps) {
  return (
    <SelectorsProvider initialVehicles={selectorVehicles}>
      <SelectorsHeader title="Dépenses" vehicles={selectorVehicles} />
      <ExpensesContent vehicles={vehicles} currentUserId={currentUserId} />
    </SelectorsProvider>
  );
}
