'use client';

/**
 * @file FamilyCardHeader.tsx
 * @fileoverview Header d'une carte famille avec actions (invite, rename, leave/delete).
 * Version card-style de FamilyInfoUI, adaptée au multi-famille.
 */

import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect, useCallback } from 'react';

import { ConfirmationModal } from '@/components/common/ui/ConfirmationModal';
import Icon from '@/components/common/ui/Icon';

import { useFamilyActions } from '../hooks/useFamilyActions';

import { InviteFamilyModal } from './modals/InviteFamilyModal';
import { RenameFamilyModal } from './modals/RenameFamilyModal';

import type { Family } from '@/types/family';

interface FamilyCardHeaderProps {
  family: Family;
  isOwner: boolean;
  memberCount: number;
}

export function FamilyCardHeader({ family, isOwner, memberCount }: FamilyCardHeaderProps) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [origin, setOrigin] = useState('');
  const settingsRef = useRef<HTMLDivElement>(null);

  const { isLoading, handleRename, handleLeave, handleDelete, copyInviteLink, copyInviteCode } =
    useFamilyActions(family.id);

  const handleSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen]);

  return (
    <>
      <div className="flex items-center justify-between">
        {/* Nom + nb membres */}
        <div className="flex items-center gap-3">
          <div className="p-2 flex items-center justify-center">
            <Icon name="family" size={24} className="text-custom-1 opacity-70" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{family.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {memberCount} {memberCount === 1 ? 'membre' : 'membres'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-custom-1 border border-custom-1/30 bg-custom-1/5 hover:bg-custom-1/10 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Inviter
            </button>
          )}

          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 transition-colors cursor-pointer
              border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600
              flex items-center justify-center 
              "
              aria-label="Paramètres"
            >
              <Icon name="settings" size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            {isSettingsOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setIsRenameModalOpen(true);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <Icon name="edit" size={16} className="text-gray-500" />
                      Renommer
                    </button>
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setIsDeleteModalOpen(true);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    >
                      <Icon name="delete" size={16} />
                      Supprimer la famille
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsLeaveModalOpen(true);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                  >
                    <Icon name="delete" size={16} />
                    Quitter la famille
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RenameFamilyModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={async (name) => {
          await handleRename(name);
          handleSuccess();
        }}
        currentName={family.name}
        isLoading={isLoading}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          await handleDelete();
          handleSuccess();
        }}
        title="Supprimer la famille"
        message="Cette action est irréversible."
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
          handleSuccess();
        }}
        title="Quitter la famille"
        message="Êtes-vous sûr de vouloir quitter cette famille ?"
        confirmText="Quitter"
        cancelText="Annuler"
        confirmButtonColor="red"
        isLoading={isLoading}
      />

      <InviteFamilyModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        inviteLink={`${origin}/family/join?token=${family.invite_token || ''}`}
        inviteCode={family.invite_token || ''}
        onCopyLink={() =>
          copyInviteLink(`${origin}/family/join?token=${family.invite_token || ''}`)
        }
        onCopyCode={() => copyInviteCode(family.invite_token || '')}
        isLoading={!family.invite_token || isLoading}
      />
    </>
  );
}
