'use client';

import { AddFamilyForm } from './forms/AddFamilyForm';
import { JoinFamilyForm } from './forms/JoinFamilyForm';

export default function WelcomePage() {
  return (
    <div className="min-h-screen md:py-12 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center md:mb-16 mb-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Bienvenue à bord
          </h2>
          <p className="md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Créez une famille ou rejoignez-en une pour partager vos véhicules et collaborer avec vos
            proches.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Create Family Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-custom-2 to-custom-2-hover rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-12 h-12 bg-custom-2 dark:bg-custom-2-hover/30 rounded-xl mb-6">
                <svg
                  className="w-6 h-6 text-white dark:text-custom-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Créer une famille
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">
                Lancez votre propre espace familial. Gérez les véhicules, partagez l&apos;historique
                des trajets et collaborez avec vos proches.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-custom-2 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Gestion complète de la famille
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-custom-2 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Invitez vos proches facilement
                  </span>
                </div>
              </div>

              <AddFamilyForm />
            </div>
          </div>

          {/* Join Family Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-custom-1 to-custom-1-hover rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-12 h-12 bg-custom-1 dark:bg-custom-1-hover/30 rounded-xl mb-6">
                <svg
                  className="w-6 h-6 text-white dark:text-custom-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Rejoindre une famille
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">
                Vous avez reçu une invitation ? Rejoignez la famille de vos proches en utilisant le
                code ou le lien fourni.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-custom-1 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Accès instantané aux véhicules partagés
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-custom-1 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Collaboration en temps réel
                  </span>
                </div>
              </div>

              <JoinFamilyForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
