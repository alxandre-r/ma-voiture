'use client';

/**
 * @file JoinOrCreateFamilyModal.tsx
 * @fileoverview Modal pour créer ou rejoindre une famille supplémentaire.
 */

import { useState } from 'react';

import { Modal } from '@/components/common/ui/Modal';

import { AddFamilyForm } from './forms/AddFamilyForm';
import { JoinFamilyForm } from './forms/JoinFamilyForm';

interface JoinOrCreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinOrCreateFamilyModal({ isOpen, onClose }: JoinOrCreateFamilyModalProps) {
  const [tab, setTab] = useState<'join' | 'create'>('join');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Famille" size="md">
      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab('join')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            tab === 'join'
              ? 'bg-white dark:bg-gray-800 text-custom-1 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Rejoindre une famille
        </button>
        <button
          onClick={() => setTab('create')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            tab === 'create'
              ? 'bg-white dark:bg-gray-800 text-custom-2 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Créer une famille
        </button>
      </div>

      {tab === 'join' ? (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Entrez le code d&apos;invitation reçu pour rejoindre la famille.
          </p>
          <JoinFamilyForm onFamilyJoined={onClose} />
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Créez un nouvel espace familial et invitez vos proches.
          </p>
          <AddFamilyForm onFamilyCreated={onClose} />
        </div>
      )}
    </Modal>
  );
}
