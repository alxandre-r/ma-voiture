/**
 * @file app/(app)/family/components/members/FamilyMemberList.tsx
 * @fileoverview Family member list component with actions for managing family members.
 *
 * This component displays all family members with options to remove members (for owners).
 * Uses callback for remove action - parent handles the API call.
 */

'use client';

import React, { useState, useMemo } from 'react';

import { ConfirmationModal } from '@/components/common/ui/ConfirmationModal';
import { useNotifications } from '@/contexts/NotificationContext';

import { MemberCard } from './MemberCard';

interface FamilyMember {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  joined_at: string;
  avatar_url?: string;
}

interface FamilyMemberListProps {
  members: FamilyMember[];
  currentUserId: string;
  currentUserRole: 'owner' | 'member';
  onRemoveMember?: (userId: string) => Promise<void>;
  isRemoving?: boolean;
}

export const FamilyMemberList: React.FC<FamilyMemberListProps> = ({
  members,
  currentUserId,
  currentUserRole,
  onRemoveMember,
  isRemoving = false,
}) => {
  const { showSuccess, showError } = useNotifications();
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Sort members: current user first, then others by joined_at (memoized for performance)
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.user_id === currentUserId) return -1;
      if (b.user_id === currentUserId) return 1;
      return new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime();
    });
  }, [members, currentUserId]);

  const handleRemoveConfirm = async () => {
    if (!memberToRemove || !onRemoveMember) {
      setShowRemoveConfirm(false);
      setMemberToRemove(null);
      return;
    }

    try {
      await onRemoveMember(memberToRemove);
      showSuccess('Membre supprimé de la famille avec succès');
      setShowRemoveConfirm(false);
      setMemberToRemove(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erreur lors de la suppression du membre');
    }
  };

  if (sortedMembers.length === 0) {
    return (
      <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="mb-4">Aucun membre dans cette famille.</p>
      </div>
    );
  }

  return (
    <>
      {sortedMembers.map((member) => {
        const isCurrentUser = member.user_id === currentUserId;
        const canRemove = currentUserRole === 'owner' && member.role !== 'owner' && !isCurrentUser;

        return (
          <MemberCard
            key={member.user_id}
            member={member}
            isCurrentUser={isCurrentUser}
            canRemove={canRemove}
            onRemove={() => {
              setMemberToRemove(member.user_id);
              setShowRemoveConfirm(true);
            }}
          />
        );
      })}

      {/* Remove Member Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRemoveConfirm}
        onClose={() => {
          setShowRemoveConfirm(false);
          setMemberToRemove(null);
        }}
        onConfirm={handleRemoveConfirm}
        title="Supprimer un membre"
        message="Êtes-vous sûr de vouloir supprimer ce membre de la famille ? Cette action est irréversible et le membre perdra l'accès aux véhicules et données partagées."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
        isLoading={isRemoving}
      />
    </>
  );
};
