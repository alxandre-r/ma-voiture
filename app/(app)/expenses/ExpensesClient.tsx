'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';

import ExpenseList from '@/app/(app)/expenses/components/ExpenseList';
import { useExpenseActions } from '@/app/(app)/expenses/hooks/useExpenseActions';
import { useMaintenanceActions } from '@/app/(app)/maintenance/hooks/useMaintenanceActions';
import ExpenseButton from '@/components/common/ExpenseButton';
import FillForm from '@/components/common/forms/FillForm';
import MaintenanceForm from '@/components/common/forms/MaintenanceForm';
import OtherForm from '@/components/common/forms/OtherForm';
import { ConfirmationModal } from '@/components/common/ui/ConfirmationModal';
import Drawer from '@/components/common/ui/Drawer';
import { useNotifications } from '@/contexts/NotificationContext';
import { useSelectors } from '@/contexts/SelectorsContext';
import { useUser } from '@/contexts/UserContext';
import { useFillActions } from '@/hooks/fill/useFillActions';
import { useOtherActions } from '@/hooks/other/useOtherActions';
import { filterByVehiclesAndPeriod } from '@/lib/utils/filterUtils';

import type { MaintenanceFormData } from '@/app/(app)/maintenance/hooks/useMaintenanceActions';
import type { ExpenseType } from '@/components/common/ExpenseButton';
import type { OtherFormData } from '@/hooks/other/useOtherActions';
import type { Expense } from '@/types/expense';
import type { FillFormData } from '@/types/fill';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

interface ExpensesClientProps {
  vehicles: (Vehicle | VehicleMinimal)[];
  initialExpenses: Expense[];
}

type EditFormType = 'fill' | 'maintenance' | 'other' | null;

/**
 * Expenses content component that uses shared selectors.
 */
