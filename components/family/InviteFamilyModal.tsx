/**
 * @file components/family/InviteFamilyModal.tsx
 * @fileoverview Invite family member modal component.
 *
 * This component provides a modal for inviting new members to the family by sharing an invitation link.
 */

'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';

interface InviteFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteLink: string;
  inviteCode: string;
  onCopy: () => void;
  isLoading: boolean;
}

export const InviteFamilyModal: React.FC<InviteFamilyModalProps> = ({
  isOpen,
  onClose,
  inviteLink,
  inviteCode,
  onCopy,
  isLoading,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inviter un membre">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Partagez ce lien d&#39;invitation pour permettre à de nouveaux membres de rejoindre votre famille :
        </p>

        <div className="flex pb-4 gap-2">
          <input
            type="text"
            value={inviteLink || 'Chargement du lien...'}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
          />
          <button
            onClick={onCopy}
            disabled={isLoading}
            className={`px-4 py-2 bg-custom-1 text-white rounded-md hover:bg-custom-1-hover hover:cursor-pointer transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Copier
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Vous pouvez aussi communiquer ce code à rentrer manuellement par l'invité :
        </p>
        <div className="flex pb-4 gap-2">
          <input
            type="text"
            value={inviteCode || 'Chargement du code...'}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
          />
          <button
            onClick={onCopy}
            disabled={isLoading}
            className={`px-4 py-2 bg-custom-1 text-white rounded-md hover:bg-custom-1-hover hover:cursor-pointer transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Copier
          </button>
        </div>
      </div>
    </Modal>
  );
};