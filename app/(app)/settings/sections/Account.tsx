"use client";

import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useNotifications } from "@/contexts/NotificationContext";

export default function AccountSection() {
  const { showNotification } = useNotifications();

  const [user, setUser] = useState<{
    name: string;
    email: string;
    family_id?: string | null;
    created_at?: string;
  } | null>(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    oldPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/users/me");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUser(data);
      setForm((f) => ({ ...f, name: data.name, email: data.email }));
    } catch {
      showNotification("Erreur lors du chargement du profil", "error");
    }
  }, [showNotification]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const saveProfile = async () => {
    try {
      setLoading(true);

      if (!form.name.trim()) throw new Error("Le nom ne peut pas être vide");
      if (!form.email.trim()) throw new Error("Email invalide");

      await Promise.all([
        fetch("/api/users/change-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newName: form.name }),
        }),
        fetch("/api/users/change-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newEmail: form.email }),
        }),
      ]);

      showNotification("Profil mis à jour", "success");
      setEditingProfile(false);
      fetchUserData();
    } catch (e) {
      showNotification(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    try {
      setLoading(true);

      if (!form.oldPassword || !form.newPassword)
        throw new Error("Tous les champs sont requis");

      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification("Mot de passe mis à jour", "success");
      setShowPasswordForm(false);
      setForm((f) => ({ ...f, oldPassword: "", newPassword: "" }));
    } catch (e) {
      showNotification(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const initial = user.name?.charAt(0).toUpperCase();

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

      {/* PROFILE CARD */}
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-custom-2 text-white flex items-center justify-center text-lg lg:text-3xl font-bold">
          {initial}
        </div>

        {/* Contenu Profil */}
        <div className="flex-1">
          {!editingProfile ? (
            <>
              <p className="text-xl font-semibold">{user.name}</p>
              <p className="text-gray-500">{user.email}</p>
              <button
                onClick={() => setEditingProfile(true)}
                className="text-sm font-medium text-custom-1 hover:underline cursor-pointer mt-2"
              >
                Modifier mes informations
              </button>
            </>
          ) : (
            <div className="space-y-3 max-w-sm">
              {/* Formulaire */}
              <input
                className="input px-3 py-3 border-b border-gray-400 dark:border-gray-700 w-full text-xl focus:outline-none font-semibold"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="email"
                className="input px-3 py-3 border-b border-gray-400 dark:border-gray-700 w-full focus:outline-none text-gray-600 dark:text-gray-300"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              {/* Boutons sous le formulaire */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setEditingProfile(false)}
                  className="px-4 py-2 rounded-lg border border-gray-400 dark:border-gray-700 text-sm cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-custom-1 text-white text-sm"
                >
                  {loading ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* META */}
      <div className="text-sm text-gray-500 space-y-1">
        {user.family_id && <p>Membre d&apos;une famille</p>}
        {user.created_at && (
          <p>
            Compte créé le {new Date(user.created_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* PASSWORD */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="px-4 py-3 rounded-lg border border-gray-400 dark:border-gray-700 font-medium cursor-pointer"
          >
            Changer mon mot de passe
          </button>
        ) : (
            <div className="space-y-3 flex flex-col max-w-lg">
              <input
              type="password"
              placeholder="Ancien mot de passe"
              className="input rounded-lg px-3 py-3 border border-gray-400 dark:border-gray-700 w-full"
              value={form.oldPassword}
              onChange={(e) =>
                setForm({ ...form, oldPassword: e.target.value })
              }
              />
              <input
              type="password"
              placeholder="Nouveau mot de passe"
              className="input rounded-lg px-3 py-3 border border-gray-400 dark:border-gray-700 w-full"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
              />

              <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordForm(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={changePassword}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-custom-1 text-white text-sm cursor-pointer"
              >
                {loading ? "Mise à jour…" : "Mettre à jour"}
              </button>
              </div>
            </div>
        )}
      </div>
    </section>
  );
}