// hooks/expense/useExpenseActions.ts
import { useState } from 'react';

import { useNotifications } from '@/contexts/NotificationContext';

import type { Expense, ExpenseFormData } from '@/types/expense';

export function useExpenseActions() {
  const { showSuccess, showError } = useNotifications();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
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

  /** --- Start editing an expense --- */
  const startEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const cancelEditExpense = () => {
    setEditingExpense(null);
  };

  /** --- Validate expense data --- */
  const validateExpenseData = (data: Partial<ExpenseFormData>): boolean => {
    if (!data.vehicle_id || data.vehicle_id === 0) {
      showError('Veuillez sélectionner un véhicule');
      return false;
    }
    if (!data.date) {
      showError('Veuillez entrer une date');
      return false;
    }
    if (!data.amount && data.amount !== 0) {
      showError('Veuillez entrer le montant');
      return false;
    }
    return true;
  };

  /** --- Save edited expense --- */
  const saveExpense = async (
    expenseId: number,
    data: Partial<ExpenseFormData>,
  ): Promise<boolean> => {
    if (!validateExpenseData(data)) {
      return false;
    }

    setSaving(true);
    try {
      // Prepare payload based on expense type
      const payload: Record<string, unknown> = {
        vehicle_id: data.vehicle_id,
        date: data.date,
        amount: Number(data.amount),
        notes: data.notes || null,
      };

      // Add type-specific fields
      if (data.type === 'maintenance') {
        payload.maintenance_type = data.maintenance_type || null;
        payload.odometer = data.odometer ? Number(data.odometer) : null;
        payload.garage = data.garage || null;
      } else if (data.type === 'other') {
        payload.label = data.label || null;
      } else if (data.type === 'fuel' || data.type === 'electric_charge') {
        // Also update fill-specific fields
        payload.odometer = data.odometer ? Number(data.odometer) : null;

        // For fuel expenses - update fills table
        if (data.type === 'fuel') {
          payload.liters = data.liters ?? null;
          payload.price_per_liter = data.price_per_liter ?? null;
        }

        // For electric_charge expenses - update fills table
        if (data.type === 'electric_charge') {
          payload.kwh = data.kwh ?? null;
          payload.price_per_kwh = data.price_per_kwh ?? null;
        }
      }

      const res = await fetch('/api/expenses/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: expenseId, ...payload }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erreur lors de la modification de la dépense');
      }

      showSuccess('Dépense modifiée avec succès !');
      cancelEditExpense();
      triggerRefresh();
      return true;
    } catch (err) {
      if (err instanceof Error) showError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /** --- Delete an expense --- */
  const deleteExpense = async (expenseId: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/expenses/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenseId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erreur lors de la suppression de la dépense');
      }

      showSuccess('Dépense supprimée avec succès !');
      triggerRefresh();
      return true;
    } catch (err) {
      if (err instanceof Error) showError(err.message);
      return false;
    }
  };

  return {
    editingExpense,
    saving,
    setEditingExpense,
    startEditExpense,
    cancelEditExpense,
    saveExpense,
    deleteExpense,
    setRefreshCallback,
  };
}
