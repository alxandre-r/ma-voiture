'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { useNotifications } from '@/contexts/NotificationContext';

import type { ReminderFormData } from '@/types/reminder';

export function useReminderActions() {
  const router = useRouter();
  const { showSuccess, showError } = useNotifications();

  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const createReminder = useCallback(
    async (data: ReminderFormData): Promise<boolean> => {
      setCreating(true);
      try {
        const res = await fetch('/api/reminders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? 'Erreur lors de la création du rappel');
        }

        showSuccess('Rappel créé avec succès !');
        router.refresh();
        return true;
      } catch (err) {
        if (err instanceof Error) showError(err.message);
        return false;
      } finally {
        setCreating(false);
      }
    },
    [router, showError, showSuccess],
  );

  const updateReminder = useCallback(
    async (id: number, data: Partial<ReminderFormData>): Promise<boolean> => {
      setSaving(true);
      try {
        const res = await fetch('/api/reminders/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? 'Erreur lors de la mise à jour du rappel');
        }

        showSuccess('Rappel modifié avec succès !');
        router.refresh();
        return true;
      } catch (err) {
        if (err instanceof Error) showError(err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [router, showError, showSuccess],
  );

  const deleteReminder = useCallback(
    async (id: number): Promise<boolean> => {
      setDeletingId(id);
      try {
        const res = await fetch('/api/reminders/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? 'Erreur lors de la suppression du rappel');
        }

        showSuccess('Rappel supprimé avec succès !');
        router.refresh();
        return true;
      } catch (err) {
        if (err instanceof Error) showError(err.message);
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [router, showError, showSuccess],
  );

  const completeReminder = useCallback(
    async (id: number, is_completed: boolean): Promise<boolean> => {
      setCompletingId(id);
      try {
        const res = await fetch('/api/reminders/complete', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, is_completed }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? 'Erreur lors de la mise à jour du rappel');
        }

        showSuccess(is_completed ? 'Rappel marqué comme fait !' : 'Rappel réactivé !');
        router.refresh();
        return true;
      } catch (err) {
        if (err instanceof Error) showError(err.message);
        return false;
      } finally {
        setCompletingId(null);
      }
    },
    [router, showError, showSuccess],
  );

  return {
    creating,
    saving,
    deletingId,
    completingId,
    createReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
  };
}
