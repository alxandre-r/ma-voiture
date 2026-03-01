'use client';

import { useState } from 'react';

import Icon from '@/components/ui/Icon';
import Spinner from '@/components/ui/Spinner';
import { useNotifications } from '@/contexts/NotificationContext';
import useAccountActions from '@/hooks/account/useAccountActions';

import type { User } from '@/types/user';

export default function AccountSection({ user }: { user: User }) {
  const { showNotification } = useNotifications();

  const { localUser, updateProfile, changePassword, isProfileLoading, isPasswordLoading } =
    useAccountActions({ user, showNotification });

  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    oldPassword: '',
    newPassword: '',
  });

  const saveProfile = async () => {
    const success = await updateProfile(form.name, form.email);
    if (success) {
      setEditing(false);
    }
  };

  const handlePasswordChange = async () => {
    const success = await changePassword(form.oldPassword, form.newPassword);

    if (success) {
      setShowPassword(false);
      setForm((f) => ({ ...f, oldPassword: '', newPassword: '' }));
    }
  };

  const initial = localUser.name?.charAt(0).toUpperCase();

  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Icon name="user" size={24} />
          Mon compte
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Informations personnelles et sécurité
        </p>
      </div>

      {/* PROFILE */}
      <div className="flex items-start gap-6">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-custom-2 text-white flex items-center justify-center text-lg lg:text-3xl font-bold">
          {initial}
        </div>

        <div className="flex-1">
          {!editing ? (
            <>
              <p className="text-xl font-semibold">{localUser.name}</p>
              <p className="text-gray-500">{localUser.email}</p>
              <button
                onClick={() => setEditing(true)}
                className="text-sm font-medium text-custom-1 hover:underline mt-2 cursor-pointer
                hover:scale-102 active:scale-98 transition-transform"
              >
                Modifier mes informations
              </button>
            </>
          ) : (
            <div className="space-y-3 max-w-sm">
              <input
                className="input px-3 py-3 border-b border-gray-400 dark:border-gray-700 w-full text-xl font-semibold focus:outline-none"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                type="email"
                className="input px-3 py-3 border-b border-gray-400 dark:border-gray-700 w-full focus:outline-none"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      ...form,
                      name: localUser.name,
                      email: localUser.email,
                    });
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm cursor-pointer
                  hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                  hover:scale-104 active:scale-96"
                >
                  Annuler
                </button>

                <button
                  onClick={saveProfile}
                  disabled={isProfileLoading}
                  className="px-4 py-2 rounded-lg bg-custom-1 text-white text-sm cursor-pointer
                  hover:bg-custom-1/90 disabled:bg-custom-1/70 transition-colors
                  hover:scale-105 active:scale-95"
                >
                  {isProfileLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner color="white" />
                      Mise à jour...
                    </div>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* META */}
      <div className="text-sm text-gray-500 space-y-1">
        {localUser.has_family && <p>Membre de la famille {localUser.family_name}</p>}
        <p>Compte créé le {new Date(localUser.created_at).toLocaleDateString()}</p>
      </div>

      {/* PASSWORD */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
        {!showPassword ? (
          <button
            onClick={() => setShowPassword(true)}
            className="px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm cursor-pointer
            hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
            hover:scale-102 active:scale-98"
          >
            Changer mon mot de passe
          </button>
        ) : (
          <div className="space-y-3 flex flex-col max-w-lg">
            <input
              type="password"
              placeholder="Ancien mot de passe"
              className="input rounded-lg px-3 py-3 border border-gray-300 dark:border-gray-700"
              value={form.oldPassword}
              onChange={(e) => setForm((f) => ({ ...f, oldPassword: e.target.value }))}
            />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              className="input rounded-lg px-3 py-3 border border-gray-300 dark:border-gray-700"
              value={form.newPassword}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowPassword(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm cursor-pointer 
                hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                hover:scale-104 active:scale-96"
              >
                Annuler
              </button>

              <button
                onClick={handlePasswordChange}
                disabled={isPasswordLoading}
                className="px-4 py-2 rounded-lg bg-custom-1 text-white text-sm cursor-pointer
                hover:bg-custom-1/90 disabled:bg-custom-1/70 transition-colors
                hover:scale-105 active:scale-95"
              >
                {isPasswordLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner color="white" />
                    Mise à jour...
                  </div>
                ) : (
                  'Mettre à jour'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
