'use client';

/**
 * @file FamilyInfoUI.tsx
 * @fileoverview Client component for displaying family info with interactive elements.
 * Uses useFamilyActions hook for consistent action handling.
 */
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect, useCallback } from 'react';

import { ConfirmationModal } from '@/components/common/ui/ConfirmationModal';
import Icon from '@/components/common/ui/Icon';

import { useFamilyActions } from '../hooks/useFamilyActions';

import { InviteFamilyModal } from './modals/InviteFamilyModal';
import { RenameFamilyModal } from './modals/RenameFamilyModal';

import type { Family } from '@/types/family';

interface FamilyInfoUIProps {
  family: Family;
  isOwner: boolean;
}

export function FamilyInfoUI({ family, isOwner }: FamilyInfoUIProps) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [origin, setOrigin] = useState('');
  const settingsRef = useRef<HTMLDivElement>(null);

  // Use the family actions hook
  const { isLoading, handleRename, handleLeave, handleDelete, copyInviteLink, copyInviteCode } =
    useFamilyActions(family.id);

  // Handle successful operations - refresh router
  const handleSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  // Wrapper handlers that call hook and refresh on success
  const handleRenameWithRefresh = async (newName: string) => {
    await handleRename(newName);
    handleSuccess();
  };

  const handleLeaveWithRefresh = async () => {
    await handleLeave();
    handleSuccess();
  };

  const handleDeleteWithRefresh = async () => {
    await handleDelete();
    handleSuccess();
  };

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Click outside handler for settings menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  return (
    <>
      {/* Page Title & Invite Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:justify-between">
        <div className="md:flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-custom-2 dark:text-gray-100 tracking-tight flex items-center gap-2 justify-center md:justify-start">
            {family.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Vous partagez vos véhicules et l&apos;historique de vos trajets avec votre famille
          </p>
        </div>

        {/* Invite & Settings */}
        <div className="flex items-center gap-2 justify-end">
          {isOwner && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-2 bg-custom-1 text-white font-semibold rounded-xl hover:bg-custom-1/90 transition-all shadow-lg shadow-custom-1/20 cursor-pointer whitespace-nowrap h-[44px]"
            >
              Inviter
            </button>
          )}

          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors items-center justify-center flex cursor-pointer h-[44px] w-[44px]"
              aria-label="Paramètres"
            >
              <Icon name="settings" size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
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
        onRename={handleRenameWithRefresh}
        currentName={family.name}
        isLoading={isLoading}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteWithRefresh}
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
        onConfirm={handleLeaveWithRefresh}
        title="Quitter la famille"
        message="Êtes-vous sûr de vouloir quitter la famille ?"
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
