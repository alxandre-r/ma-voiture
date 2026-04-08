'use client';

/**
 * @file FamilyPageHeader.tsx
 * @fileoverview En-tête de la page famille avec le bouton "Rejoindre une autre famille".
 */

import { useState } from 'react';

import { JoinOrCreateFamilyModal } from './JoinOrCreateFamilyModal';

export function FamilyPageHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center md:justify-end gap-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-custom-2 hover:bg-custom-2-hover text-white font-semibold rounded-xl transition-colors shadow-lg shadow-custom-2/20 cursor-pointer whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Rejoindre une nouvelle famille
        </button>
      </div>

      <JoinOrCreateFamilyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
