'use client';

import React, { useState, useEffect, useRef } from 'react';

import { FamilyMemberList } from '@/components/family/FamilyMemberList';
import { InviteFamilyModal } from '@/components/family/InviteFamilyModal';
import { RenameFamilyModal } from '@/components/family/RenameFamilyModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useNotifications } from '@/contexts/NotificationContext';
import { useFamilyActions } from '@/hooks/family/useFamilyActions';

import type { Family } from '@/types/family';
import type { User } from '@/types/user';

export default function FamilyClient({ user, family }: { user: User; family: Family }) {
  const [familyData, setFamilyData] = useState(family);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [userIsOwner, setUserIsOwner] = useState(false);
  const [origin, setOrigin] = useState('');
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const { showNotification } = useNotifications();

  // ----------------------- useFamilyActions Hook -----------------------
  const { handleRename, handleLeave, handleDelete } = useFamilyActions(familyData, setFamilyData);

  // ----------------------- Settings menu click outside -----------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };

    if (isSettingsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsMenuOpen]);

  // Set the current user's role (owner/member) based on family data
  useEffect(() => {
    if (familyData && user) {
      setUserIsOwner(familyData.owner_id === user.id);
    }
  }, [familyData, user]);

  // Set the origin for client-side only
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {familyData.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Vous partagez vos véhicules et l&apos;historique de vos trajets avec votre famille
          </p>
        </div>

        {/* Settings Menu */}
        <div className="relative" ref={settingsMenuRef}>
          <button
            onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
            className="py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-200 dark:focus:bg-gray-700 hover:cursor-pointer"
          >
            <span className="sr-only">Paramètres</span>
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          <div
            className={`absolute right-0 p-2 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-300 dark:border-gray-700 z-50 transition-all duration-300 transform ${isSettingsMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-1'}`}
          >
            <div className="py-1">
              {userIsOwner && (
                <button
                  onClick={() => setIsRenameModalOpen(true)}
                  className="w-full rounded-md text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 hover:cursor-pointer"
                >
                  Renommer la famille
                </button>
              )}
              {userIsOwner && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full rounded-md text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 hover:cursor-pointer"
                >
                  Supprimer la famille
                </button>
              )}
              {!userIsOwner && (
                <button
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="w-full rounded-md text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 hover:cursor-pointer"
                >
                  Quitter la famille
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Family Members */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl p-6 font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700">
          Membres de la famille
        </h2>
        <div className="p-6">
          {user && (
            <FamilyMemberList
              familyId={familyData.id}
              currentUserId={user.id}
              currentUserRole={userIsOwner ? 'owner' : 'member'}
            />
          )}

          <div className="mt-6">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="w-full bg-orange-50 dark:bg-orange-600/20 hover:bg-orange-100 dark:hover:bg-orange-600/30 text-custom-2 dark:text-custom-2-dark font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none hover:cursor-pointer"
            >
              Inviter un membre
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RenameFamilyModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={handleRename}
        currentName={familyData.name}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer la famille"
        message="Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
      />

      <ConfirmationModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeave}
        title="Quitter la famille"
        message="Vous perdrez l'accès aux véhicules et aux données partagées."
        confirmText="Quitter"
        cancelText="Annuler"
        confirmButtonColor="red"
      />

      <InviteFamilyModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        inviteLink={`${origin}/family/join?token=${familyData.invite_token || ''}`}
        inviteCode={familyData.invite_token || ''}
        onCopyLink={() => {
          navigator.clipboard.writeText(
            `${origin}/family/join?token=${familyData.invite_token || ''}`,
          );
          showNotification('Lien copié !', 'success');
        }}
        onCopyCode={() => {
          navigator.clipboard.writeText(familyData.invite_token || '');
          showNotification('Code copié !', 'success');
        }}
        isLoading={!familyData.invite_token}
      />
    </div>
  );
}