function ExpensesContent({
  vehicles,
  initialExpenses,
}: {
  vehicles: (Vehicle | VehicleMinimal)[];
  initialExpenses: Expense[];
}) {
  const router = useRouter();
  const user = useUser();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);

  // State for edit form
  const [editFormType, setEditFormType] = useState<EditFormType>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [savingForm, setSavingForm] = useState(false);

  // State for add form (new expense)
  const [addExpenseType, setAddExpenseType] = useState<ExpenseType | null>(null);
  const [showAddFillForm, setShowAddFillForm] = useState(false);
  const [showAddMaintenanceForm, setShowAddMaintenanceForm] = useState(false);
  const [showAddOtherForm, setShowAddOtherForm] = useState(false);

  const { showError } = useNotifications();
  const { deleteExpense } = useExpenseActions();
  const { addFill, adding } = useFillActions();
  const { addMaintenance } = useMaintenanceActions();
  const { addOther, updateOther } = useOtherActions();
  const { selectedVehicleIds, selectedPeriod } = useSelectors();

  // Filter expenses by selected vehicles and period (client-side)
  const filteredExpenses = useMemo(
    () => filterByVehiclesAndPeriod(initialExpenses, selectedVehicleIds, selectedPeriod),
    [initialExpenses, selectedVehicleIds, selectedPeriod],
  );

  // Handle successful operations - refresh SSR data
  const handleSuccess = () => {
    router.refresh();
  };

  // Handle add new expense selection
  const handleSelectAddType = (type: ExpenseType) => {
    setAddExpenseType(type);
    if (type === 'maintenance') {
      setShowAddMaintenanceForm(true);
    } else if (type === 'other') {
      setShowAddOtherForm(true);
    } else {
      setShowAddFillForm(true);
    }
  };

  const handleAddFillSave = async (
    data: FillFormData,
    _fillId?: number,
    pendingFiles?: File[],
  ): Promise<boolean> => {
    const success = await addFill(data, pendingFiles);
    if (success) {
      handleSuccess();
      setShowAddFillForm(false);
      setAddExpenseType(null);
    }
    return success;
  };

  const handleAddMaintenanceSave = async (
    data: MaintenanceFormData,
    _expenseId?: number,
    pendingFiles?: File[],
  ): Promise<boolean> => {
    const success = await addMaintenance(data, pendingFiles);
    if (success) {
      handleSuccess();
      setShowAddMaintenanceForm(false);
      setAddExpenseType(null);
    }
    return success;
  };

  const handleAddOtherSave = async (
    data: OtherFormData,
    _expenseId?: number,
    pendingFiles?: File[],
  ): Promise<boolean> => {
    const success = await addOther(data, pendingFiles);
    if (success) {
      handleSuccess();
      setShowAddOtherForm(false);
      setAddExpenseType(null);
    }
    return success;
  };

  // Handle edit expense - opens the appropriate form based on expense type
  const handleEditExpense = (expense: Expense) => {
    if (expense.type === 'fuel' || expense.type === 'electric_charge') {
      setEditFormType('fill');
    } else if (expense.type === 'maintenance') {
      setEditFormType('maintenance');
    } else if (expense.type === 'other') {
      setEditFormType('other');
    } else {
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
      showError(err instanceof Error ? err.message : 'Erreur lors de la modification du plein');
      return false;
    } finally {
      setSavingForm(false);
    }
  };

  // Handle save for other form
  const handleSaveOther = async (data: OtherFormData): Promise<boolean> => {
    setSavingForm(true);
    try {
      const success = await updateOther(editingExpense!.id, data);
      if (success) {
        handleSuccess();
        handleCancelEdit();
      }
      return success;
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
      showError(
        err instanceof Error ? err.message : "Erreur lors de la modification de l'entretien",
      );
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
      owner_id: v.owner_id,
      status: (v as Vehicle | VehicleMinimal).status,
      permission_level: (v as Vehicle).permission_level ?? null,
    }));
  }, [vehicles]);

  // All active vehicles the current user can write to
  const writableVehicles = useMemo(
    () =>
      minimalVehicles.filter((v) => {
        const isActive = v.status === 'active' || v.status === null || v.status === undefined;
        const canWrite = v.owner_id === user?.id || v.permission_level === 'write';
        return isActive && canWrite;
      }),
    [minimalVehicles, user?.id],
  );

  // Vehicles for the add fill/charge form — writable + fuel-type filter
  const addFormVehicles = useMemo(() => {
    return addExpenseType === 'charge'
      ? writableVehicles.filter(
          (v) => v.fuel_type === 'Électrique' || v.fuel_type === 'Hybride rechargeable',
        )
      : writableVehicles.filter(
          (v) => v.fuel_type !== 'Électrique' && v.fuel_type !== 'Hybride non rechargeable',
        );
  }, [writableVehicles, addExpenseType]);

  // Vehicles for edit forms — writable + always include the expense being edited
  const editFormVehicles = useMemo(() => {
    if (!editingExpense) return writableVehicles;
    if (writableVehicles.some((v) => v.vehicle_id === editingExpense.vehicle_id))
      return writableVehicles;
    const editingVehicle = minimalVehicles.find((v) => v.vehicle_id === editingExpense.vehicle_id);
    return editingVehicle ? [...writableVehicles, editingVehicle] : writableVehicles;
  }, [writableVehicles, minimalVehicles, editingExpense]);

  // Computed initial data for the edit fill form
  const editFillInitial =
    editingExpense && editFormType === 'fill'
      ? {
          id: editingExpense.id,
          vehicle_id: editingExpense.vehicle_id,
          owner: editingExpense.owner_id,
          date: editingExpense.date,
          odometer: editingExpense.odometer ?? 0,
          liters: editingExpense.liters ?? 0,
          amount: editingExpense.amount,
          price_per_liter: editingExpense.price_per_liter ?? 0,
          notes: editingExpense.notes ?? '',
          charge_type: (editingExpense.type === 'electric_charge' ? 'charge' : 'fill') as
            | 'fill'
            | 'charge',
          kwh: editingExpense.kwh ?? 0,
          price_per_kwh: editingExpense.price_per_kwh ?? 0,
        }
      : null;

  // Note: All hooks must be called before any conditional returns
  // Check if user has any vehicles - must be after all hooks
  const userHasVehicles = user?.id ? vehicles.some((v) => v.owner_id === user.id) : true;

  // Early return if no vehicles - must be after all hooks
  if (!vehicles || vehicles.length === 0 || !userHasVehicles) {
    return (
      <div className="text-center py-8">
        Aucun véhicule trouvé. Veuillez ajouter un véhicule pour commencer à suivre vos dépenses.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Expense List — ExpenseButton passed as headerAction to sit alongside stats */}
      <ExpenseList
        vehicles={vehicles}
        expenses={filteredExpenses}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpenseClick}
        currentUserId={user?.id}
        headerAction={
          <ExpenseButton
            vehicles={vehicles as VehicleMinimal[]}
            currentUserId={user?.id}
            onSelectType={handleSelectAddType}
          />
        }
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

      {/* Drawers */}
      <Drawer
        isOpen={showAddFillForm && !!addExpenseType}
        onClose={() => {
          setShowAddFillForm(false);
          setAddExpenseType(null);
        }}
      >
        <FillForm
          vehicles={addFormVehicles}
          forcedType={addExpenseType === 'charge' ? 'charge' : 'fill'}
          onSave={handleAddFillSave}
          onCancel={() => {
            setShowAddFillForm(false);
            setAddExpenseType(null);
          }}
          saving={adding}
        />
      </Drawer>

      <Drawer
        isOpen={showAddMaintenanceForm}
        onClose={() => {
          setShowAddMaintenanceForm(false);
          setAddExpenseType(null);
        }}
      >
        <MaintenanceForm
          vehicles={writableVehicles}
          onSave={handleAddMaintenanceSave}
          onCancel={() => {
            setShowAddMaintenanceForm(false);
            setAddExpenseType(null);
          }}
          saving={false}
        />
      </Drawer>

      <Drawer isOpen={editFormType === 'fill' && !!editingExpense} onClose={handleCancelEdit}>
        <FillForm
          initialFill={editFillInitial}
          vehicles={editFormVehicles}
          onSave={handleSaveFill}
          onCancel={handleCancelEdit}
          saving={savingForm}
        />
      </Drawer>

      <Drawer
        isOpen={editFormType === 'maintenance' && !!editingExpense}
        onClose={handleCancelEdit}
      >
        <MaintenanceForm
          initialExpense={editingExpense}
          vehicles={editFormVehicles}
          onSave={handleSaveMaintenance}
          onCancel={handleCancelEdit}
          saving={savingForm}
        />
      </Drawer>

      <Drawer
        isOpen={showAddOtherForm}
        onClose={() => {
          setShowAddOtherForm(false);
          setAddExpenseType(null);
        }}
      >
        <OtherForm
          vehicles={writableVehicles}
          onSave={handleAddOtherSave}
          onCancel={() => {
            setShowAddOtherForm(false);
            setAddExpenseType(null);
          }}
        />
      </Drawer>

      <Drawer isOpen={editFormType === 'other' && !!editingExpense} onClose={handleCancelEdit}>
        <OtherForm
          initialExpense={editingExpense}
          vehicles={editFormVehicles}
          onSave={handleSaveOther}
          onCancel={handleCancelEdit}
          saving={savingForm}
        />
      </Drawer>
    </div>
  );
}

/**
 * Expenses client component with shared selectors.
 * SelectorsProvider is provided by the root layout.
 */
export default function ExpensesClient({ vehicles, initialExpenses }: ExpensesClientProps) {
  return <ExpensesContent vehicles={vehicles} initialExpenses={initialExpenses} />;
}
