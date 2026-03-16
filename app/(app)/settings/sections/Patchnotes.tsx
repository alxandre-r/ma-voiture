'use client';

import Link from 'next/link';

import Icon from '@/components/common/ui/Icon';
import { VersionBlock } from '@/components/patchnotes/versionBlock';

import type { VersionBlockProps } from '@/components/patchnotes/versionBlock';

export default function PatchnotesSection() {
  // --- Données de patchnotes ---
  const patchnotesData: VersionBlockProps[] = [
    {
      version: 'à venir',
      date: '',
      summary: 'Prochaines fonctionnalités et améliorations prévues',
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li className="font-semibold text-gray-900 dark:text-gray-100 list-none mt-3">
            Améliorations
          </li>
          <li>
            Amélioration de la fonctionnalité d&apos;assurance : possibilité de gérer un historique
            d&apos;assurances pour chaque véhicule, avec des dates de début et de fin, montant..
          </li>

          <li className="font-semibold text-gray-900 dark:text-gray-100 list-none mt-3">
            Nouvelles fonctionnalités
          </li>
          <li>
            Véhicules <strong>favoris</strong>. Permet de marquer un ou plusieurs véhicules comme
            favoris pour les afficher en priorité dans le
          </li>
          <li>
            Ajout de préférences utilisateur pour personnaliser l&apos;affichage du dashboard (choix
            du mode d&apos;affichage des graphiques et de la temporalité par défaut).
          </li>
          <li>
            <strong>Rappels</strong> de maintenance.
          </li>
          <li>
            Implémenter une calculatrice d&apos;itinéraire pour estimer la consommation et le coût
            d&apos;un trajet donné. Se basant sur un inpout de l&apos;utilisateur pour le nombre de
            km.
          </li>
        </ul>
      ),
      type: 'todo',
    },
    {
      version: '1.2.0',
      date: '16 Mars 2026',
      summary:
        'Ajouts des pages Statistiques, Dépenses et Maintenance. Introduction du système de dépense (Plein/Recharge, Maintenance, Assurance et Autre).',
      details: (
        <div className="space-y-6">
          {/* Frontend / UX */}
          <div>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Les filtres de véhicules et de période sont désormais présent dans le header de
                plusieurs pages et sont partagés entre ces pages : Dashboard, Statistiques, Dépenses
                et Maintenance. Les filtres permettent de filtrer les données affichées dans ces
                différentes pages selon les véhicules sélectionnés et la période choisie.
              </li>
              <li>
                <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 underline">
                  Dashboard
                </Link>{' '}
                : Retrait des graphiques au bénéfice de la page{' '}
                <Link href="/statistics" className="text-indigo-600 dark:text-indigo-400 underline">
                  Statistiques
                </Link>
                . Présente désormais les dernières dépenses.
              </li>

              <li>
                Nouvelle page{' '}
                <Link href="/statistics" className="text-indigo-600 dark:text-indigo-400 underline">
                  Statistiques
                </Link>
                . Contient des graphiques d&apos;évolution de la consommation, des dépenses et du
                kilométrage. Permet de comparer plusieurs véhicules et de visualiser la répartition
                des dépenses selon leur type.
              </li>

              <li>
                Nouvelle page{' '}
                <Link href="/expenses" className="text-indigo-600 dark:text-indigo-400 underline">
                  Dépenses
                </Link>
                . Affiche la liste de toutes les dépenses. Permet d&apos;ajouter, modifier et
                supprimer une dépense.
              </li>
              <li>
                Nouvelle page{' '}
                <Link
                  href="/maintenance"
                  className="text-indigo-600 dark:text-indigo-400 underline"
                >
                  Maintenance
                </Link>
                . Affiche la liste de tous les entretiens. Permet d&apos;ajouter, modifier et
                supprimer un entretien.
              </li>
              <li>
                <Link href="/garage" className="text-indigo-600 dark:text-indigo-400 underline">
                  Garage
                </Link>{' '}
                : Refonte visuelle de la liste de véhicule, fonctionnant maintenant en cards. Ajout
                de la fonctionnalité de photo de véhicule, statut actif/inactif, assurance,
                Entretien et contrôle technique, ainsi que des informations relatives au financement
                (prix d&apos;achat ou loyer mensuel selon le mode de financement).
              </li>
              <li>
                <Link href="/family" className="text-indigo-600 dark:text-indigo-400 underline">
                  Famille
                </Link>{' '}
                : Refonte pour un affichage en forme de card pour les membres.
              </li>
              <li>
                Ajout de la possibilité d&apos;ajouter et modifier sa photo de profil dans la page
                Mon Compte des {''}
                <Link href="/settings" className="text-indigo-600 dark:text-indigo-400 underline">
                  Paramètres
                </Link>
                .
              </li>
            </ul>
          </div>
        </div>
      ),
      type: 'major',
    },
    {
      version: '1.1.1',
      date: '01 Mars 2026',
      summary: 'Correctifs mineurs et optimisations visuelles',
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li>
            Modification de la notification après une action : plus grande et plus moderne. Supporte
            l&apos;affichage mobile.
          </li>
          <li>
            La page de connexion utilise désormais les notifications pour afficher les messages
            d&apos;erreur.
          </li>
          <li>Ajuster les couleurs en mode sombre dans la page Famille.</li>
          <li>
            Meilleure séparation entre les véhicules partagés et les véhicules personnels dans le
            garage.
          </li>
          <li>
            Ajout d&apos;un indicateur de chargement dans certains boutons (la totalité des boutons
            doit encore être revus).
          </li>

          <li>
            Correction d&apos;une erreur lorsqu&apos;un utilisateur tente de rejoindre une famille.
          </li>
          <li>
            Prise en charge du cas suivant : l&apos;utilisateur valide le formulaire de modification
            d&apos;un véhicule sans faire de modification. Dans ce cas, le formulaire se ferme et
            une notification informe l&apos;utilisateur qu&apos;aucune modification n&apos;a été
            apportée.
          </li>
        </ul>
      ),
      type: 'minor',
    },
    {
      version: '1.1.0',
      date: '23 Février 2026',
      summary: 'Optimisation de la performance et UX',
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li>
            Optimisation côté server pour charger les pages plus rapidement, valable pour toutes les
            pages
          </li>
          <li>Ajouts de placeholders lorsque les données sont en chargement</li>
          <li>
            Amélioration de l&apos;affichage de l&apos;historique des pleins (pages Dashboard et
            Consommations)
          </li>
          <li>Ajout de retour visuel lors de diverses actions</li>
          <li>Correction de bug à la copie du token d&apos;invitation de la famille</li>
          <li>Correction des droits pour les membres de la famille sur les véhicules partagés</li>
          <li>
            Changer le mode d&apos;affichage par défaut du graphique de l&apos;évolution du
            kilométrage de &apos;Total&apos; à &apos;Normalisé&apos;
          </li>
        </ul>
      ),
      type: 'minor',
    },
    {
      version: '1.0.4',
      date: '17 Février 2026',
      summary: 'Refonte des graphiques du dashboard',
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li>
            Refonte complète des graphiques du dashboard : nouveau design, nouvelles animations,
            infobulles et support multi-véhicules.
          </li>
          <li>
            Ajout d&apos;un switch pour basculer entre la vue par plein et la vue mensuelle dans le
            graphique de consommation.
          </li>
          <li>
            Ajout d&apos;un switch de temporalité pour choisir la période affichée dans les
            graphiques du dashboard (3 derniers mois, 6 derniers mois, 12 derniers mois).
          </li>
          <li>Amélioration de l&apos;affichage mobile des graphiques.</li>
          <li>
            Ajout de la possibilité de modifié la couleur d&apos;un véhicule. Cette couleur est
            utilisée dans les graphiques du dashboard.
          </li>
        </ul>
      ),
      type: 'minor',
    },
    {
      version: '1.0.3',
      date: '11 Février 2026',
      summary: 'Améliorations des fonctionnalités liées au compte utilisateur.',
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li>
            A l&apos;inscription, ajout d&apos;un champ pour le nom de l&apos;utilisateur. Ce nom
            est utilisé pour les fonctionnalités de famille et modifiable depuis la page Paramètres
            &gt; Mon compte.
          </li>
          <li>
            Possibilité de supprimer son compte depuis la page Paramètres &gt; Confidentialité.
            Cette action supprime l&apos;utilisateur de la base de données et invalide sa session.
          </li>
        </ul>
      ),
      type: 'minor',
    },
    {
      version: '1.0.2',
      date: '09 Février 2026',
      summary: 'Améliorations mineures.',
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li>
            Page{' '}
            <Link href="/history" className="text-indigo-600 dark:text-indigo-400 underline">
              Historique
            </Link>{' '}
            : Amélioration de l&apos;affichage mobile des filtres. Ajout des kilomètres parcourus
            dans les statistiques.{' '}
          </li>
          <li> Rework visuel de l&apos;édition d&apos;un plein, support mobile.</li>
        </ul>
      ),
      type: 'minor',
    },
    {
      version: '1.0.1',
      date: '08 Février 2026',
      summary: "Amélioration de l'expérience utilisateur et correction de bugs mineurs.",
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li>
            Ajout d&apos;un indice pour ajouter un plein quand un véhicule n&apos;en a pas dans le{' '}
            <Link href="/garage" className="text-indigo-600 dark:text-indigo-400 underline">
              garage
            </Link>
            . Le bouton ouvre le formulaire d&apos;ajout de plein automatiquement pour ce véhicule.
          </li>
          <li>
            Ajout d&apos;un affichage spécifique quand le{' '}
            <Link href="/garage" className="text-indigo-600 dark:text-indigo-400 underline">
              garage
            </Link>{' '}
            est vide.
          </li>
          <li>
            Ajout d&apos;un affichage spécifique dans le{' '}
            <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 underline">
              dashboard
            </Link>{' '}
            quand l&apos;utilisateur a un véhicule mais aucun plein.
          </li>
          <li>
            Reworked la page Mon Compte dans les paramètres. L&apos;utilisateur peut maintenant y
            modifier son nom.
          </li>
          <li>Ajuster la largeur de plusieurs inputs et boutons dans les paramètres.</li>
          <li>
            Ajuster la couleur du badge véhicule dans le
            <Link href="/garage" className="text-indigo-600 dark:text-indigo-400 underline">
              garage
            </Link>
            .
          </li>
          <li>
            Correction de bugs : Correction du selecteur de véhicule dans la page Dashboard.
            Correction d&apos;un bug lié à la fonctionnalité famille.
          </li>
          <li>Amélioration de l&apos;affichage mobile pour l&apos;ensemble des pages.</li>
        </ul>
      ),
      type: 'minor',
    },
    {
      version: '1.0.0',
      date: '04 Février 2026',
      summary:
        "Introduction des patchnotes. Refonte de la base de données, simplification du backend, refonte des composants véhicules, et amélioration de l'expérience utilisateur.",
      details: (
        <div className="space-y-6">
          {/* Frontend / UX */}
          <div>
            <h4 className="text-lg font-semibold mb-1">Interface et expérience utilisateur</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 underline">
                  Dashboard
                </Link>{' '}
                : landing page si aucun véhicule.
              </li>
              <li>
                Bouton qui ouvre directement le formulaire.{' '}
                <Link
                  href="/garage?addVehicle=true"
                  className="text-indigo-600 dark:text-indigo-400 underline"
                >
                  Essayez
                </Link>
                !
              </li>
              <li>
                Refonte visuelle des <strong>VehicleCards</strong> et du formulaire d&apos;édition
                de véhicule.{' '}
                <Link href="/garage" className="text-indigo-600 dark:text-indigo-400 underline">
                  Voir le garage
                </Link>
                .
              </li>
              <li>
                Modal de formulaire d&apos;ajout et d&apos;édition basé sur le composant générique
                Modal.
              </li>
              <li>
                Ajout de la page patchnotes dans les paramètres, avec résumé et détails des
                changements.
              </li>
            </ul>
          </div>

          {/* Base de données */}
          <div>
            <h4 className="text-lg font-semibold mb-1">Base de données / Vues</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Suppression de toutes les vues existantes et création de 3 nouvelles vues pour le
                front : <code>vehicle</code>, <code>fill</code>, <code>family</code>.
              </li>
              <li>
                Modification de la plupart des tables, intégration de <code>family_id</code> dans la
                table <code>users</code>.
              </li>
              <li>
                Calcul automatique du <code>last_fill</code> du véhicule directement en base.
              </li>
              <li>
                Calcul automatique du <code>calculated_consumption</code> des véhicules directement
                en base.
              </li>
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
              <li>
                <code>VehicleEditForm</code> : appels API indépendants et refonte visuelle.
              </li>
              <li>Refonte de la page paramètres qui utilise maintenant un fichier par section.</li>
            </ul>
          </div>
        </div>
      ),
      type: 'major',
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
