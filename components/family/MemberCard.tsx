'use client';

import React from 'react';

interface MemberCardProps {
  member: {
    user_id: string;
    user_name: string;
    email: string;
    role: string;
    joined_at: string;
  };
  currentUserId: string;
  currentUserRole: string;
  onRemove?: (userId: string) => void;
  isRemoving?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  currentUserId,
  currentUserRole,
  onRemove,
  isRemoving = false,
}) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Propriétaire';
      case 'member':
        return 'Membre';
      default:
        return role;
    }
  };

  const canRemove =
    currentUserRole === 'owner' && member.role !== 'owner' && member.user_id !== currentUserId;

  return (
    <div className="p-4 rounded-lg shadow-xs bg-white dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Avatar */}
        <div className="hidden lg:flex w-10 h-10 bg-violet-100 dark:bg-violet-600/50 rounded-full flex items-center justify-center text-violet-800/70 dark:text-violet-200 font-medium text-sm flex-shrink-0">
          {member.user_name ? member.user_name.charAt(0).toUpperCase() : '?'}
        </div>

        {/* Center: Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + You badge | Role */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                {member.user_name || member.email || 'Membre inconnu'}
              </p>
              {member.user_id === currentUserId && (
                <span className="inline-block px-2 py-0.5 bg-violet-100 text-violet-800/70 dark:bg-violet-600/50 dark:text-violet-200 text-xs rounded-full font-medium whitespace-nowrap">
                  Vous
                </span>
              )}
            </div>
            <span className="px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
              {getRoleLabel(member.role)}
            </span>
          </div>

          {/* Row 2: Email | Joined date */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
            <p className="hidden lg:flex text-xs text-gray-400 dark:text-gray-400 whitespace-nowrap">
              Rejoint le {new Date(member.joined_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Right: Delete button */}
        {canRemove && onRemove && (
          <div className="flex-shrink-0">
            <button
              onClick={() => onRemove(member.user_id)}
              disabled={isRemoving}
              className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
              title={`Supprimer ${member.user_name || 'ce membre'} de la famille`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
