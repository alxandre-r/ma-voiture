'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import FillModal from '@/components/fill/forms/FillModal';
import { useVehicles } from '@/contexts/VehicleContext';

export default function DashboardAddFills() {
  const { vehicles } = useVehicles();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Prêt, feu, roulez !
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Ajoutez maintenant votre premier <strong>plein</strong> pour commencer à suivre votre
          consommation et accéder aux statistiques.
        </p>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-8 py-4 bg-custom-2 hover:bg-custom-2-hover text-white rounded-lg font-semibold transition-all duration-200 cursor-pointer"
        >
          <Icon name="add" size={20} className="invert dark:invert-0" />
          Ajouter un premier plein
        </button>
      </div>

      {/* Steps / guidance */}
      <div className="mt-16 max-w-4xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Enregistrez',
              desc: 'Saisissez le kilométrage, le carburant et le montant.',
              icon: 'edit',
            },
            {
              title: 'Analysez',
              desc: 'Visualisez votre consommation et vos dépenses.',
              icon: 'chart',
            },
            {
              title: 'Optimisez',
              desc: 'Suivez vos habitudes et améliorez votre conduite.',
              icon: 'car',
            },
          ].map((step, i) => (
            <div
              key={i}
              className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-center"
            >
              <Icon
                name={step.icon}
                size={28}
                className="mx-auto mb-4 text-custom-2"
              />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <FillModal
        open={open}
        onClose={() => setOpen(false)}
        vehicles={vehicles}
      />
    </div>
  );
}