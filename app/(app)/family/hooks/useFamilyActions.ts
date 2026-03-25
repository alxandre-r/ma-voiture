// hooks/useFamilyActions.ts
import { useState, useCallback } from 'react';

import { useNotifications } from '@/contexts/NotificationContext';

export interface UseFamilyActionsReturn {
  isLoading: boolean;
  handleRename: (newName: string) => Promise<void>;
  handleLeave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  copyInviteLink: (link: string) => void;
  copyInviteCode: (code: string) => void;
}

export function useFamilyActions(familyId: string | null): UseFamilyActionsReturn {
  const { showSuccess, showError } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  /** --- Rename family --- */
  const handleRename = useCallback(
    async (newName: string) => {
      if (!familyId) return;

      if (!newName.trim()) {
        showError('Le nom de la famille ne peut pas être vide');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/family/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ familyId, name: newName }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        showSuccess('Famille renommée avec succès');
      } catch (error) {
        showError(
          error instanceof Error ? error.message : 'Erreur lors du renommage de la famille',
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [familyId, showSuccess, showError],
  );

  /** --- Leave family --- */
  const handleLeave = useCallback(async () => {
    if (!familyId) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/family/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la sortie de la famille');

      showSuccess('Vous avez quitté la famille avec succès');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Erreur lors de la sortie de la famille');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [familyId, showSuccess, showError]);

  /** --- Delete family --- */
  const handleDelete = useCallback(async () => {
    if (!familyId) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/family/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Erreur lors de la suppression de la famille');

      showSuccess('Famille supprimée avec succès');
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Erreur lors de la suppression de la famille',
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [familyId, showSuccess, showError]);

  /** --- Copy invite link --- */
  const copyInviteLink = useCallback(
    (link: string) => {
      navigator.clipboard.writeText(link);
      showSuccess('Lien copié !');
    },
    [showSuccess],
  );

  /** --- Copy invite code --- */
  const copyInviteCode = useCallback(
    (code: string) => {
      navigator.clipboard.writeText(code);
      showSuccess('Code copié !');
    },
    [showSuccess],
  );

  return {
    isLoading,
    handleRename,
    handleLeave,
    handleDelete,
    copyInviteLink,
    copyInviteCode,
  };
}
