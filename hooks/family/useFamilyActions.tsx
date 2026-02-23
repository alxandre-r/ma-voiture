// hooks/useFamilyActions.ts
'use client';

import { useState, useCallback } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

export function useFamilyActions( familyData: any, setFamilyData: (data: any) => void) {
    const [isLoading, setIsLoading] = useState(false);
    const { showNotification } = useNotifications();

    // Appelé après le renommage d'une famille pour mettre à jour le state local
    // Set la data de famille avec le nouveau nom pour un rendu instantané (optimistic update)
    const handleRename = useCallback(
    async (newName: string) => {
        if (!newName.trim()) {
        showNotification('Le nom de la famille ne peut pas être vide', 'error');
        return;
        }

        if (!familyData) return;

        const previousName = familyData.name;

        // Optimistic update : met à jour le nom de la famille localement avant la réponse du serveur
        setFamilyData({...familyData,name: newName,});

        try {
        const response = await fetch('/api/family/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            familyId: familyData.id,
            name: newName,
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        showNotification('Famille renommée avec succès', 'success');
        } catch (error) {
        // rollback si erreur
        setFamilyData({
            ...familyData,
            name: previousName,
        });

        showNotification(
            error instanceof Error
            ? error.message
            : 'Erreur lors du renommage de la famille',
            'error'
        );
        }
    },
    [familyData, setFamilyData, showNotification]
    );

    // Appelé après que l'utilisateur ait quitté une famille pour mettre à jour le state local
    const handleLeave = useCallback(async () => {
        if (!familyData) return;

        setIsLoading(true);
        try {
        const response = await fetch('/api/family/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ familyId: familyData.id }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erreur lors de la sortie de la famille');

        showNotification('Vous avez quitté la famille avec succès', 'success');
        window.location.reload(); // Recharge la page pour mettre à jour l'état de l'application
        } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Erreur lors de la sortie de la famille', 'error');
        } finally {
        setIsLoading(false);
        }
    }, [familyData, showNotification]);

    // Appelé après que l'utilisateur ait supprimé une famille pour mettre à jour le state local
    const handleDelete = useCallback(async () => {
        if (!familyData) return;

        setIsLoading(true);
        try {
        const response = await fetch('/api/family/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ familyId: familyData.id }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erreur lors de la suppression de la famille');

        showNotification('Famille supprimée avec succès', 'success');
        window.location.reload(); // Recharge la page pour refléter les changements
        } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Erreur lors de la suppression de la famille', 'error');
        } finally {
        setIsLoading(false);
        }
    }, [familyData, showNotification]);

    return {
        familyData,
        setFamilyData,
        isLoading,
        handleRename,
        handleLeave,
        handleDelete,
    };
}