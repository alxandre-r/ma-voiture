"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

export default function PatchnotesSection() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Icon name="settings" size={24} />
        Notes de version
      </h2>

      {/* Résumé de l'update */}
      <div className="bg-custom-2/10 dark:bg-custom-2/10 border-l-4 border-custom-2 p-4 rounded-lg shadow-sm space-y-2">
        <h3 className="text-xl font-semibold text-custom-2">
          Version 1.0.0 - 04 Février 2026
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Refonte de la base de données, simplification du backend, refonte des composants véhicules, et amélioration de l&apos;expérience utilisateur.
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>Gestion automatique du dernier plein de vos véhicules.</li>
          <li>Ajout et édition de véhicules simplifiés et plus visuels.</li>
          <li>Dashboard amélioré avec landing page si vous n&apos;avez pas encore de véhicule.</li>
        </ul>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700/50 rounded-lg
          dark:hover:bg-custom-2/80 font-medium transition-colors hover:cursor-pointer"
        >
          {showDetails ? "Masquer le détail" : "Voir le détail"}
          <Icon name={showDetails ? "arrow-up" : "arrow-down"} size={18} />
        </button>
      </div>

      {/* Détails */}
      {showDetails && (
        <div className="space-y-6 text-gray-700 dark:text-gray-300 mt-4">
          {/* Frontend / UX */}
          <div>
            <h4 className="text-lg font-semibold mb-1">Interface et expérience utilisateur</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 underline">Dashboard</Link> : landing page si aucun véhicule.
              </li>
              <li>
                Bouton qui ouvre directement le formulaire. <Link href="/garage?addVehicle=true" className="text-indigo-600 dark:text-indigo-400 underline">Essayez </Link>!
              </li>
              <li>Refonte visuelle des <strong>VehicleCards</strong> et du formulaire d&apos;édition de véhicule. <Link href="/garage" className="text-indigo-600 dark:text-indigo-400 underline">Voir le garage</Link>.</li>
              <li>Modal de formulaire d&apos;ajout et édition basé sur le composant générique Modal.</li>
              <li>Ajout de la page patchnotes dans les paramètres, avec résumé et détails des changements.</li>
            </ul>
          </div>

          {/* Backend / API */}
          <div>
            <h4 className="text-lg font-semibold mb-1">Backend / API</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Simplification de <code>api/vehicles/update</code> (122 → 79 lignes).</li>
              <li>API <code>api/vehicles/add</code>, <code>api/fills/*</code> et <code>api/family/*</code> utilisent maintenant <code>owner_id</code> au lieu de <code>owner</code>.</li>
              <li>API <code>api/vehicles/get</code> et <code>api/vehicles/get/family_vehicules</code> utilisent la vue <code>vehicle_for_display</code>.</li>
              <li>API <code>api/family/members</code> utilise la vue <code>family_to_display</code>.</li>
              <li>API <code>api/auth/check-email</code> et <code>api/auth/sign-up</code> utilisent la table <code>users</code> au lieu de <code>users_profile</code>.</li>
            </ul>
          </div>

          {/* Base de données */}
          <div>
            <h4 className="text-lg font-semibold mb-1">Base de données / Vues</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Suppression de toutes les vues existantes et création de 3 nouvelles vues pour le front : <code>vehicle</code>, <code>fill</code>, <code>family</code>.</li>
              <li>Modification de la plupart des tables, intégration de <code>family_id</code> dans la table <code>users</code>.</li>
              <li>Calcul automatique du <code>last_fill</code> du véhicule directement en base.</li>
              <li>Calcul automatique du <code>calculated_consumption</code> des véhicules directement en base.</li>
            </ul>
          </div>

          {/* Composants et types */}
          <div>
            <h4 className="text-lg font-semibold mb-1">Composants et types</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Normalisation des commentaires et overview dans les fichiers véhicules.</li>
              <li>Refonte des types : <code>family</code>, <code>fill</code>, <code>vehicle</code> et ajout du type <code>user</code>.</li>
              <li>Déplacement de <code>VehicleAddForm</code> et <code>VehicleEditForm</code> dans <code>/vehicle/forms</code>.</li>
              <li><code>VehicleEditForm</code> : appels API indépendants et refonte visuelle.</li>
              <li><code>VehicleCard</code> gère maintenant l&apos;édition et suppression ; suppression de <code>VehicleCardReadOnly</code>.</li>
              <li>Suppression de <code>VehicleListState</code> ; contenu intégré dans <code>VehicleList</code>.</li>
              <li><code>FamilyMemberList</code> mis à jour pour utiliser la vue <code>family_for_display</code>.</li>
              <li>Refonte de la page paramètres qui utilise maintenant un fichier par section</li>.
            </ul>
          </div>
        </div>
      )}

    {/* À venir / TODO */}
    <div className="bg-custom-1/10 border-l-4 border-custom-1 p-4 rounded-lg shadow-sm space-y-2">
        <h4 className="text-lg font-semibold text-custom-1 mb-2">À venir / Prochaines fonctionnalités</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            <li>Corriger l'affichage des données avec le bouton des véhicule dans le <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 underline">Dashboard</Link>.</li>
            <li>Ajouter des checkboxes dans le <strong>FillFilter</strong> des véhicules.</li>
            <li>Utiliser les <strong>Notifications</strong> dans la page <Link href="/history" className="text-indigo-600 dark:text-indigo-400 underline">History</Link> (Edit, Delete).</li>
            <li>Améliorer l&apos;affichage du <strong>FillEdit</strong>.</li>
            <li>Dans <Link href="/settings" className="text-indigo-600 dark:text-indigo-400 underline">Settings</Link>, possibilité de modifier le nom d&apos;utilisateur.</li>
            <li>Utiliser les <strong>Notifications</strong> dans la page <strong>Settings</strong> (Edit Email, mot de passe, nom).</li>
            <li>Unifier <code>api/vehicles/get</code> et <code>api/vehicles/get/family_vehicles</code> sous <code>api/vehicles/get</code> à partir de <code>vehicles_for_display</code>.</li>
        </ul>
    </div>
    </section>
  );
}