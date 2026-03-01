/**
 * @file components/family/FamilyMemberList.tsx
 * @fileoverview Family member list component with actions for managing family members.
 *
 * This component displays all family members with options to remove members (for owners).
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useNotifications } from '@/contexts/NotificationContext';

import { MemberCard } from './MemberCard';
import { MemberCardSkeleton } from './MemberCardSkeleton';

interface FamilyMember {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  joined_at: string;
}

interface FamilyMemberListProps {
  familyId: string;
  currentUserId: string;
  currentUserRole: string;
  onMembersUpdated?: () => void;
}

export const FamilyMemberList: React.FC<FamilyMemberListProps> = ({
  currentUserId,
  currentUserRole,
  onMembersUpdated,
}) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { showNotification } = useNotifications();

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/family/members');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des membres');
      }

      setMembers(data.members);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des membres');
      showNotification('Erreur lors de la récupération des membres de la famille', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

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
      fetchMembers();
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

  // Render skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <MemberCardSkeleton />
        <MemberCardSkeleton />
        <MemberCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-300">
        <p className="text-sm">⚠️ {error}</p>
        <button
          onClick={fetchMembers}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="mb-4">Aucun membre trouvé dans cette famille.</p>
          <p className="text-sm">
            Commencez par inviter des membres en utilisant le bouton ci-dessous.
          </p>
        </div>
      ) : (
        members.map((member) => (
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
    </div>
  );
};
