/**
 * @file app/(app)/family/join/JoinFamilyClient.tsx
 * @fileoverview Page for joining a family using an invitation token.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';
import { useFamily } from '@/contexts/FamilyContext';

export default function JoinFamilyClient() {
  const [token, setToken] = useState<string>('');
  const [manualToken, setManualToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFamily, setHasFamily] = useState<boolean | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotifications();
  const { refreshFamily } = useFamily();

  // Extract token from URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      setManualToken(urlToken);
    }
    setIsLoading(false);
  }, [searchParams]);

  // Check if user already has a family
  const checkFamilyStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/family/check');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la vérification de la famille');
      }

      setHasFamily(data.hasFamily);
      
      if (data.hasFamily) {
        showNotification('Vous faites déjà partie d\'une famille', 'info');
        router.push('/family');
      }
    } catch (error) {
      console.error('Error checking family status:', error);
      showNotification(error instanceof Error ? error.message : 'Erreur lors de la vérification de la famille', 'error');
    }
  }, [showNotification, router]);

  useEffect(() => {
    if (!isLoading && token) {
      checkFamilyStatus();
    }
  }, [isLoading, token, checkFamilyStatus]);

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualToken.trim()) {
      showNotification('Veuillez entrer un code d\'invitation', 'error');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch('/api/family/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: manualToken.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la jointure de la famille');
      }

      showNotification('Vous avez rejoint la famille avec succès !', 'success');
      await refreshFamily();
      router.push('/family');
    } catch (error) {
      console.error('Error joining family:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la jointure de la famille';
      showNotification(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
      </div>
    );
  }

  if (hasFamily) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">
            Vous faites déjà partie d&apos;une famille
          </h2>
          <p className="text-green-700 dark:text-green-300 mb-4">
            Vous êtes déjà membre d&apos;une famille. Vous ne pouvez pas rejoindre une autre famille.
          </p>
          <button
            onClick={() => router.push('/family')}
            className="w-full py-2 px-4 bg-custom-1 hover:bg-custom-1-dark text-white rounded-md transition-colors"
          >
            Retour à ma famille
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-64">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          Rejoindre une famille
        </h1>
        
        <form onSubmit={handleJoinFamily} className="space-y-4">
          <div>
            <label htmlFor="invitation-token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Code d&apos;invitation
            </label>
            <input
              id="invitation-token"
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Entrez le code d&apos;invitation"
              required
              disabled={isJoining}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-red-600 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isJoining}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              isJoining 
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isJoining ? 'Rejointure en cours...' : 'Rejoindre la famille'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vous n&apos;avez pas de code d&apos;invitation ? Demandez à un membre de votre famille de vous inviter.
          </p>
        </div>
      </div>
    </div>
  );
}