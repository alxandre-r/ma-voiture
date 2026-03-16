'use client';

import React, { useState, useEffect } from 'react';

import { ConfirmationModal } from '@/components/common/ui/ConfirmationModal';
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
      {/* Page Title & Invite Button - Same row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:justify-between">
        <div className="md:flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-custom-2 dark:text-slate-100 tracking-tight flex items-center gap-2 justify-center md:justify-start">
            {familyData.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Vous partagez vos véhicules et l'historique de vos trajets avec votre famille
          </p>
        </div>
        {userIsOwner && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-custom-1 text-white font-semibold rounded-xl hover:bg-custom-1/90 transition-all shadow-lg shadow-custom-1/20 cursor-pointer whitespace-nowrap md:justify-start w-full md:w-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            Inviter un membre
          </button>
        )}
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
      <div className="mt-12 bg-white dark:bg-gray-800/40 p-6 rounded-2xl border border-slate-200 dark:border-white/5">
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
            <h5 className="font-bold text-slate-900 dark:text-slate-100">
              À propos des accès partagés
            </h5>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Les membres de la famille peuvent consulter les véhicules de tous les membres, ainsi
              quapos;aux données de plais et maintenance et les statistiques associées. Solo el
              propietario del véhicule está en mesure dapos;ajouter des données à son véhicule, pero
              todos los miembros pueden consultarlos.
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
        message={<span>Vous perdrez lapos;accès aux véhicules et aux données partagées.</span>}
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
