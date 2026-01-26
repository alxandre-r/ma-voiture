/**
 * @file components/vehicle/VehicleListPersonal.tsx
 * @fileoverview Personal vehicles list component.
 * 
 * This component displays only the user's personal vehicles with full CRUD capabilities.
 */

'use client';

import React, { useState } from 'react';
import { useVehicles } from '@/contexts/VehicleContext';
import { useNotifications } from '@/contexts/NotificationContext';
import VehicleCard from './VehicleCard';
import VehicleListStates from './VehicleListStates';

/**
 * Vehicle type definition for personal vehicles.
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

interface VehicleListPersonalProps {
  vehicles: Vehicle[];
}

/**
 * VehicleListPersonal Component
 * 
 * Displays user's personal vehicles with edit/delete functionality.
 */
export default function VehicleListPersonal({ vehicles }: VehicleListPersonalProps): React.ReactElement {
  const {
    loading,
    error,
    refreshVehicles,
  } = useVehicles();
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Vehicle> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Notification context
  const { showSuccess, showError } = useNotifications();

  /**
   * Initialize editing for a vehicle.
   */
  function startEdit(v: Vehicle) {
    setEditingId(v.id);
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
   */
  async function saveEdit(id: string) {
    if (!editData) return;
    setSaving(true);
    try {
      const res = await fetch('/api/vehicles/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editData }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      refreshVehicles();
      showSuccess('Véhicule modifié avec succès !');
      cancelEdit();
    } catch (err) {
      setEditError((err as Error).message || 'Save failed');
      showError((err as Error).message || 'Échec de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  /**
   * Handle field changes in edit form.
   */
  function onChangeField(key: string, value: unknown) {
    setEditData((prev) => ({ ...(prev ?? {}), [key]: value }));
  }

  /**
   * Delete a vehicle after confirmation.
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
      refreshVehicles();
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
    <div className="personal-vehicles-section">
      {/* Edit operation error */}
      {editError && (
        <div className="mb-4 p-3 bg-red-500/20 dark:bg-red-900/30 rounded text-center text-red-400 dark:text-red-300">
          {editError}
        </div>
      )}

      {/* State handling (loading, error, empty) */}
      <VehicleListStates
        loading={loading}
        error={error}
        vehicles={vehicles}
      />

      {/* Personal vehicle list - Grid layout */}
      {vehicles && vehicles.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {vehicles.map((vehicle, index) => {
            // Debug: Ensure we have unique keys
            const vehicleKey = vehicle.id || `vehicle-${index}`;
            console.log(`Vehicle ${index}: ID=${vehicle.id}, Key=${vehicleKey}`);
            
            return (
              <VehicleCard
                key={vehicleKey}
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
            );
          })}
        </div>
      )}
    </div>
  );
}