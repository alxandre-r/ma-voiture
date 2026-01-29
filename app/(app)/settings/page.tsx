/**
 * @file src/app/settings/page.tsx
 * @description Settings page for account, theme, units and preferences.
 */

"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import Icon from "@/components/ui/Icon";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // State for active menu section
  const [activeSection, setActiveSection] = useState("appearance");

  const [units, setUnits] = useState({
    distance: "km", // km | miles
    fuel: "L",      // L | gal
    consumption: "L/100km", // L/100km | MPG
  });

  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [isLoading, setIsLoading] = useState({
    email: false,
    password: false,
  });

  type FormStatus = {
    success?: string;
    error?: string;
  };

  const [formStatus, setFormStatus] = useState<{
    email: FormStatus;
    password: FormStatus;
  }>({
    email: { success: undefined, error: undefined },
    password: { success: undefined, error: undefined },
  });

  // RGPD Privacy Section State
  const [exportingData, setExportingData] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const handleChangeEmail = async () => {
    if (!email) {
      setFormStatus({ ...formStatus, email: { success: undefined, error: "Veuillez entrer une adresse email valide." } });
      return;
    }

    setIsLoading({ ...isLoading, email: true });
    setFormStatus({ ...formStatus, email: { success: undefined, error: undefined } });

    try {
      const response = await fetch('/api/users/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newEmail: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour de l\'email');
      }

      setFormStatus({ 
        ...formStatus, 
        email: { 
          success: data.message || "Votre email a été mis à jour avec succès!", 
          error: undefined 
        } 
      });
      setEmail("");
    } catch (error) {
      setFormStatus({ 
        ...formStatus, 
        email: { 
          success: undefined, 
          error: error instanceof Error ? error.message : "Erreur lors de la mise à jour de l'email." 
        } 
      });
    } finally {
      setIsLoading({ ...isLoading, email: false });
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.oldPassword || !passwords.newPassword) {
      setFormStatus({ ...formStatus, password: { success: undefined, error: "Veuillez remplir tous les champs." } });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setFormStatus({ ...formStatus, password: { success: undefined, error: "Le mot de passe doit contenir au moins 6 caractères." } });
      return;
    }

    setIsLoading({ ...isLoading, password: true });
    setFormStatus({ ...formStatus, password: { success: undefined, error: undefined } });

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour du mot de passe');
      }

      setFormStatus({ 
        ...formStatus, 
        password: { 
          success: data.message || "Votre mot de passe a été mis à jour avec succès!", 
          error: undefined 
        } 
      });
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (error) {
      setFormStatus({ 
        ...formStatus, 
        password: { 
          success: undefined, 
          error: error instanceof Error ? error.message : "Erreur lors de la mise à jour du mot de passe." 
        } 
      });
    } finally {
      setIsLoading({ ...isLoading, password: false });
    }
  };

  // RGPD Privacy Functions
  const exportUserData = async () => {
    setExportingData(true);
    setExportSuccess(null);

    try {
      // Simulate data export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setExportSuccess("Vos données ont été exportées avec succès. Vous recevrez un email avec le fichier sous peu.");
    } catch (error) {
      setExportSuccess("Erreur lors de l'export des données. Veuillez réessayer.");
    } finally {
      setExportingData(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmation !== "SUPPRIMER MON COMPTE") {
      alert("Veuillez confirmer la suppression en tapant 'SUPPRIMER MON COMPTE'");
      return;
    }

    setDeletingAccount(true);
    setDeleteSuccess(null);

    try {
      // Simulate account deletion process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDeleteSuccess("Votre compte a été supprimé avec succès. Vous allez être redirigé.");
      
      // In a real implementation, you would redirect to login page
      // router.push('/auth/not-identified');
    } catch (error) {
      setDeleteSuccess("Erreur lors de la suppression du compte. Veuillez réessayer.");
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmation("");
    }
  };

  // Menu items
  const menuItems = [
    { id: "appearance", label: "Apparence", icon: "settings" as const },
    { id: "units", label: "Unités", icon: "conso" as const },
    { id: "account", label: "Mon compte", icon: "secure" as const },
    { id: "privacy", label: "Confidentialité", icon: "secure" as const },
    { id: "logout", label: "Déconnexion", icon: "garage" as const },
  ];

  return (
    <main className="">
      <h1 className="text-xl font-bold mb-4 sm:text-2xl sm:mb-6 lg:text-3xl lg:mb-8 text-gray-800 dark:text-white">Paramètres</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-8">
        {/* SIDEBAR MENU - Grid on mobile, list on desktop */}
        <aside className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sticky top-6 lg:p-4">
            {/* Mobile grid layout */}
            <nav className="lg:hidden grid grid-cols-2 gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors hover:cursor-pointer
                    ${activeSection === item.id
                    ? "bg-custom-1 text-white shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                >
                  <Icon name={item.icon} size={20} className={`flex-shrink-0
                  ${activeSection === item.id ? "invert dark:invert-0" : ""}`} />
                  <span className="text-xs font-medium text-center">{item.label}</span>
                </button>
              ))}
            </nav>
            
            {/* Desktop list layout */}
            <nav className="hidden lg:block space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:cursor-pointer
                  ${activeSection === item.id
                  ? "bg-custom-1 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                >
                  <Icon name={item.icon} size={18} className={`flex-shrink-0 
                  ${activeSection === item.id ? "invert dark:invert-0" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3">
          {/* APPEARANCE SECTION */}
          {activeSection === "appearance" && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
                <Icon name="settings" size={24} />
                Apparence
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="font-medium block mb-2 text-gray-700 dark:text-gray-300">Thème de l&apos;application</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="p-4 rounded-lg border w-full bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:cursor-pointer
                    focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:p-3"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="system">Système (recommandé)</option>
                  </select>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Choisissez le thème qui vous convient le mieux. Le thème &quot;Système&quot; suit les paramètres de votre appareil.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* UNITS SECTION */}
          {activeSection === "units" && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
                <Icon name="conso" size={24} />
                Unités de mesure
              </h2>

              <div className="space-y-6">
                {/* Distance */}
                <div>
                  <label className="font-medium block mb-2 text-gray-700 dark:text-gray-300">Distance</label>
                  <select
                    value={units.distance}
                    onChange={(e) =>
                      setUnits({ ...units, distance: e.target.value })
                    }
                    className="p-4 rounded-lg border w-full bg-gray-50 border-gray-300 hover:cursor-pointer
                    dark:bg-gray-900 dark:border-gray-600 dark:hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:p-3"
                  >
                    <option value="km">Kilomètres (km)</option>
                    <option value="miles">Miles (mi)</option>
                  </select>
                </div>

                {/* Fuel */}
                <div>
                  <label className="font-medium block mb-2 text-gray-700 dark:text-gray-300">Carburant</label>
                  <select
                    value={units.fuel}
                    onChange={(e) =>
                      setUnits({ ...units, fuel: e.target.value })
                    }
                    className="p-3 rounded-lg border w-full bg-gray-50 border-gray-300 hover:cursor-pointer
                    dark:bg-gray-900 dark:border-gray-600 dark:hover:border-gray-400 focus:ring-2 focus:ring-custom-1 focus:outline-none"
                  >
                    <option value="L">Litres (L)</option>
                    <option value="gal">Gallons (gal)</option>
                  </select>
                </div>

                {/* Consumption */}
                <div>
                  <label className="font-medium block mb-2 text-gray-700 dark:text-gray-300">Consommation</label>
                  <select
                    value={units.consumption}
                    onChange={(e) =>
                      setUnits({ ...units, consumption: e.target.value })
                    }
                    className="p-3 rounded-lg border w-full bg-gray-50 border-gray-300 hover:cursor-pointer
                    dark:bg-gray-900 dark:border-gray-600 dark:hover:border-gray-400 focus:ring-2 focus:ring-custom-1 focus:outline-none"
                  >
                    <option value="L/100km">Litres par 100km (L/100km)</option>
                    <option value="MPG">Miles par gallon (MPG)</option>
                  </select>
                </div>

                <div className="bg-custom-1/10 dark:bg-custom-1-dark/10 p-4 rounded-lg border border-custom-1/20 dark:border-custom-1-dark/20">
                  <p className="text-sm text-custom-1 dark:text-custom-1-dark">
                    <strong>Note :</strong> Les changements d&apos;unités seront appliqués à tous vos véhicules et historiques de consommation.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ACCOUNT SECTION */}
          {activeSection === "account" && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-3">
                  <Icon name="secure" size={24} />
                  Mon compte
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Gérer vos informations personnelles et vos paramètres de sécurité
                </p>
              </div>

              {/* Change email */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Changer l&apos;adresse email</h3>
                  <div className="space-y-3">
                    <input
                      type="email"
                      className="p-4 rounded-lg border w-full bg-gray-50 border-gray-300 hover:cursor-pointer
                      dark:bg-gray-900 dark:border-gray-600 dark:hover:border-gray-400 focus:ring-2 focus:ring-custom-1 focus:outline-none sm:p-3"
                      placeholder="Nouvelle adresse email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                      onClick={handleChangeEmail}
                      disabled={isLoading.email}
                      className={`px-4 py-3 text-white rounded-lg font-medium bg-custom-1 dark:bg-custom-1 ${isLoading.email ? "opacity-70 cursor-not-allowed" : ""} sm:px-6`}
                    >
                      {isLoading.email ? "Mise à jour..." : "Mettre à jour"}
                    </button>
                    {formStatus.email.success && (
                      <div className="p-3 bg-custom-1/10 dark:bg-custom-1-dark/30 rounded-lg text-custom-1 dark:text-custom-1-dark text-sm">
                        {formStatus.email.success}
                      </div>
                    )}
                    {formStatus.email.error && (
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300 text-sm">
                        {formStatus.email.error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Changer le mot de passe</h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Ancien mot de passe"
                      className="p-4 rounded-lg border w-full bg-gray-50 border-gray-300 hover:cursor-pointer
                      dark:bg-gray-900 dark:border-gray-600 dark:hover:border-gray-400 focus:ring-2 focus:ring-custom-1 focus:outline-none sm:p-3"
                      value={passwords.oldPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, oldPassword: e.target.value })
                      }
                    />
                    <input
                      type="password"
                      placeholder="Nouveau mot de passe (min. 6 caractères)"
                      className="p-4 rounded-lg border w-full bg-gray-50 border-gray-300 hover:cursor-pointer
                      dark:bg-gray-900 dark:border-gray-600 dark:hover:border-gray-400 focus:ring-2 focus:ring-custom-1 focus:outline-none sm:p-3"
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, newPassword: e.target.value })
                      }
                    />
                    <button
                      onClick={handleChangePassword}
                      disabled={isLoading.password}
                      className={`px-4 py-3 text-white rounded-lg font-medium bg-custom-1 dark:bg-custom-1 ${isLoading.password ? "opacity-70 cursor-not-allowed" : ""} sm:px-6`}
                    >
                      {isLoading.password ? "Mise à jour..." : "Mettre à jour"}
                    </button>
                    {formStatus.password.success && (
                      <div className="p-3 bg-custom-1/10 dark:bg-custom-1-dark/10 rounded-lg text-custom-1 dark:text-custom-1-dark text-sm">
                        {formStatus.password.success}
                      </div>
                    )}
                    {formStatus.password.error && (
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300 text-sm">
                        {formStatus.password.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* PRIVACY SECTION - RGPD Compliance */}
          {activeSection === "privacy" && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-3">
                  <Icon name="secure" size={24} />
                  Confidentialité et RGPD
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Vos droits et nos engagements en matière de protection des données personnelles
                </p>
              </div>

              {/* User Rights Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Vos droits RGPD</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
                  </p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside">
                    <li>Droit d&apos;accès à vos données personnelles</li>
                    <li>Droit de rectification des données inexactes</li>
                    <li>Droit à l&apos;effacement de vos données (droit à l&apos;oubli)</li>
                    <li>Droit à la portabilité de vos données</li>
                    <li>Droit d&apos;opposition au traitement de vos données</li>
                    <li>Droit de retirer votre consentement à tout moment</li>
                  </ul>
                </div>

                {/* Data Collection Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Données que nous collectons</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Dans le cadre de notre application de gestion de véhicules, nous collectons les données suivantes :
                  </p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside">
                    <li>Informations de compte (email, mot de passe chiffré)</li>
                    <li>Données relatives à vos véhicules (marque, modèle, année, etc.)</li>
                    <li>Historique de consommation de carburant et kilométrage</li>
                    <li>Données techniques nécessaires au fonctionnement de l&apos;application</li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    <strong>Finalité :</strong> Ces données sont utilisées uniquement pour vous fournir le service de suivi de consommation et de gestion de votre parc automobile.
                  </p>
                </div>

                {/* Data Security */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Sécurité de vos données</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données personnelles contre la destruction, la perte, l&apos;altération, la divulgation non autorisée ou l&apos;accès accidentel.
                  </p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside">
                    <li>Chiffrement des données sensibles</li>
                    <li>Authentification sécurisée via Supabase Auth</li>
                    <li>Stockage des données dans des centres de données sécurisés</li>
                    <li>Politique de conservation limitée des données</li>
                  </ul>
                </div>

                {/* Data Export Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Exporter vos données</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Vous pouvez exporter toutes vos données personnelles au format JSON pour les conserver ou les transférer vers un autre service.
                  </p>
                  <button
                    onClick={exportUserData}
                    disabled={exportingData}
                    className={`px-4 py-3 text-white rounded-lg bg-custom-1 hover:bg-custom-1-hover font-medium flex items-center gap-2 ${exportingData ? "opacity-70 cursor-not-allowed" : "hover:cursor-pointer"}`}
                  >
                    <Icon name="add" size={18} className="invert dark:invert-0" />
                    {exportingData ? "Export en cours..." : "Exporter mes données"}
                  </button>
                  {exportSuccess && (
                    <div className={`p-3 rounded-lg text-sm mt-3 ${exportSuccess.includes("Erreur") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {exportSuccess}
                    </div>
                  )}
                </div>

                {/* Account Deletion Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Supprimer mon compte</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Vous pouvez supprimer définitivement votre compte et toutes vos données associées. Cette action est irréversible.
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4 flex items-start gap-3">
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                      La suppression de votre compte entraînera la perte définitive de toutes vos données (véhicules, historique de consommation, etc.). Cette action ne peut pas être annulée.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deletingAccount}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 hover:cursor-pointer
                      ${deletingAccount
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"}`}
                  >
                    <Icon name="delete" size={18} className="invert dark:invert-0" />
                    {deletingAccount ? "Suppression en cours..." : "Supprimer mon compte"}
                  </button>
                  {deleteSuccess && (
                    <div className={`p-3 rounded-lg text-sm mt-3 ${deleteSuccess.includes("Erreur") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {deleteSuccess}
                    </div>
                  )}

                  {/* Delete Confirmation Dialog */}
                  {showDeleteConfirm && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Confirmation de suppression</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Pour confirmer la suppression de votre compte, veuillez taper : <strong>&quot;SUPPRIMER MON COMPTE&quot;</strong>
                      </p>
                      <input
                        type="text"
                        className="p-3 rounded-lg border w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-red-500 focus:outline-none mb-3 hover:cursor-text"
                        placeholder="Tapez SUPPRIMER MON COMPTE pour confirmer"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleAccountDeletion}
                          disabled={deletingAccount}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-white hover:cursor-pointer 
                            ${deletingAccount ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                        >
                          Confirmer la suppression
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmation("");
                          }}
                          disabled={deletingAccount}
                          className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors bg-gray-200  dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 hover:cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Data Controller & Hosting */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                    Responsable du traitement & hébergement
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Le responsable du traitement des données personnelles collectées via l&apos;application
                    <strong> Ma Voiture Sandy</strong> est :
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-1">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Alexandre Robert — Projet « Ma Voiture Sandy »
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Email de contact : alexandre.robert.127@gmail.com
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Localisation : France
                    </p>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    L&apos;application est hébergée par des prestataires techniques respectant le RGPD :
                  </p>

                  <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-400 space-y-1">
                    <li>
                      <strong>Vercel Inc.</strong> - Hébergement du site web et gestion du nom de domaine
                    </li>
                    <li>
                      <strong>Supabase Inc.</strong> - Authentification et stockage sécurisé des données
                    </li>
                  </ul>

                  <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">
                    Ces prestataires agissent en tant que sous-traitants au sens du RGPD et
                    mettent en œuvre des mesures de sécurité conformes aux standards européens.
                  </p>
                </div>

                {/* Consent Management */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Gestion du consentement</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    En utilisant notre application, vous consentez au traitement de vos données personnelles conformément à notre politique de confidentialité. Vous pouvez retirer votre consentement à tout moment en supprimant votre compte.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    <strong>Durée de conservation :</strong> Vos données sont conservées aussi longtemps que votre compte est actif, sauf demande explicite de suppression.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* LOGOUT SECTION */}
          {activeSection === "logout" && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-3">
                <Icon name="garage" size={24} />
                Déconnexion
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Vous pouvez vous déconnecter de votre compte à tout moment. Vous devrez vous reconnecter pour accéder à vos données.
              </p>
              <LogoutButton className="w-full" />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}