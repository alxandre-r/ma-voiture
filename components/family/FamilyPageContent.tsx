/**
 * @file components/family/FamilyPageContent.tsx
 * @fileoverview Modern family page with clean UI and user-friendly actions.
 * 
 * This component provides a simplified and intuitive interface for family management:
 * - Family name as title
 * - Action menu with dropdown for family management
 * - Clean member list display
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import Icon from '@/components/ui/Icon';

/**
 * FamilyPageContent Component
 * 
 * Modern family management interface with dropdown actions and clean member list.
 */
export const FamilyPageContent: React.FC = () => {
  const {
    currentFamily,
    familyMembers,
    currentFamilyRole,
    isLoading,
    leaveFamily,
    deleteFamily,
    updateFamily,
    generateInviteCode,
    loadFamilyDetails,
    createFamily,
    joinFamily
  } = useFamily();
  
  const { showSuccess, showError } = useNotifications();

  // Local state
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [editingFamilyName, setEditingFamilyName] = useState('');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  useEffect(() => {
    if (currentFamily) {
      loadFamilyDetails(currentFamily.id);
    }
  }, [currentFamily, loadFamilyDetails]);

  const handleGenerateInviteLink = async () => {
    if (!currentFamily) return;
    
    try {
      const code = await generateInviteCode(currentFamily.id);
      if (code) {
        const baseUrl = window.location.origin;
        const inviteUrl = `${baseUrl}/join?code=${code}`;
        setInviteLink(inviteUrl);
        setShowInviteLink(true);
        showSuccess('Lien d\'invitation généré avec succès !');
      }
    } catch (err) {
      showError('Échec de la génération du lien d\'invitation');
    }
  };

  const handleCopyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      showSuccess('Lien d\'invitation copié dans le presse-papiers !');
    }
  };

  const handleCreateFamily = async () => {
    console.log('handleCreateFamily called with:', newFamilyName);
    
    if (!newFamilyName.trim()) {
      console.log('Nom de famille vide');
      showError('Veuillez entrer un nom de famille');
      return;
    }
    
    if (!createFamily) {
      console.log('createFamily function not available');
      showError('Fonction de création de famille non disponible');
      return;
    }
    
    console.log('Calling createFamily with:', newFamilyName.trim());
    try {
      const family = await createFamily(newFamilyName.trim());
      console.log('createFamily returned:', family);
      
      if (family) {
        setNewFamilyName('');
        showSuccess('Famille créée avec succès !');
        // Mettre à jour l'interface sans recharger la page
        // Le contexte FamilyProvider va déclencher un re-rendu automatique
        // quand currentFamily sera mis à jour
      } else {
        console.log('createFamily returned null - checking API response');
        // Essayons de créer la famille directement via fetch pour voir la réponse brute
        const directResponse = await fetch('/api/families/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newFamilyName.trim() }),
        });
        
        const directData = await directResponse.json();
        console.log('Direct API response:', directData);
        
        if (!directResponse.ok) {
          showError('Erreur de l\'API: ' + (directData.error || 'Réponse non OK'));
        } else if (!directData.success) {
          showError('L\'API a retourné success:false: ' + (directData.error || 'Aucun détail'));
        } else if (!directData.family) {
          showError('L\'API a retourné success:true mais pas de famille dans la réponse');
        } else {
          showError('Réponse API inattendue: ' + JSON.stringify(directData));
        }
      }
    } catch (e) {
      console.error('Erreur lors de la création de la famille:', e);
      showError('Échec de la création de la famille: ' + (e instanceof Error ? e.message : String(e)));
    }
  };



  const handleJoinFamily = async () => {
    console.log('handleJoinFamily called with:', inviteCode);
    
    if (!inviteCode.trim()) {
      console.log('Code d\'invitation vide');
      showError('Veuillez entrer un code d\'invitation');
      return;
    }
    
    if (!joinFamily) {
      console.log('joinFamily function not available');
      showError('Fonction de rejoindre une famille non disponible');
      return;
    }
    
    console.log('Calling joinFamily with:', inviteCode.trim());
    try {
      const family = await joinFamily(inviteCode.trim());
      console.log('joinFamily returned:', family);
      if (family) {
        setInviteCode('');
        setShowJoinFamilyDialog(false);
        showSuccess('Vous avez rejoint la famille avec succès !');
      } else {
        console.log('joinFamily returned null');
        showError('La tentative de rejoindre la famille a retourné null');
      }
    } catch (e) {
      console.error('Erreur lors de la tentative de rejoindre la famille:', e);
      showError('Échec lors de la tentative de rejoindre la famille: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleRenameFamily = async () => {
    if (!currentFamily || !editingFamilyName.trim()) return;
    
    try {
      const family = await updateFamily(currentFamily.id, editingFamilyName.trim());
      if (family) {
        setEditingFamilyName('');
        setShowRenameDialog(false);
        showSuccess('Nom de la famille mis à jour avec succès !');
      }
    } catch (e) {
      showError('Échec de la mise à jour du nom de la famille');
    }
  };

  const handleLeaveFamily = async () => {
    if (!currentFamily) return;
    
    // Vérifier si l'utilisateur actuel est le propriétaire
    if (currentFamilyRole === 'owner') {
      // Afficher un message informatif avec uniquement un bouton OK
      setConfirmationDialog({
        open: true,
        title: 'Action impossible',
        message: 'Vous ne pouvez pas quitter la famille en tant que propriétaire. Veuillez d\'abord transférer votre rôle de propriétaire à un autre membre de la famille.',
        onConfirm: () => setConfirmationDialog({ ...confirmationDialog, open: false }),
        onCancel: () => setConfirmationDialog({ ...confirmationDialog, open: false })
      });
      return;
    }
    
    // Si l'utilisateur n'est pas propriétaire, afficher la confirmation standard
    setConfirmationDialog({
      open: true,
      title: 'Quitter la famille',
      message: `Êtes-vous sûr de vouloir quitter la famille "${currentFamily.name}" ? Vous devrez être réinvité pour rejoindre à nouveau.`,
      onConfirm: async () => {
        try {
          await leaveFamily(currentFamily.id);
          setConfirmationDialog({ ...confirmationDialog, open: false });
          showSuccess('Vous avez quitté la famille avec succès');
        } catch (e) {
          setConfirmationDialog({ ...confirmationDialog, open: false });
          showError('Échec lors de la tentative de quitter la famille');
        }
      },
      onCancel: () => setConfirmationDialog({ ...confirmationDialog, open: false })
    });
  };

  const handleDeleteFamily = async () => {
    if (!currentFamily) return;
    
    try {
      await deleteFamily(currentFamily.id);
      showSuccess('Famille supprimée avec succès');
    } catch (e) {
      showError('Échec de la suppression de la famille');
    }
  };

  const toggleActionsMenu = () => {
    setShowActionsMenu(!showActionsMenu);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentFamily) {
    console.log('Rendering no family state');
    return (
      <div className="family-page-content pt-24">
        <h3 className="text-gray-800 dark:text-gray-200 font-medium mb-16 text-center text-2xl">Vous ne faites encore partie d'aucune famille, rejoignez-en une ou créez-en une nouvelle.</h3>
        
        {/* Two-column layout for create and join family forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Create Family Section */}
          <div className="bg-custom-3 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-100 mb-3">Créer une famille</h4>
            <p className="text-gray-200 text-sm mb-4">
              Créez une nouvelle famille pour partager vos véhicules et votre historique avec vos proches.
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="Nom de votre famille (ex: Famille Martin)"
              />
              
              <button
                onClick={handleCreateFamily}
                disabled={!newFamilyName.trim()}
                className={`w-full px-4 py-2 bg-white rounded-md hover:bg-gray-200 hover:cursor-pointer transition-colors ${
                  !newFamilyName.trim() ? 'hidden' : ''
                }`}
              >
                Créer la famille
              </button>
            </div>
          </div>
          
          {/* Join Family Section */}
          <div className="bg-custom-1 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-100 mb-3">Rejoindre une famille</h4>
            <p className="text-gray-200 text-sm mb-4">
              Vous avez reçu un code d'invitation ? Utilisez-le pour rejoindre une famille existante.
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="Code d'invitation"
              />
              
              <button
                onClick={handleJoinFamily}
                disabled={!inviteCode.trim()}
                className={`w-full px-4 py-2 bg-white rounded-md hover:bg-gray-200 hover:cursor-pointer transition-colors ${
                  !inviteCode.trim() ? 'hidden' : ''
                }`}
              >
                Rejoindre la famille
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="family-page-content">
      {/* Family Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {currentFamily.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Vous êtes {currentFamilyRole === 'owner' ? 'le propriétaire' : 'un membre'} de cette famille
          </p>
        </div>
        
        {/* Actions Menu - Dropdown */}
        <div className="relative">
          <button
            onClick={toggleActionsMenu}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            aria-label="Menu des actions de la famille"
          >
            <Icon name="settings" size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="hidden sm:inline text-gray-700 dark:text-gray-200 font-medium">Actions</span>
          </button>
          
          {/* Dropdown Menu - Click outside to close */}
          {showActionsMenu && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowActionsMenu(false)}
            ></div>
          )}
          {showActionsMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-950 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-2">
                {/* Rename Family */}
                <button
                  onClick={() => {
                    setEditingFamilyName(currentFamily.name);
                    setShowRenameDialog(true);
                    setShowActionsMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Icon name="edit" size={18} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-800 dark:text-white text-sm font-medium">Renommer la famille</span>
                </button>
                
                {/* Generate Invite Link */}
                <button
                  onClick={() => {
                    handleGenerateInviteLink();
                    setShowActionsMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Icon name="add" size={18} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-800 dark:text-white text-sm font-medium">Générer un lien d'invitation</span>
                </button>
                
                {/* Leave Family */}
                <button
                  onClick={() => {
                    setConfirmationDialog({
                      open: true,
                      title: 'Quitter la famille',
                      message: `Êtes-vous sûr de vouloir quitter la famille "${currentFamily.name}" ? Vous devrez être réinvité pour rejoindre à nouveau.`,
                      onConfirm: handleLeaveFamily,
                      onCancel: () => setConfirmationDialog({ ...confirmationDialog, open: false })
                    });
                    setShowActionsMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Icon name="add" size={18} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-800 dark:text-white text-sm font-medium">Quitter la famille</span>
                </button>
                
                {/* Delete Family - Only for owners */}
                {currentFamilyRole === 'owner' && (
                  <button
                    onClick={() => {
                      setConfirmationDialog({
                        open: true,
                        title: 'Supprimer la famille',
                        message: `Êtes-vous sûr de vouloir supprimer définitivement la famille "${currentFamily.name}" ? Cette action est irréversible et tous les membres seront retirés.`,
                        onConfirm: handleDeleteFamily,
                        onCancel: () => setConfirmationDialog({ ...confirmationDialog, open: false })
                      });
                      setShowActionsMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <Icon name="delete" size={18} className="text-orange-500 dark:text-orange-400" />
                    <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">Supprimer la famille</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Link Display */}
      {showInviteLink && inviteLink && (
        <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              <p className="text-indigo-800 dark:text-indigo-300 text-sm font-medium mb-2">
                Lien d'invitation pour rejoindre la famille:
              </p>
              <div className="bg-white dark:bg-gray-950 border border-indigo-200 dark:border-indigo-600 rounded-md p-2 text-sm break-all">
                {inviteLink}
              </div>
            </div>
            <button
              onClick={handleCopyInviteLink}
              className="flex-shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Copier
            </button>
          </div>
        </div>
      )}

      {/* Family Members List */}
      <div className="family-members-section">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Membres de la famille ({familyMembers?.length || 0})
        </h2>
        
        {!familyMembers || familyMembers.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">
            Aucun membre trouvé dans cette famille
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyMembers.map((member) => (
              <div key={member.user_id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-800 dark:text-white font-medium mb-1">
                      {member.full_name || member.email || 'Membre inconnu'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {member.email}
                    </p>
                    <p className="text-xs mt-2 inline-block px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                      {member.role === 'owner' ? 'Propriétaire' : 'Membre'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rename Family Dialog - Click outside to close */}
      {showRenameDialog && (
        <div 
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRenameDialog(false);
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-950 rounded-lg p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Renommer la famille
            </h3>
            <input
              type="text"
              value={editingFamilyName}
              onChange={(e) => setEditingFamilyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white mb-4"
              placeholder="Nouveau nom de la famille"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRenameDialog(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleRenameFamily}
                disabled={!editingFamilyName.trim()}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors ${
                  !editingFamilyName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.open}
        onClose={() => setConfirmationDialog({ ...confirmationDialog, open: false })}
        onConfirm={confirmationDialog.onConfirm}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        confirmText={confirmationDialog.title.includes('Supprimer') ? 'Supprimer' : 'Confirmer'}
        cancelText="Annuler"
        loading={false}
      />
    </div>
  );
};