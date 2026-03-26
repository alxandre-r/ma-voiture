'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import Spinner from '@/components/common/ui/Spinner';
import { useNotifications } from '@/contexts/NotificationContext';
import { useUser } from '@/contexts/UserContext';

interface FamilyInvite {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
  owner_user: {
    id: string;
    name: string;
  } | null;
}

export default function JoinFamilyClient() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFamily, setHasFamily] = useState(false);
  const [familyData, setFamilyData] = useState<FamilyInvite | null>(null);

  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showError } = useNotifications();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    setToken(urlToken);

    if (!urlToken) {
      setError("Token d'invitation manquant");
      setIsLoading(false);
      return;
    }

    const init = async () => {
      try {
        if (user.has_family) {
          setHasFamily(true);
          return;
        }

        // Récupérer famille via API pour afficher les infos de l'invitation dans le modal de confirmation
        const familyRes = await fetch(`/api/family/getByInvitToken?token=${urlToken}`);
        const familyJson = await familyRes.json();

        if (!familyRes.ok) throw new Error(familyJson.error);

        setFamilyData(familyJson);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erreur lors du chargement de la famille';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [searchParams, user.has_family]);

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

      router.push('/family');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la jointure';
      setError(message);
      showError(message);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
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
    const isNotFound = error?.includes('invalide') || error?.includes('introuvable');
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">✕</span>
          </div>
          <h2 className="text-xl font-semibold text-red-600">Invitation invalide</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {error ?? 'Impossible de charger les informations de la famille.'}
          </p>
          {isNotFound && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Le lien d&apos;invitation est peut-être expiré ou a déjà été utilisé. Demandez un
              nouveau lien au propriétaire de la famille.
            </p>
          )}
          {!isNotFound && error && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Si le problème persiste, vérifiez que vous êtes bien connecté et réessayez.
            </p>
          )}
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
            {familyData.owner_user
              ? `${familyData.owner_user.name} vous invite à rejoindre sa famille`
              : `Vous avez été invité à rejoindre une famille`}
          </h1>
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
              {familyData.owner_user && (
                <p>
                  <span className="font-medium">Propriétaire :</span> {familyData.owner_user.name}
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4 text-gray-700 dark:text-gray-200">
            En rejoignant cette famille, vous aurez accès aux données partagées par ses membres.
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleJoinFamily}
              disabled={isJoining}
              className="flex-1 py-3 rounded-lg bg-custom-1 hover:bg-custom-1-hover text-white font-semibold transition disabled:opacity-50 cursor-pointer"
            >
              {isJoining ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner color="white" />
                  Chargement en cours...
                </div>
              ) : (
                'Rejoindre cette famille'
              )}
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg dark:border-gray-600 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer"
            >
              Annuler
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
