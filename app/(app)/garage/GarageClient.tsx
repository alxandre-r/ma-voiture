'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import VehicleList from '@/components/vehicle/VehicleList';
import AddVehicleModal from '@/components/vehicle/VehicleModal';
import Icon from '@/components/ui/Icon';
import { Vehicle } from '@/types/vehicle';


export default function GarageClient({ userVehicles, familyVehicles }: { userVehicles: Vehicle[], familyVehicles: Vehicle[] }) {
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Modal ouverture selon search param ---
  useEffect(() => {
    if (searchParams.get('addVehicle') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // --- Empty garage (personnel) ---
  if (userVehicles.length === 0) {
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

        <AddVehicleModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    );
  }

  // --- Garage complet ---
  return (
    <main className="space-y-6">
      <VehicleList vehicles={userVehicles} familyVehicles={familyVehicles || []} />

      {/* Add vehicle button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-3 bg-custom-1 text-white rounded-lg hover:bg-custom-1-hover hover:cursor-pointer flex items-center gap-2 transition-all duration-200 sm:px-6 sm:py-3"
        aria-label="Ajouter un véhicule"
      >
        <Icon name="add" size={20} className="invert dark:invert-0" />
        <span className="font-medium">Ajouter un véhicule</span>
      </button>

      <AddVehicleModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}