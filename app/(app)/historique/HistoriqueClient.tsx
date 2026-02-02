'use client';

import { FillProvider } from '@/contexts/FillContext';
import { useVehicles } from '@/contexts/VehicleContext';
import FillHistoryList from '@/components/fill/display/FillHistoryList';

export default function HistoriqueClient() {
  const { vehicles, loading, error } = useVehicles();

  // Tant que les véhicules ne sont pas encore récupérés, on affiche un loader
  if (loading) {
    return <div className="text-center py-8">Chargement des véhicules...</div>;
  }

  // Si erreur lors du fetch des véhicules
  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded text-red-700">
        Erreur: {error}
      </div>
    );
  }

  // Si aucun véhicule n'est présent
  if (!vehicles || vehicles.length === 0) {
    console.log('Aucun véhicule disponible pour l\'historique.');
    return (
      <div className="text-center py-8">
        Aucun véhicule disponible pour l'historique.
      </div>
    );
  }

  // Mount FillProvider uniquement quand vehicles sont disponibles
  return (
    console.log('Véhicules disponibles pour l\'historique:', vehicles),
    <FillProvider vehiclesProp={vehicles}>
      <FillHistoryList />
    </FillProvider>
  );
}