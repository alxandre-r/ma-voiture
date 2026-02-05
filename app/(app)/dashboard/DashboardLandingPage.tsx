'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

export default function DashboardLandingPage() {
  return (
    <div className="min-h-screen pb-32">
      {/* Welcome Section */}
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Bienvenue dans Ma Voiture Sandy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Gérez vos véhicules et suivez votre consommation de carburant en un seul endroit.
          </p>
          <a
            href="/garage?addVehicle=true"
            className="inline-flex items-center gap-2 px-8 py-4 bg-custom-1 hover:bg-custom-1-hover text-white rounded-lg font-semibold transition-all duration-200"
          >
            <Icon name="add" className="invert dark:invert-0" size={20} />
            Ajouter votre premier véhicule
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-white rounded-xl dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Découvrez les fonctionnalités
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Dashboard', desc: 'Visualisez vos statistiques et votre consommation en temps réel', link: '/dashboard' },
              { title: 'Garage', desc: 'Gérez tous vos véhicules et leurs informations détaillées', link: '/garage' },
              { title: 'Consommations', desc: 'Analysez votre consommation de carburant sur plusieurs périodes', link: '/consommations' },
              { title: 'Famille', desc: 'Partagez vos véhicules avec les autres membres de votre famille', link: '/famille' },
            ].map((feature, i) => (
              <div
                key={i}
                onClick={() => (window.location.href = feature.link)}
                className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 shadow-md hover:shadow-custom-2 transition-shadow duration-300 cursor-pointer"
              >
                <h3 className="text-xl font-semibold mb-2 text-custom-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Personnalisez votre expérience
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Modifiez votre thème, vos préférences et les paramètres de votre compte.
          </p>
          <a
            href="/settings"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-custom-1 text-gray-700 dark:text-white rounded-lg font-semibold hover:bg-custom-1 hover:text-white dark:hover:bg-custom-1 transition-all duration-200 group"
          >
            <Icon name="settings" className="group-hover:invert dark:group-hover:invert-0" size={20} />
            Accéder aux paramètres
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-custom-2 rounded-xl">
        <h2 className="text-3xl font-bold mb-4 text-white">
          Prêt à commencer ?
        </h2>
        <p className="text-lg text-white mb-8">
          Ajoutez votre premier véhicule et commencez à suivre vos pleins dès aujourd&apos;hui.
        </p>
        <a
          href="/garage?addVehicle=true"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-custom-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200"
        >
          Ajouter un véhicule
        </a>
      </div>
    </div>
  );
}

