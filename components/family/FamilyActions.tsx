import React, { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { RenameFamilyModal } from '@/components/family/RenameFamilyModal';

interface FamilyActionsProps {
  familyId: string;
  familyName: string;
  currentUserRole: string;
  onFamilyUpdated?: () => void;
  onFamilyLeft?: () => void;
  onFamilyDeleted?: () => void;
}

export const FamilyActions: React.FC<FamilyActionsProps> = ({
  familyId,
  familyName,
  currentUserRole,
  onFamilyUpdated,
  onFamilyLeft,
  onFamilyDeleted,
}) => {
  const { updateFamily, leaveFamily, deleteFamily } = useFamily();
  const { showNotification } = useNotifications();
  const router = useRouter();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isOwnerLeaveErrorOpen, setIsOwnerLeaveErrorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRename = async (newName: string) => {
    if (!newName.trim()) {
      showNotification('Le nom de la famille ne peut pas être vide', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateFamily(familyId, newName);
      if (result) {
        showNotification('Famille renommée avec succès', 'success');
        if (onFamilyUpdated) onFamilyUpdated();
      }
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Erreur lors du renommage de la famille',
        'error'
      );
    } finally {
      setIsLoading(false);
      setIsRenameModalOpen(false);
    }
  };

  const handleLeave = async () => {
    setIsLoading(true);
    try {
      const success = await leaveFamily(familyId);
      if (success) {
        showNotification('Vous avez quitté la famille avec succès', 'success');
        if (onFamilyLeft) onFamilyLeft();
        router.refresh();
      }
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Erreur lors de la sortie de la famille',
        'error'
      );
    } finally {
      setIsLoading(false);
      setIsLeaveModalOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const success = await deleteFamily(familyId);
      if (success) {
        showNotification('Famille supprimée avec succès', 'success');
        if (onFamilyDeleted) onFamilyDeleted();
        router.refresh();
      }
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Erreur lors de la suppression de la famille',
        'error'
      );
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="mt-6 flex gap-3">
      {/* Owner actions */}
      {currentUserRole === 'owner' && (
        <>
          <button
            onClick={() => setIsRenameModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Renommer la famille
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isLoading}
            className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Supprimer la famille
          </button>
        </>
      )}

      {/* Member actions */}
      {currentUserRole === 'member' && (
        <button
          onClick={() => setIsLeaveModalOpen(true)}
          disabled={isLoading}
          className={`px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Quitter la famille
        </button>
      )}

      {/* Owner leave action - shows error modal */}
      {currentUserRole === 'owner' && (
        <button
          onClick={() => setIsOwnerLeaveErrorOpen(true)}
          disabled={isLoading}
          className={`px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Quitter la famille
        </button>
      )}

      {/* Rename Modal */}
      <RenameFamilyModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={handleRename}
        currentName={familyName}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer la famille"
        message="Êtes-vous sûr de vouloir supprimer cette famille ? Cette action est irréversible et supprimera tous les membres de la famille."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
        isLoading={isLoading}
      />

      {/* Leave Confirmation Modal */}
      <ConfirmationModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeave}
        title="Quitter la famille"
        message="Êtes-vous sûr de vouloir quitter cette famille ? Vous perdrez l'accès aux véhicules et aux données partagées par les autres membres."
        confirmText="Quitter"
        cancelText="Annuler"
        confirmButtonColor="orange"
        isLoading={isLoading}
      />

      {/* Owner Leave Error Modal */}
      <ConfirmationModal
        isOpen={isOwnerLeaveErrorOpen}
        onClose={() => setIsOwnerLeaveErrorOpen(false)}
        onConfirm={() => setIsOwnerLeaveErrorOpen(false)}
        title="Action impossible"
        message="En tant que propriétaire, vous ne pouvez pas quitter la famille directement. Vous devez d'abord transférer votre rôle de propriétaire à un autre membre de la famille, puis vous pourrez quitter la famille."
        confirmText="Compris"
        cancelText={null}
        confirmButtonColor="blue"
        isLoading={isLoading}
      />
    </div>
  );
};