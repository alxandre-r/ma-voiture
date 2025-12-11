/**
 * @file components/vehicle/VehicleList.tsx
 * @fileoverview Component for displaying and managing a user's vehicle list.
 * 
 * This component has been refactored to use smaller, reusable subcomponents
 * for better maintainability and organization.
 */

'use client';

import React, { useState } from 'react';
import { useVehicles } from '@/contexts/VehicleContext';
import { useNotifications } from '@/contexts/NotificationContext';
import VehicleCard from './VehicleCard';
import VehicleListStates from './VehicleListStates';

/**
 * Vehicle type definition for the list component.
 * Includes optional fields to handle partial data from API.
 */
type Vehicle = {
  id: string;
  owner?: string | null;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  fuel_type?: string | null;
  manufacturer_consumption?: number | null;
  odometer?: number | null;
  plate?: string | null;
  created_at?: string | null;
  [key: string]: unknown; // Allow for additional fields from API
};

/**
 * VehicleList Component
 * 
 * Displays a list of vehicles with the ability to view details and edit vehicle information.
 * Handles fetching, loading states, error states, and inline editing.
 * Uses reusable subcomponents for better organization.
 */
export default function VehicleList(): React.ReactElement {
  const {
    vehicles,
    loading,
    error,
    refreshVehicles,
  } = useVehicles();

  // UI state
  const [editingId, setEditingId] = useState<string | null>(null); // Currently editing vehicle ID
  const [editData, setEditData] = useState<Partial<Vehicle> | null>(null); // Edit form data
  const [saving, setSaving] = useState(false); // Save operation in progress
  const [deletingId, setDeletingId] = useState<string | null>(null); // Currently deleting vehicle ID
  const [editError, setEditError] = useState<string | null>(null); // Edit operation error

  // Notification context
  const { showSuccess, showError } = useNotifications();

  /**
   * Initialize editing for a vehicle.
   * Sets up edit form with current vehicle data.
   * 
   * @param {Vehicle} v - Vehicle to edit
   */
  function startEdit(v: Vehicle) {
    setEditingId(v.id);
    // clone only known editable fields + plate
    setEditData({
      name: v.name ?? '',
      owner: v.owner ?? '',
      make: v.make ?? '',
      model: v.model ?? '',
      year: v.year ?? undefined,
      fuel_type: v.fuel_type ?? '',
      manufacturer_consumption: v.manufacturer_consumption ?? undefined,
      plate: v.plate ?? '',
    });
  }

  /**
   * Cancel editing and reset edit state.
   */
  function cancelEdit() {
    setEditingId(null);
    setEditData(null);
  }

  /**
   * Save edited vehicle data to backend.
   * Uses optimistic UI update for better UX.
   * 
   * @param {string} id - Vehicle ID to save
   */
  async function saveEdit(id: string) {
    if (!editData) return;
    setSaving(true);
    try {
      // call update endpoint (assumes backend)
      const res = await fetch('/api/vehicles/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editData }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      // Optimistic update - update the vehicle in the list
      // Note: Since we're using context, we would need to add an update function
      // For now, we'll just refresh the list
      refreshVehicles();
      
      // Show success notification
      showSuccess('Véhicule modifié avec succès !');
      
      cancelEdit();
    } catch (err) {
      // basic error handling
      setEditError((err as Error).message || 'Save failed');
      
      // Show error notification
      showError((err as Error).message || 'Échec de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  /**
   * Handle field changes in edit form.
   * Generic function to update edit data state.
   * 
   * @param {string} key - Field key
   * @param {unknown} value - Field value
   */
  function onChangeField(key: string, value: unknown) {
    setEditData((prev) => ({ ...(prev ?? {}), [key]: value }));
  }

  /**
   * Delete a vehicle after confirmation.
   * 
   * @param {string} vehicleId - ID of vehicle to delete
   */
  async function handleDelete(vehicleId: string) {
    setDeletingId(vehicleId);

    try {
      const res = await fetch('/api/vehicles/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression du véhicule');
      }

      // Optimistic update - remove vehicle from list
      // Since we're using context, we would need to add a delete function
      // For now, we'll just refresh the list
      refreshVehicles();
      
      // Show success notification
      showSuccess('Véhicule supprimé avec succès !');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(`❌ ${err.message}`);
      } else {
        showError('❌ Une erreur inconnue est survenue');
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="vehicle-list">
      {/* Edit operation error */}
      {editError && (
        <div className="mb-4 p-3 bg-red-500/20 rounded text-center text-red-400">
          {editError}
        </div>
      )}

      {/* State handling (loading, error, empty) */}
      <VehicleListStates
        loading={loading}
        error={error}
        vehicles={vehicles}
      />

      {/* Vehicle list - Grid layout */}
      {vehicles && vehicles.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEditStart={startEdit}
              onDelete={handleDelete}
              editingId={editingId}
              editData={editData}
              onChangeField={onChangeField}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              saving={saving}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}
      

    </div>
  );
}