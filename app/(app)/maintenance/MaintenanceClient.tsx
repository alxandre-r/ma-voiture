'use client';

/**
 * @file MaintenanceClient.tsx
 * @fileoverview Client component for the Maintenance page.
 *
 * Architecture:
 * - Receives pre-fetched vehicles and expenses from server (SSR/streaming)
 * - Handles form state (add/edit) locally
 * - Client-side filtering by selected vehicles and period
 * - Uses shared SelectorsContext for filter state
 */

import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

import MaintenanceTimeline from '@/app/(app)/maintenance/components/MaintenanceTimeline';
import { useMaintenanceActions } from '@/app/(app)/maintenance/hooks/useMaintenanceActions';
import MaintenanceForm from '@/components/common/forms/MaintenanceForm';
import Drawer from '@/components/common/ui/Drawer';
import Icon from '@/components/common/ui/Icon';
import { useSelectors } from '@/contexts/SelectorsContext';
import { useUser } from '@/contexts/UserContext';
import { filterByVehiclesAndPeriod } from '@/lib/utils/filterUtils';

import type { MaintenanceFormData } from '@/app/(app)/maintenance/hooks/useMaintenanceActions';
import type { Expense } from '@/types/expense';
import type { VehicleMinimal } from '@/types/vehicle';

interface MaintenanceClientProps {
  vehicles: VehicleMinimal[];
  vehicleIds: number[];
  initialExpenses: Expense[];
}

/**
 * Maintenance content component that uses shared selectors.
 * Gets user from UserProvider via useUser() hook.
 * Receives pre-fetched data from server for optimal SSR performance.
 */
function MaintenanceContent({
  vehicleIds,
  vehicles: initialVehicles,
  initialExpenses,
}: {
  vehicleIds: number[];
  vehicles: VehicleMinimal[];
  initialExpenses: Expense[];
}) {
  const router = useRouter();

  // Get user from UserProvider (set up in layout)
  const user = useUser();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Use ref to track if this is the initial load
  const isInitialLoad = useRef(true);

  // Expenses state - initialized with server data
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  // Track if we're refreshing data
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { saving, adding, deletingId, addMaintenance, updateMaintenance, deleteMaintenance } =
    useMaintenanceActions();

  const { selectedVehicleIds, selectedPeriod } = useSelectors();

  // Fetch fresh data only when vehicleIds change (not on every render)
  useEffect(() => {
    // Skip the initial load since we already have data from server
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Fetch fresh data when vehicleIds change
    if (vehicleIds.length > 0) {
      setIsRefreshing(true);
      fetch(`/api/expenses/maintenanceExpense?vehicleIds=${vehicleIds.join(',')}`)
        .then((res) => res.json())
        .then((data) => setExpenses(data.expenses || []))
        .catch((error) => console.error('Failed to fetch maintenance expenses:', error))
        .finally(() => setIsRefreshing(false));
    }
  }, [vehicleIds]);

  /**
   * Vehicles available in the form.
   * Only active vehicles owned by the current user,
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
  const filteredExpenses = useMemo(
    () => filterByVehiclesAndPeriod(expenses, selectedVehicleIds, selectedPeriod),
    [expenses, selectedVehicleIds, selectedPeriod],
  );

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

  const handleAddClick = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Desktop button */}
      <div className="hidden sm:flex justify-end">
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-custom-2 hover:bg-custom-2-hover text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Icon name="add" size={18} className="invert dark:invert-0" />
          Ajouter une intervention
        </button>
      </div>

      <MaintenanceTimeline
        userId={user.id}
        vehicles={vehicles}
        expenses={filteredExpenses}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpense}
        deletingId={deletingId}
        isDataLoading={isRefreshing}
      />

      {/* Mobile FAB */}
      <button
        onClick={handleAddClick}
        className="sm:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-custom-2 hover:bg-custom-2-hover text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer"
        aria-label="Ajouter une intervention"
      >
        <Icon name="add" size={24} className="invert dark:invert-0" />
      </button>

      {/* Drawer */}
      <Drawer isOpen={showForm} onClose={handleCancelForm}>
        <MaintenanceForm
          initialExpense={editingExpense}
          vehicles={vehicles}
          onSave={handleSaveForm}
          onCancel={handleCancelForm}
          saving={!editingExpense ? adding : saving}
        />
      </Drawer>
    </div>
  );
}

/**
 * Maintenance client component with shared selectors.
 * SelectorsProvider is provided by the root layout.
 * User is retrieved from UserProvider via useUser() hook.
 */
export default function MaintenanceClient({
  vehicles,
  vehicleIds,
  initialExpenses,
}: MaintenanceClientProps) {
  return (
    <MaintenanceContent
      vehicles={vehicles}
      vehicleIds={vehicleIds}
      initialExpenses={initialExpenses}
    />
  );
}
