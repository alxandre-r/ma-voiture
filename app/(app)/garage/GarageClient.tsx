'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useVehicles } from '@/contexts/VehicleContext';

import VehicleList from '@/components/vehicle/VehicleList';
import VehicleModal from '@/components/vehicle/VehicleModal';
import Icon from '@/components/ui/Icon';

export default function GarageClient() {
  const { vehiclesFull, loading, error } = useVehicles();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('addVehicle') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // State : Loading
  if (loading) {
    return <div className="text-center py-8">Chargement des véhicules...</div>;
  }

  // State : Error
  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Erreur : {error}
      </div>
    );
  }

  // State : Empty garage
  if (vehiclesFull.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Votre garage est vide
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
          Ajoutez votre premier véhicule pour commencer à suivre vos pleins,
          votre consommation et vos statistiques.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-8 py-4 bg-custom-1 hover:bg-custom-1-hover text-white rounded-lg font-semibold transition-all duration-200"
        >
          <Icon name="add" size={20} className="invert dark:invert-0" />
          Ajouter un véhicule
        </button>

        <VehicleModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    );
  }

  // Normal garage
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Vos véhicules
      </h1>

      {/* Vehicle list */}
      <div className="space-y-6">
        {vehiclesFull.map((vehicle) => (
          <div key={vehicle.vehicle_id}>
            <VehicleList vehicles={[vehicle]} />
          </div>
        ))}
      </div>

      {/* Add vehicle button */}
      <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-3 bg-custom-1 text-white rounded-lg hover:bg-custom-1-hover hover:cursor-pointer flex items-center gap-2 transition-all duration-200 sm:px-6 sm:py-3"
          aria-label="Ajouter un véhicule"
      >
          <Icon name="add" size={20} className="invert dark:invert-0" />
          <span className="font-medium">Ajouter un véhicule</span>
      </button>

      <VehicleModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
