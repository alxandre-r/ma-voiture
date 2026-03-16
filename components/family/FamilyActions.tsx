import React, { useState } from 'react';

import { ConfirmationModal } from '@/components/common/ui/ConfirmationModal';
import { RenameFamilyModal } from '@/components/family/RenameFamilyModal';
import { useFamilyActions } from '@/hooks/family/useFamilyActions';

import type { Family } from '@/types/family';

interface FamilyActionsProps {
  familyData: Family;
  setFamilyData: (data: Family) => void;
  userIsOwner: boolean;
}

export const FamilyActions: React.FC<FamilyActionsProps> = ({
  familyData,
  setFamilyData,
  userIsOwner,
}) => {
  const { handleRename, handleLeave, handleDelete, isLoading } = useFamilyActions(
    familyData,
    setFamilyData,
  );

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  return (
    <div className="mt-6 flex gap-3">
      {/* Owner actions */}
      {userIsOwner && (
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
            className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Supprimer la famille
          </button>
        </>
      )}

      {/* Member leave */}
      {!userIsOwner && (
        <button
          onClick={() => setIsLeaveModalOpen(true)}
          disabled={isLoading}
          className={`px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Quitter la famille
        </button>
      )}

      {/* ---------------- MODALS ---------------- */}

      <RenameFamilyModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={async (newName) => {
          await handleRename(newName);
          setIsRenameModalOpen(false);
        }}
        currentName={familyData.name}
        isLoading={isLoading}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          await handleDelete();
          setIsDeleteModalOpen(false);
        }}
        title="Supprimer la famille"
        message="Êtes-vous sûr de vouloir supprimer cette famille ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
        isLoading={isLoading}
      />

      <ConfirmationModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={async () => {
          await handleLeave();
          setIsLeaveModalOpen(false);
        }}
        title="Quitter la famille"
        message="Êtes-vous sûr de vouloir quitter cette famille ?"
        confirmText="Quitter"
        cancelText="Annuler"
        confirmButtonColor="red"
        isLoading={isLoading}
      />
    </div>
  );
};
