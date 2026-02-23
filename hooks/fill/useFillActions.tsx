// hooks/useFillActions.ts
import { useState } from 'react';
import { Fill, FillFormData } from '@/types/fill';
import { useNotifications } from '@/contexts/NotificationContext';

export function useFillActions() {
  const { showSuccess, showError } = useNotifications();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<FillFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [onRefresh, setOnRefresh] = useState<(() => void) | null>(null);

  /** --- Set refresh callback --- */
  const setRefreshCallback = (callback: () => void) => {
    setOnRefresh(() => callback);
  };

  /** --- Trigger refresh after successful operations --- */
  const triggerRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  /** --- Start editing a fill --- */
  const startEdit = (fill: Fill) => {
    setEditingId(fill.id ?? null);
    setEditData({
      vehicle_id: fill.vehicle_id,
      date: fill.date,
      odometer: fill.odometer,
      liters: fill.liters,
      amount: fill.amount,
      price_per_liter: fill.price_per_liter,
      notes: fill.notes ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  /** --- Auto-calculations for liters/price/amount --- */
  const calculateFillValues = (data: Partial<FillFormData>): FillFormData => {
    const liters = data.liters ?? editData?.liters ?? 0;
    const amount = data.amount ?? editData?.amount ?? 0;
    const pricePerLiter = data.price_per_liter ?? editData?.price_per_liter ?? 0;

    const result: FillFormData = {
      vehicle_id: data.vehicle_id ?? editData?.vehicle_id ?? 0,
      date: data.date ?? editData?.date ?? new Date().toISOString().split('T')[0],
      odometer: data.odometer ?? editData?.odometer ?? 0,
      liters: liters,
      amount: amount,
      price_per_liter: pricePerLiter,
      notes: data.notes ?? editData?.notes ?? '',
    };

    // Auto-calculate missing values
    if (result.amount && result.liters && result.liters > 0) {
      result.price_per_liter = Number((result.amount / result.liters).toFixed(3));
    }
    else if (result.amount && result.price_per_liter && result.price_per_liter > 0) {
      result.liters = Number((result.amount / result.price_per_liter).toFixed(2));
    }

    return result;
  };

  /** --- Validate fill data --- */
  const validateFillData = (data: FillFormData): boolean => {
    if (!data.vehicle_id || data.vehicle_id === 0) {
      showError('Veuillez sélectionner un véhicule');
      return false;
    }
    if (!data.date) {
      showError('Veuillez entrer une date');
      return false;
    }
    if (!data.amount) {
      showError('Veuillez entrer le montant total');
      return false;
    }
    if (!data.liters && !data.price_per_liter) {
      showError('Veuillez entrer soit les litres, soit le prix au litre');
      return false;
    }
    return true;
  };

  /** --- Save edited fill --- */
  const saveEdit = async (fillId: number) => {
    if (!editData) return;
    setSaving(true);

    try {
      // Validate data
      if (!validateFillData(editData)) return;

      // Convert all fields to proper types
      const payload: FillFormData = {
        vehicle_id: editData.vehicle_id,
        date: editData.date,
        odometer: Number(editData.odometer),
        liters: Number(editData.liters),
        amount: Number(editData.amount),
        price_per_liter: Number(editData.price_per_liter),
        notes: editData.notes,
      };

      // Check for NaN values
      if (
        isNaN(payload.odometer) ||
        isNaN(payload.liters) ||
        isNaN(payload.amount) ||
        isNaN(payload.price_per_liter)
      ) {
        throw new Error('Tous les champs numériques doivent être remplis correctement.');
      }

      const res = await fetch('/api/fills/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fillId, ...payload }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erreur lors de la modification du plein');
      }
      showSuccess('Plein modifié avec succès !');
      cancelEdit();
      triggerRefresh();
      return true;
    } catch (err) {
      if (err instanceof Error) showError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /** --- Add new fill --- */
  const addFill = async (fillData: FillFormData) => {
    setAdding(true);

    try {
      // Validate data
      if (!validateFillData(fillData)) return false;

      const payload = {
        vehicle_id: fillData.vehicle_id,
        owner: '',
        date: fillData.date,
        odometer: fillData.odometer ? parseInt(fillData.odometer.toString(), 10) : null,
        liters: fillData.liters ? fillData.liters : null,
        amount: fillData.amount ? fillData.amount : null,
        price_per_liter: fillData.price_per_liter ? fillData.price_per_liter : null,
        notes: fillData.notes || null,
        created_at: new Date().toISOString()
      };

      const res = await fetch('/api/fills/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout du plein');
      }
      showSuccess('Plein ajouté avec succès');
      return true;
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      return false;
    } finally {
      setAdding(false);
    }
  };

  /** --- Delete fill --- */
  const requestDelete = (fillId: number) => {
    setDeletingId(fillId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return false;

    try {
      const res = await fetch('/api/fills/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fillId: deletingId }),
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression du plein');

      showSuccess('Plein supprimé avec succès !');
      triggerRefresh();
      return true;
    } catch (err) {
      if (err instanceof Error) showError(err.message);
      return false;
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(false);
    }
  };

  /** --- Handle field changes with auto-calculations --- */
  const handleFieldChange = (key: string, value: unknown) => {
    if (!editData) return;
    
    const newData = { ...editData, [key]: value };
    const calculatedData = calculateFillValues(newData);
    setEditData(calculatedData);
  };

  return {
    editingId,
    editData,
    saving,
    adding,
    deletingId,
    showDeleteConfirm,
    setEditData,
    startEdit,
    cancelEdit,
    saveEdit,
    addFill,
    requestDelete,
    confirmDelete,
    setShowDeleteConfirm,
    calculateFillValues,
    validateFillData,
    handleFieldChange,
    setRefreshCallback,
  };
}