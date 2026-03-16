/**
 * @file components/family/FamilyMemberList.tsx
 * @fileoverview Family member list component with actions for managing family members.
 *
 * This component displays all family members with options to remove members (for owners).
 */

'use client';

import React, { useState } from 'react';

import { ConfirmationModal } from '@/components/common/ui/ConfirmationModal';
import { useNotifications } from '@/contexts/NotificationContext';

import { MemberCard } from './MemberCard';
import { MemberCardSkeleton } from './MemberCardSkeleton';

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
  currentUserRole: string;
  isLoading?: boolean;
  onMembersUpdated?: () => void;
}

export const FamilyMemberList: React.FC<FamilyMemberListProps> = ({
  members,
  currentUserId,
  currentUserRole,
  isLoading = false,
  onMembersUpdated,
}) => {
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { showNotification } = useNotifications();

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);
    try {
      const response = await fetch(`/api/family/members/${memberToRemove}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression du membre');
      }

      showNotification('Membre supprimé de la famille avec succès', 'success');
      if (onMembersUpdated) onMembersUpdated();
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'Erreur lors de la suppression du membre',
        'error',
      );
    } finally {
      setIsRemoving(false);
      setShowRemoveConfirm(false);
      setMemberToRemove(null);
    }
  };

  // Render skeleton when loading
  if (isLoading) {
    return (
      <>
        <MemberCardSkeleton />
        <MemberCardSkeleton />
      </>
    );
  }

  // Sort members: current user first, then others by joined_at
  const sortedMembers = [...members].sort((a, b) => {
    if (a.user_id === currentUserId) return -1;
    if (b.user_id === currentUserId) return 1;
    return new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime();
  });

  return (
    <>
      {sortedMembers.length === 0 ? (
        <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="mb-4">Aucun membre dans cette famille.</p>
        </div>
      ) : (
        sortedMembers.map((member) => (
          <MemberCard
            key={member.user_id}
            member={member}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onRemove={(userId) => {
              setMemberToRemove(userId);
              setShowRemoveConfirm(true);
            }}
            isRemoving={isRemoving}
          />
        ))
      )}

      {/* Remove Member Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleRemoveMember}
        title="Supprimer un membre"
        message={`Êtes-vous sûr de vouloir supprimer ce membre de la famille ? Cette action est irréversible et le membre perdra l'accès aux véhicules et données partagées.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
        isLoading={isRemoving}
      />
    </>
  );
};
