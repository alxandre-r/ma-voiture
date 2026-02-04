"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

type FormStatus = {
  success?: string;
  error?: string;
};

export default function AccountSection() {
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [isLoading, setIsLoading] = useState({
    email: false,
    password: false,
  });

  const [formStatus, setFormStatus] = useState<{
    email: FormStatus;
    password: FormStatus;
  }>({
    email: {},
    password: {},
  });

  const handleChangeEmail = async () => {
    if (!email) {
      setFormStatus({
        ...formStatus,
        email: { error: "Veuillez entrer une adresse email valide." },
      });
      return;
    }

    setIsLoading({ ...isLoading, email: true });
    setFormStatus({ ...formStatus, email: {} });

    try {
      const response = await fetch("/api/users/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setFormStatus({
        ...formStatus,
        email: { success: data.message || "Email mis à jour avec succès." },
      });
      setEmail("");
    } catch (error) {
      setFormStatus({
        ...formStatus,
        email: {
          error:
            error instanceof Error
              ? error.message
              : "Erreur lors de la mise à jour.",
        },
      });
    } finally {
      setIsLoading({ ...isLoading, email: false });
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.oldPassword || !passwords.newPassword) {
      setFormStatus({
        ...formStatus,
        password: { error: "Veuillez remplir tous les champs." },
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setFormStatus({
        ...formStatus,
        password: {
          error: "Le mot de passe doit contenir au moins 6 caractères.",
        },
      });
      return;
    }

    setIsLoading({ ...isLoading, password: true });
    setFormStatus({ ...formStatus, password: {} });

    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setFormStatus({
        ...formStatus,
        password: {
          success: data.message || "Mot de passe mis à jour avec succès.",
        },
      });
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (error) {
      setFormStatus({
        ...formStatus,
        password: {
          error:
            error instanceof Error
              ? error.message
              : "Erreur lors de la mise à jour.",
        },
      });
    } finally {
      setIsLoading({ ...isLoading, password: false });
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-8">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Icon name="secure" size={24} />
          Mon compte
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gérez vos informations personnelles et votre sécurité
        </p>
      </div>

      {/* EMAIL */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Changer l’adresse email</h3>
        <input
          type="email"
          placeholder="Nouvelle adresse email"
          className="p-4 rounded-lg border w-full bg-gray-50 dark:bg-gray-900"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleChangeEmail}
          disabled={isLoading.email}
          className="px-4 py-3 bg-custom-1 text-white rounded-lg font-medium"
        >
          {isLoading.email ? "Mise à jour..." : "Mettre à jour"}
        </button>

        {formStatus.email.success && (
          <div className="text-sm text-green-700 bg-green-100 p-3 rounded-lg">
            {formStatus.email.success}
          </div>
        )}
        {formStatus.email.error && (
          <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg">
            {formStatus.email.error}
          </div>
        )}
      </div>

      {/* PASSWORD */}
      <div className="space-y-3 border-t pt-6">
        <h3 className="text-lg font-semibold">Changer le mot de passe</h3>

        <input
          type="password"
          placeholder="Ancien mot de passe"
          className="p-4 rounded-lg border w-full bg-gray-50 dark:bg-gray-900"
          value={passwords.oldPassword}
          onChange={(e) =>
            setPasswords({ ...passwords, oldPassword: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          className="p-4 rounded-lg border w-full bg-gray-50 dark:bg-gray-900"
          value={passwords.newPassword}
          onChange={(e) =>
            setPasswords({ ...passwords, newPassword: e.target.value })
          }
        />

        <button
          onClick={handleChangePassword}
          disabled={isLoading.password}
          className="px-4 py-3 bg-custom-1 text-white rounded-lg font-medium"
        >
          {isLoading.password ? "Mise à jour..." : "Mettre à jour"}
        </button>

        {formStatus.password.success && (
          <div className="text-sm text-green-700 bg-green-100 p-3 rounded-lg">
            {formStatus.password.success}
          </div>
        )}
        {formStatus.password.error && (
          <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg">
            {formStatus.password.error}
          </div>
        )}
      </div>
    </section>
  );
}