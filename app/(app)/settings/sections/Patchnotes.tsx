'use client';

import Link from 'next/link';

import { VersionBlock } from '@/app/(app)/settings/components/versionBlock';
import Icon from '@/components/common/ui/Icon';

import type { VersionBlockProps } from '@/app/(app)/settings/components/versionBlock';

export default function PatchnotesSection() {
  // --- Données de patchnotes ---
  const patchnotesData: VersionBlockProps[] = [
    {
      version: 'à venir',
      date: 'Prochainement',
      summary:
        'Fonctionnalité de trajets, exports de données, compte rendu financier prenant compte du financement du véhicule, et plus encore !',
      type: 'todo',
    },
    {
      version: '1.2.4',
      date: '08 Avril 2026',
      summary:
        "Ajout des dépenses 'Autre', possibilité de rejoindre plusieurs familles et gestion des droits",
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li>
            Ajout de la fonctionnalité de <strong>Gestion des droits</strong> pour chaque membres
            d&apos;une famille sur ces véhicules partagés : l&apos;utilisateur peut choisir pour
            chaque membre de la famille s&apos;il a accès en lecture ou en écriture sur les
            véhicules partagés. Les membres avec accès en lecture peuvent voir les données des
            véhicules partagés mais ne peuvent pas les modifier, tandis que les membres avec accès
            en écriture ont la possibilité de modifier les données des véhicules partagés.
          </li>
          <li>
            Ajout de la possibilité de rejoindre plusieurs familles. Un utilisateur peut désormais
            être membre de plusieurs familles, ce qui lui permet d&apos;avoir accès aux véhicules
            partagés de chacune de ces familles.
          </li>
          <li>
            Ajout d&apos;un nouveau type de dépense : <strong>Autre</strong>. Ce type de dépense
            permet de catégoriser les dépenses qui ne sont pas des pleins, des entretiens ou des
            assurances, comme par exemple les accessoires, les amendes, le lavage, les parkings,
            péages, etc.
          </li>
          <li>
            Amélioration des <strong>filtres</strong> pour permettre de filtrer les données selon la
            famille sélectionnée et la période personnalisée au jour près choisie.
          </li>
          <li>Meilleure intégration des boutons d&apos;ajout dans les différentes pages.</li>
          <li>
            Redesign des cards de statistiques des pages dashboard, statistiques, dépenses et
            assurance pour une meilleure lisibilité, une meilleure hiérarchie visuelle des
            informations et une cohérence entre les différentes pages.
          </li>
          <li>
            Adoption d&apos;une nouvelle font pour l&apos;ensemble de l&apos;application pour une
            meilleure lisibilité et une apparence plus moderne.
            <br />
            Font utilisée : <strong>HarmonyOS Sans</strong>.
          </li>
          <li>Amélioration visuelle de la sidebar.</li>
          <li>
            Correction d&apos;un bug qui empêchait l&apos;affichage des animations d&apos;entrée des
            éléments dans certaines pages.
          </li>
        </ul>
      ),
      type: 'minor',
    },
    {
      version: '1.2.3',
      date: '31 Mars 2026',
      summary: 'Pièces jointes, préférences, améliorations visuelles',
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li className="font-semibold text-gray-900 dark:text-gray-100 list-none mt-3">
            Nouvelles fonctionnalités
          </li>
          <li>
            Ajout des <strong>pièces jointes</strong> sur toutes les dépenses, les véhicules et les
            entrées d&apos;entretien.
          </li>
          <li>
            Nouveau système de <strong>préférences</strong> : depuis Paramètres → Préférences, il
            est désormais possible de choisir le filtre appliqué par défaut, et de personnaliser ce
            qui est partagé avec les membres de la famille (chaque type d&apos;information peut être
            activé ou désactivé individuellement).
          </li>

          <li className="font-semibold text-gray-900 dark:text-gray-100 list-none mt-3">
            Améliorations visuelles
          </li>
          <li>
            Refonte de la vue d&apos;ensemble des statistiques : nouveau design des cartes et ajout
            d&apos;une carte <strong>Coût au km</strong>.
          </li>
          <li>Améliorations visuelles sur la page Assurance pour une meilleure lisibilité.</li>

          <li className="font-semibold text-gray-900 dark:text-gray-100 list-none mt-3">
            Correctifs
          </li>
          <li>Assurance : l&apos;affichage pouvait être incorrect dans certains cas.</li>
          <li>Assurance : des mensualités en double pouvaient apparaître.</li>
          <li>
            Filtre véhicule : le libellé de la sélection en cours n&apos;était pas toujours correct.
          </li>
        </ul>
      ),
      type: 'minor',
    },
    {
      version: '1.2.2',
      date: '26 Mars 2026',
      summary: 'Ajout des Rappels, améliorations UX, mobile',
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li>
            Ajout de la fonctionnalité de <strong>Rappels</strong> pour les tâches de maintenance.
            Permet de créer des rappels récurrents basés sur le temps (ex: tous les 6 mois) ou le
            kilométrage (ex: tous les 10 000 km). Les rappels sont affichés dans la page Maintenance
            et peuvent être marqués comme accomplis ou supprimés.
          </li>
          <li>
            Ajout d&apos;un indicateur de santé du véhicule dans la page de détail du véhicule, basé
            sur les données de maintenance (Contrôle technique à jour, entretiens récents, etc).
          </li>
          <li>
            Ajout d&apos;une statistique sur l&apos;empreinte carbone dans la page statistiques,
            basée sur les données de consommation et le CO2 émis par litre d&apos;essence/diesel ou
            kWh consommé par le véhicule (nouveau champ présent dans les données du véhicule).
          </li>
          <li>Amélioration de l&apos;affichage mobile pour l&apos;ajout de dépenses.</li>
        </ul>
      ),
      type: 'minor',
    },
    {
      version: '1.2.1',
      date: '18 Mars 2026',
      summary: 'Correctifs mineurs et optimisations visuelles',
      details: (
        <ul className="list-disc list-inside space-y-1">
          <li>
            Correction d&apos;un bug dans la liste des interventions de la page Maintenance qui
            empêchait l&apos;affichage de certains véhicules.
          </li>
          <li>
            Ajout d&apos;un bouton &apos;Quitter la famille&apos; pour les membres non propriétaires
            dans la page de gestion de la famille. Les membres propriétaires ont désormais un bouton
            &apos;Supprimer la famille&apos; qui supprime la famille et tous les véhicules partagés
            associés ainsi qu&apos;un bouton &apos;Renommer la famille&apos; pour modifier le nom de
            la famille.
          </li>
          <li>
            Prise en charge du cas où un user n&apos;a pas de véhicule : les pages redirigent vers
            le garage pour ajouter un véhicule.
          </li>
          <li>
            Amélioration de l&apos;affichage mobile de la page garage (vues détail et forumulaire).
          </li>
        </ul>
      ),
      type: 'minor',
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
