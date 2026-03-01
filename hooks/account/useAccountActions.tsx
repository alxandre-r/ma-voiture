/**
 * @file hooks/useAccountActions.ts
 * @description Encapsule toute la logique métier liée au compte utilisateur
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import type { User } from '@/types/user';

interface UseAccountActionsProps {
  user: User;
  showNotification: (message: string, type: 'success' | 'error') => void;
}

export default function useAccountActions({ user, showNotification }: UseAccountActionsProps) {
  const router = useRouter();

  const [localUser, setLocalUser] = useState<User>(user);

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [isPending, startTransition] = useTransition();

  /* =============================
     PROFILE UPDATE
  ============================== */
  const updateProfile = async (name: string, email: string) => {
    if (!name.trim()) {
      showNotification('Le nom ne peut pas être vide', 'error');
      return false;
    }

    if (!email.trim()) {
      showNotification('Email invalide', 'error');
      return false;
    }

    const previousUser = localUser;

    // Optimistic update
    setLocalUser((u) => ({
      ...u,
      name,
      email,
    }));

    setIsProfileLoading(true);

    try {
      const res = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      showNotification('Profil mis à jour', 'success');

      // Revalidation non bloquante
      startTransition(() => {
        router.refresh();
      });

      return true;
    } catch (error) {
      // rollback
      setLocalUser(previousUser);

      showNotification(error instanceof Error ? error.message : 'Erreur', 'error');

      return false;
    } finally {
      setIsProfileLoading(false);
    }
  };

  /* =============================
     PASSWORD UPDATE
  ============================== */
  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!oldPassword || !newPassword) {
      showNotification('Tous les champs sont requis', 'error');
      return false;
    }

    setIsPasswordLoading(true);

    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur');
      }

      showNotification('Mot de passe mis à jour', 'success');
      return true;
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Erreur', 'error');

      return false;
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return {
    localUser,
    updateProfile,
    changePassword,
    isProfileLoading: isProfileLoading || isPending,
    isPasswordLoading,
  };
}
