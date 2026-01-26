'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FamilyForm } from '@/components/family';
import { FamilyMemberList } from '@/components/family/FamilyMemberList';
import { InviteFamilyModal } from '@/components/family/InviteFamilyModal';
import { RenameFamilyModal } from '@/components/family/RenameFamilyModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useNotifications } from '@/contexts/NotificationContext';
import { useFamily } from '@/contexts/FamilyContext';

export default function FamilyClient() {
  const [hasFamily, setHasFamily] = useState<boolean | null>(null);
  const [familyData, setFamilyData] = useState<{
    id: string;
    name: string;
    created_at: string;
    owner: string;
    userRole: string;
    invite_token?: string;
  } | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isOwnerLeaveErrorOpen, setIsOwnerLeaveErrorOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotifications();
  const { refreshFamily } = useFamily();
  const settingsMenuRef = useRef<HTMLDivElement>(null);

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

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/users/me');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération de l\'utilisateur');
      }

      setUser({ id: data.id });
    } catch (error) {
      console.error('Error fetching user data:', error);
      showNotification(error instanceof Error ? error.message : 'Erreur lors de la récupération de l\'utilisateur', 'error');
    }
  }, [showNotification]);

  const handleRename = async (newName: string) => {
    if (!newName.trim()) {
      showNotification('Le nom de la famille ne peut pas être vide', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/family/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ familyId: familyData?.id, name: newName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du renommage de la famille');
      }

      showNotification('Famille renommée avec succès', 'success');
      refreshFamily().then(() => {
        checkFamilyStatus();
      });
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Erreur lors du renommage de la famille',
        'error'
      );
    } finally {
      setIsLoading(false);
      setIsRenameModalOpen(false);
    }
  };

  const handleLeave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/family/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ familyId: familyData?.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sortie de la famille');
      }

      showNotification('Vous avez quitté la famille avec succès', 'success');
      setHasFamily(false);
      setFamilyData(null);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Erreur lors de la sortie de la famille',
        'error'
      );
    } finally {
      setIsLoading(false);
      setIsLeaveModalOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/family/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ familyId: familyData?.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression de la famille');
      }

      showNotification('Famille supprimée avec succès', 'success');
      setHasFamily(false);
      setFamilyData(null);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Erreur lors de la suppression de la famille',
        'error'
      );
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const checkFamilyStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/family/check');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la vérification de la famille');
      }

      setHasFamily(data.hasFamily);
      if (data.hasFamily) {
        setFamilyData(data.family);
      }
    } catch (error) {
      console.error('Error checking family status:', error);
      showNotification(error instanceof Error ? error.message : 'Erreur lors de la vérification de la famille', 'error');
    }
  }, [showNotification]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchUserData(),
        checkFamilyStatus()
      ]);
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchUserData, checkFamilyStatus, showNotification]);

  const handleFamilyCreated = (family: {
    id: string;
    name: string;
    created_at: string;
    owner: string;
  }) => {
    setHasFamily(true);
    setFamilyData({ ...family, userRole: 'owner' });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
      </div>
    );
  }

  if (hasFamily && familyData) {
    return (
      <div className="px-4">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Votre groupe familial : {familyData.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Vous partagez vos véhicules et l&#39;historique de vos trajets avec votre famille
            </p>
          </div>
          
          {/* Settings Button with Dropdown */}
          <div className="relative" ref={settingsMenuRef}>
            <button
              onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
              className="py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:bg-gray-200 hover:cursor-pointer"
            >
              <span className="sr-only">Paramètres</span>
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className={`absolute right-0 p-2 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 transition-all duration-300 transform ${isSettingsMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-1'}`}>
              <div className="py-1">
                {familyData.userRole === 'owner' && (
                  <button
                    onClick={() => setIsRenameModalOpen(true)}
                    className="w-full rounded-md text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 hover:cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                    </svg>
                    Renommer la famille
                  </button>
                )}
                
                {familyData.userRole === 'member' && (
                  <button
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="w-full rounded-md text-left px-4 py-2 text-sm  hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 hover:cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Quitter la famille
                  </button>
                )}
                
                {familyData.userRole === 'owner' && (
                  <>
                    <button
                      onClick={() => setIsOwnerLeaveErrorOpen(true)}
                      className="w-full rounded-md text-left px-4 py-2 text-sm  hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 hover:cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Quitter la famille
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="w-full rounded-md text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 hover:cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer la famille
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Family Members */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl p-6 font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800">
              Membres de la famille
            </h2>
            <div className="p-6">
                {user && (
                    <FamilyMemberList
                        familyId={familyData.id}
                        currentUserId={user.id}
                        currentUserRole={familyData.userRole}
                        onMembersUpdated={checkFamilyStatus}
                    />
                )}

            {/* Invite Button */}
            <div className="mt-6">
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="w-full bg-orange-50 hover:bg-orange-100 text-custom-2 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 hover:cursor-pointer"
                >
                    {/* here, add an invite icon (add.svg from /public/icons) */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
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
          isLoading={isLoading}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Supprimer la famille"
          message="Êtes-vous sûr de vouloir supprimer cette famille ? Cette action est irréversible et supprimera tous les membres de la famille."
          confirmText="Supprimer"
          cancelText="Annuler"
          confirmButtonColor="red"
          isLoading={isLoading}
        />

        <ConfirmationModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          onConfirm={handleLeave}
          title="Quitter la famille"
          message="Êtes-vous sûr de vouloir quitter cette famille ? Vous perdrez l'accès aux véhicules et aux données partagées par les autres membres."
          confirmText="Quitter"
          cancelText="Annuler"
          confirmButtonColor="neutral"
          isLoading={isLoading}
        />

        <ConfirmationModal
          isOpen={isOwnerLeaveErrorOpen}
          onClose={() => setIsOwnerLeaveErrorOpen(false)}
          onConfirm={() => setIsOwnerLeaveErrorOpen(false)}
          title="Action impossible"
          message="En tant que propriétaire, vous ne pouvez pas quitter la famille directement. Vous devez d'abord transférer votre rôle de propriétaire à un autre membre de la famille, puis vous pourrez quitter la famille."
          confirmText="Compris"
          cancelText={undefined}
          confirmButtonColor="primary"
          isLoading={isLoading}
        />

        {/* Invite Modal */}
        <InviteFamilyModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          inviteLink={`${window.location.origin}/family/join?token=${familyData.invite_token || ''}`}
          onCopy={() => {
            navigator.clipboard.writeText(`${window.location.origin}/family/join?token=${familyData.invite_token || ''}`);
            showNotification('Lien d\'invitation copié dans le presse-papiers !', 'success');
          }}
          isLoading={!familyData.invite_token}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-gray-800 dark:text-gray-200 font-medium mb-16 text-center text-2xl">
        Vous ne faites encore partie d&apos;aucune famille, rejoignez-en une ou créez-en une nouvelle.
      </h3>

      {/* Two-column layout for create and join family forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Create Family Section */}
        <div className="bg-custom-3 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-100 mb-3">Créer une famille</h4>
          <p className="text-gray-200 text-sm mb-4">
            Créez une nouvelle famille pour partager vos véhicules et votre historique avec vos proches.
          </p>

          <FamilyForm onFamilyCreated={handleFamilyCreated} />
        </div>

        {/* Join Family Section */}
        <div className="bg-custom-1 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-100 mb-3">Rejoindre une famille</h4>
          <p className="text-gray-200 text-sm mb-4">
            Vous avez reçu un code d&apos;invitation ? Utilisez-le pour rejoindre une famille existante.
          </p>

          <div className="space-y-4">
            <input
              type="text"
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white cursor-not-allowed"
              placeholder="Code d'invitation (fonctionnalité à venir)"
            />

            <button
              disabled
              className="w-full px-4 py-2 bg-white rounded-md cursor-not-allowed text-gray-400 transition-colors"
            >
              Rejoindre la famille (bientôt disponible)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}