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
  onCopy: () => void;
  isLoading: boolean;
}

export const InviteFamilyModal: React.FC<InviteFamilyModalProps> = ({
  isOpen,
  onClose,
  inviteLink,
  onCopy,
  isLoading,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inviter un membre">
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          Partagez ce lien d&#39;invitation pour permettre à de nouveaux membres de rejoindre votre famille.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Instructions :
          </p>
          <ol className="text-sm text-gray-500 dark:text-gray-400 space-y-1 pl-4">
            <li>1. Copiez le lien ci-dessous</li>
            <li>2. Envoyez-le par email, message ou tout autre moyen</li>
            <li>3. Le destinataire pourra rejoindre votre famille en cliquant sur le lien</li>
          </ol>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inviteLink || 'Chargement du lien...'}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
          />
          <button
            onClick={onCopy}
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Copier
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">
            💡 Conseil : Vous pouvez également partager ce lien via vos applications de messagerie préférées pour une invitation plus rapide !
          </p>
        </div>
      </div>
    </Modal>
  );
};