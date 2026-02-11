'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';
import { useFamily } from '@/contexts/FamilyContext';

interface FamilyInvite {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
  owner_user: {
    id: string;
    name: string;
  };
}

export default function JoinFamilyClient() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFamily, setHasFamily] = useState(false);
  const [familyData, setFamilyData] = useState<FamilyInvite | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotifications();
  const { refreshFamily } = useFamily();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      setError('Token d\'invitation manquant');
      setIsLoading(false);
      return;
    }

    setToken(urlToken);

    const init = async () => {
      try {
        // Vérifier utilisateur
        const userRes = await fetch('/api/users/me');
        const userData = await userRes.json();

        if (!userRes.ok) throw new Error(userData.error);

        if (userData.hasFamily) {
          setHasFamily(true);
          return;
        }

        // Récupérer famille via API
        const familyRes = await fetch(`/api/family/get?token=${urlToken}`);
        const familyJson = await familyRes.json();

        if (!familyRes.ok) throw new Error(familyJson.error);

        setFamilyData(familyJson);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors du chargement de la famille';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [searchParams]);

  const handleJoinFamily = async () => {
    if (!token) return;

    setIsJoining(true);
    setError(null);

    try {
      const res = await fetch('/api/family/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await refreshFamily();
      router.push('/family');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la jointure';
      setError(message);
      showNotification(message, 'error');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (hasFamily) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Vous faites déjà partie d&apos;une famille
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Vous ne pouvez pas rejoindre une autre famille.
          </p>
          <button
            onClick={() => router.push('/family')}
            className="mt-6 w-full py-3 rounded-lg bg-custom-1 hover:bg-custom-1-dark text-white font-semibold transition cursor-pointer"
          >
            Retour à ma famille
          </button>
        </div>
      </div>
    );
  }

  if (error || !familyData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Invitation invalide
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {error ?? 'Impossible de charger les informations de la famille.'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 w-full py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="md:min-h-screen flex items-center justify-center md:pb-24 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-custom-1/10 dark:bg-custom-1/20 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Invitation à rejoindre une famille
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Vous avez été invité à rejoindre la famille suivante
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {familyData.name}
            </h2>
            <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium">Créée le :</span>{' '}
                {new Date(familyData.created_at).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Propriétaire :</span>{' '}
                {familyData.owner_user.name}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4 text-gray-700 dark:text-gray-200">
            En rejoignant cette famille, vous aurez accès aux données partagées par ses membres.
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleJoinFamily}
              disabled={isJoining}
              className="flex-1 py-3 rounded-lg bg-custom-1 hover:bg-custom-1-dark text-white font-semibold transition disabled:opacity-50 cursor-pointer"
            >
              {isJoining ? 'Rejointure en cours...' : 'Rejoindre cette famille'}
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Annuler
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}