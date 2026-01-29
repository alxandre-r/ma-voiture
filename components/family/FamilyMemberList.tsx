/**
 * @file components/family/FamilyMemberList.tsx
 * @fileoverview Family member list component with actions for managing family members.
 *
 * This component displays all family members with options to remove members (for owners).
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useNotifications } from '@/contexts/NotificationContext';

interface FamilyMember {
  user_id: string;
  full_name: string;
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
  familyId,
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

  const fetchMembers = async () => {
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
  };

  useEffect(() => {
    fetchMembers();
  }, []);

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
        'error'
      );
    } finally {
      setIsRemoving(false);
      setShowRemoveConfirm(false);
      setMemberToRemove(null);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Propriétaire';
      case 'member': return 'Membre';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600 dark:text-gray-300">Chargement des membres...</p>
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
          <p className="text-sm">Commencez par inviter des membres en utilisant le bouton ci-dessous.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <div 
              key={member.user_id}
              className={`p-4 rounded-lg shadow-xs border border-gray-200 dark:border-gray-600 ${member.user_id === currentUserId ? 'border-violet-300/30 dark:border-violet-500/50' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
          {/* Left: Avatar */}
          <div className="hidden lg:flex w-10 h-10 bg-violet-100 dark:bg-violet-600/50 rounded-full flex items-center justify-center text-violet-800/70 dark:text-violet-200 font-medium text-sm flex-shrink-0">
            {member.full_name ? member.full_name.charAt(0).toUpperCase() : '?'}
          </div>

          {/* Center: Content (2 rows) */}
          <div className="flex-1 min-w-0">
            {/* Row 1: Name + You badge | Role */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
            {member.full_name || member.email || 'Membre inconnu'}
                </p>
                {member.user_id === currentUserId && (
            <span className="inline-block px-2 py-0.5 bg-violet-100 text-violet-800/70 dark:bg-violet-600/50 dark:text-violet-200 text-xs rounded-full font-medium whitespace-nowrap">
              Vous
            </span>
                )}
              </div>
              <span className={`px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap ${member.role === 'owner' ? 'bg-violet-100 text-violet-800/70 dark:bg-violet-600/50 dark:text-violet-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                {getRoleLabel(member.role)}
              </span>
            </div>

            {/* Row 2: Email | Joined date */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {member.email}
              </p>
              <p className="hidden lg:flex text-xs text-gray-400 dark:text-gray-400 whitespace-nowrap">
                Rejoint le {new Date(member.joined_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Right: Delete button */}
          {currentUserRole === 'owner' && member.role !== 'owner' && member.user_id !== currentUserId && (
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  setMemberToRemove(member.user_id);
                  setShowRemoveConfirm(true);
                }}
                disabled={isRemoving}
                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                title={`Supprimer ${member.full_name || 'ce membre'} de la famille`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
              </div>
            </div>
          ))}
        </div>
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