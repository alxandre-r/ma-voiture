'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVehicles } from '@/contexts/VehicleContext';
import VehicleList from '@/components/vehicle/VehicleList';
import AddVehicleButton from './AddVehicleButton';
import VehicleModal from '@/components/vehicle/VehicleModal';

export default function GarageClient() {
  const { vehiclesFull, loading, error } = useVehicles();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('addVehicle') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  if (loading) {
    return <div className="text-center py-8">Chargement des véhicules...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Erreur: {error}</div>;
  }

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Vos véhicules
      </h1>

      <VehicleList vehicles={vehiclesFull} />

      <AddVehicleButton onOpen={() => setIsModalOpen(true)} />

      <VehicleModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
