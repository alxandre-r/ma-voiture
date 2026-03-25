// hooks/maintenance/useMaintenanceActions.ts
import { useState, useCallback, useRef } from 'react';

import { useNotifications } from '@/contexts/NotificationContext';

export interface MaintenanceFormData {
  vehicle_id: number;
  date: string;
  amount: number;
  notes?: string;
  maintenance_type?: string;
  odometer?: number;
  garage?: string;
}

export function useMaintenanceActions() {
  const { showSuccess, showError } = useNotifications();

  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const refreshCallbackRef = useRef<(() => void) | null>(null);

  /** --- Set refresh callback --- */
  const setRefreshCallback = useCallback((callback: () => void) => {
    refreshCallbackRef.current = callback;
  }, []);

  /** --- Trigger refresh after successful operations --- */
  const triggerRefresh = useCallback(() => {
    if (refreshCallbackRef.current) {
      refreshCallbackRef.current();
    }
  }, []);

  /** --- Validate maintenance data --- */
  const validateMaintenanceData = (data: MaintenanceFormData): boolean => {
    if (!data.vehicle_id || data.vehicle_id === 0) {
      showError('Veuillez sélectionner un véhicule');
      return false;
    }
    if (!data.date) {
      showError('Veuillez entrer une date');
      return false;
    }
    if (data.amount === undefined || data.amount === null || data.amount <= 0) {
      showError('Veuillez entrer un montant valide');
      return false;
    }
    return true;
  };

  /** --- Add new maintenance --- */
  const addMaintenance = async (data: MaintenanceFormData): Promise<boolean> => {
    if (!validateMaintenanceData(data)) {
      return false;
    }

    setAdding(true);
    try {
      const payload = {
        vehicle_id: data.vehicle_id,
        date: data.date,
        amount: Number(data.amount),
        notes: data.notes || null,
        maintenance_type: data.maintenance_type || 'other',
        odometer: data.odometer ? Number(data.odometer) : null,
        garage: data.garage || null,
      };

      const res = await fetch('/api/maintenance/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Erreur lors de l'ajout de l'entretien");
      }

      showSuccess('Entretien ajouté avec succès !');
      triggerRefresh();
      return true;
    } catch (err) {
      if (err instanceof Error) showError(err.message);
      return false;
    } finally {
      setAdding(false);
    }
  };

  /** --- Update maintenance --- */
  const updateMaintenance = async (
    expenseId: number,
    data: Partial<MaintenanceFormData>,
  ): Promise<boolean> => {
    if (!data.vehicle_id || !data.date || data.amount === undefined) {
      showError('Veuillez remplir tous les champs requis');
      return false;
    }

    setSaving(true);
    try {
      // Use the existing expenses update endpoint
      const payload = {
        id: expenseId,
        vehicle_id: data.vehicle_id,
        date: data.date,
        amount: Number(data.amount),
        notes: data.notes || null,
        type: 'maintenance',
        maintenance_type: data.maintenance_type || null,
        odometer: data.odometer ? Number(data.odometer) : null,
        garage: data.garage || null,
      };

      const res = await fetch('/api/expenses/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Erreur lors de la modification de l'entretien");
      }

      showSuccess('Entretien modifié avec succès !');
      triggerRefresh();
      return true;
    } catch (err) {
      if (err instanceof Error) showError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /** --- Delete maintenance --- */
  const deleteMaintenance = async (expenseId: number): Promise<boolean> => {
    setDeletingId(expenseId);
    try {
      const res = await fetch('/api/maintenance/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenseId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Erreur lors de la suppression de l'entretien");
      }

      showSuccess('Entretien supprimé avec succès !');
      triggerRefresh();
      return true;
    } catch (err) {
      if (err instanceof Error) showError(err.message);
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  return {
    saving,
    adding,
    deletingId,
    setRefreshCallback,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
  };
}
