"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { VersionBlock, VersionBlockProps } from "@/components/patchnotes/versionBlock";

export default function PatchnotesSection() {

  // --- Données de patchnotes ---
  const patchnotesData: VersionBlockProps[] = [
    {
      version: "1.0.1",
      date: "08 Février 2026",
      summary: "Amélioration de l'expérience utilisateur et correction de bugs mineurs.",
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li>
            Ajout d&apos;un indice pour ajouter un plein quand un véhicule n&apos;en a pas dans le{" "}
            <Link href="/garage" className="text-indigo-600 dark:text-indigo-400 underline">
              garage
            </Link>
            . Le bouton ouvre le formulaire d&apos;ajout de plein automatiquement pour ce véhicule.
          </li>
          <li>
            Ajout d&apos;un affichage spécifique quand le{" "}
            <Link href="/garage" className="text-indigo-600 dark:text-indigo-400 underline">
              garage
            </Link>{" "}
            est vide.
          </li>
          <li>
            Ajout d&apos;un affichage spécifique dans le{" "}
            <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 underline">
              dashboard
            </Link>{" "}
            quand l&apos;utilisateur a un véhicule mais aucun plein.
          </li>
                    <li>
            Reworked la page Mon Compte dans les paramètres. L'utilisateur peut maintenant y modifier son nom.
          </li>
          <li>
            Ajuster la largeur de plusieurs inputs et boutons dans les paramètres.
          </li>
          <li>
            Ajuster la couleur du badge véhicule dans le
              <Link href="/garage" className="text-indigo-600 dark:text-indigo-400 underline">
                garage
              </Link>
              .
          </li>
          <li>
            Correction de bugs : Correction du selecteur de véhicule dans la page Dashboard. Correction d&apos;un bug lié à la fonctionnalité famille.
          </li>
          <li>
            Amélioration de l&apos;affichage mobile pour l&apos;ensemble des pages.
          </li>

        </ul>
      ),
      type: "minor",
    },
    {
      version: "1.0.0",
      date: "04 Février 2026",
      summary:
        "Refonte de la base de données, simplification du backend, refonte des composants véhicules, et amélioration de l&apos;expérience utilisateur.",
      details: (
        <div className="space-y-6">
          {/* Frontend / UX */}
          <div>
            <h4 className="text-lg font-semibold mb-1">Interface et expérience utilisateur</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 underline">
                  Dashboard
                </Link>{" "}
                : landing page si aucun véhicule.
              </li>
              <li>
                Bouton qui ouvre directement le formulaire.{" "}
                <Link href="/garage?addVehicle=true" className="text-indigo-600 dark:text-indigo-400 underline">
                  Essayez
                </Link>
                !
              </li>
              <li>
                Refonte visuelle des <strong>VehicleCards</strong> et du formulaire d&apos;édition de véhicule.{" "}
                <Link href="/garage" className="text-indigo-600 dark:text-indigo-400 underline">
                  Voir le garage
                </Link>
                .
              </li>
              <li>Modal de formulaire d&apos;ajout et d&apos;édition basé sur le composant générique Modal.</li>
              <li>Ajout de la page patchnotes dans les paramètres, avec résumé et détails des changements.</li>
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

          {/* Backend / API */}
          <div>
            <h4 className="text-lg font-semibold mb-1">Backend / API</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Simplification de l&apos;api concernant les véhicules.</li>
              <li>Modification de plusieurs endpoints pour utiliser les nouvelles vues.</li>
            </ul>
          </div>

          {/* Composants et types */}
          <div>
            <h4 className="text-lg font-semibold mb-1">Composants et types</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Normalisation des commentaires et overview dans les fichiers véhicules.</li>
              <li><code>VehicleEditForm</code> : appels API indépendants et refonte visuelle.</li>
              <li>Refonte de la page paramètres qui utilise maintenant un fichier par section.</li>
            </ul>
          </div>
        </div>
      ),
      type: "major",
    },
    {
      version: "À venir",
      date: "",
      summary: "Prochaines fonctionnalités et améliorations prévues",
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li className="font-semibold text-gray-900 dark:text-gray-100 list-none">Dashboard & Véhicules</li>
          <li>Améliorer l&apos;affichage du <strong>FillEdit</strong>.</li>
          <li>Page <strong>Consommations</strong> : Ajouter l&apos;icône de tri et afficher les KM parcourus.</li>

          <li className="font-semibold text-gray-900 dark:text-gray-100 list-none mt-3">Notifications & Historique</li>
          <li>Utiliser les <strong>Notifications</strong> dans la page <Link href="/history" className="text-indigo-600 dark:text-indigo-400 underline">History</Link> (Edit, Delete).</li>

          <li className="font-semibold text-gray-900 dark:text-gray-100 list-none mt-3">API & Backend</li>
          <li>Simplification du code de <code>api/vehicles/get</code> permettant de get les véhicules de l&apos;user et des membres de la famille en une seule requête.</li>

          <li className="font-semibold text-gray-900 dark:text-gray-100 list-none mt-3">Famille</li>
          <li>Page <strong>Famille</strong> : Restreindre l&apos;invitation au propriétaire uniquement.</li>
          <li>Correction du formulaire d&apos;invitation</li>

          <li className="font-semibold text-gray-900 dark:text-gray-100 list-none mt-3">Nouvelles fonctionnalités</li>
          <li>Implémenter l&apos;<strong>assurance de véhicule</strong> avec informations et historique.</li>
          <li>Ajouter les <strong>statistiques de coûts</strong> par véhicule et par flotte.</li>
          <li>Prise en charge des <strong>véhicules électriques</strong>.</li>
        </ul>
      ),
      type: "todo",
    },
  ];

  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Icon name="settings" size={24} />
        Notes de version
      </h2>

      {patchnotesData.map((note, index) => (
        <VersionBlock key={index} {...note} />
      ))}
    </section>
  );
}