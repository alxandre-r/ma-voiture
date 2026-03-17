'use client';

import React, { useState, useEffect, useRef } from 'react';

import { ConfirmationModal } from '@/components/common/ui/ConfirmationModal';
import Icon from '@/components/common/ui/Icon';
import { FamilyMemberList } from '@/components/family/FamilyMemberList';
import { InviteFamilyModal } from '@/components/family/InviteFamilyModal';
import { RenameFamilyModal } from '@/components/family/RenameFamilyModal';
import { useNotifications } from '@/contexts/NotificationContext';
import { useFamilyActions } from '@/hooks/family/useFamilyActions';

import type { Family } from '@/types/family';
import type { User } from '@/types/user';

interface FamilyMember {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  joined_at: string;
  avatar_url?: string;
}

export default function FamilyClient({
  user,
  family,
  initialMembers = [],
}: {
  user: User;
  family: Family;
  initialMembers?: FamilyMember[];
}) {
  const [familyData, setFamilyData] = useState(family);
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [userIsOwner, setUserIsOwner] = useState(false);
  const [origin, setOrigin] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const { showNotification } = useNotifications();

  const { handleRename, handleLeave, handleDelete } = useFamilyActions(familyData, setFamilyData);

  useEffect(() => {
    if (familyData && user) {
      setUserIsOwner(familyData.owner_id === user.id);
    }
  }, [familyData, user]);

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

  // Handle members update after removal
  const handleMembersUpdated = () => {
    // Refetch members
    fetch('/api/family/members')
      .then((res) => res.json())
      .then((data) => {
        if (data.members) {
          setMembers(data.members);
        }
      })
      .catch((err) => console.error('Error refreshing members:', err));
  };

  return (
    <div>
      {/* Page Title & Invite Button - Same row on desktop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:justify-between">
        <div className="md:flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-custom-2 dark:text-gray-100 tracking-tight flex items-center gap-2 justify-center md:justify-start">
            {familyData.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Vous partagez vos véhicules et l'historique de vos trajets avec votre famille
          </p>
        </div>

        {/* Invite & Settings */}
        <div className="flex items-center gap-2 justify-end">
          {userIsOwner && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-2 bg-custom-1 text-white font-semibold rounded-xl hover:bg-custom-1/90 transition-all shadow-lg shadow-custom-1/20 cursor-pointer whitespace-nowrap h-[44px]"
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
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors 
              items-center justify-center flex cursor-pointer h-[44px] w-[44px]"
              aria-label="Paramètres"
            >
              <Icon name="settings" size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                {userIsOwner ? (
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

      {/* Family Members Grid - All cards same width */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <FamilyMemberList
          members={members}
          currentUserId={user.id}
          currentUserRole={userIsOwner ? 'owner' : 'member'}
          onMembersUpdated={handleMembersUpdated}
        />
      </div>

      {/* Info Section */}
      <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h5 className="font-bold text-gray-900 dark:text-gray-100">
              À propos des accès partagés
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Les membres de la famille peuvent consulter les véhicules de tous les membres, ainsi
              qu&apos;aux données de pleins et maintenance et les statistiques associées. Seuls les
              propriétaires des véhicules sont en mesure d&apos;ajouter des données à leur véhicule,
              mais tous les membres peuvent les consulter.
            </p>
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
        message={
          "Êtes-vous sûr de vouloir quitter la famille ? Vous perdrez l'accès aux véhicules et données partagés."
        }
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
