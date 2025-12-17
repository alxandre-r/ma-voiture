/**
 * @file components/vehicle/VehicleListStates.tsx
 * @fileoverview Loading, error, and empty states for vehicle list.
 * 
 * This component handles the various states of the vehicle list:
 * loading, error, and empty states.
 */

interface VehicleListStatesProps {
  loading: boolean;
  error: string | null;
  vehicles: Array<{
    id: string;
    [key: string]: unknown;
  }> | null;
}

/**
 * VehicleListStates Component
 * 
 * Handles different states of vehicle list display.
 */
export default function VehicleListStates({
  loading,
  error,
  vehicles,
}: VehicleListStatesProps) {
  if (loading) {
    return <div className="text-gray-800 dark:text-white">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500 dark:text-red-400">Erreur : {error}</div>;
  }

  if (!vehicles || vehicles.length === 0) {
    // returns a welcome message and invites to add vehicles with AddVehicleClient
    return (<div className="text-gray-300">
      <h2 className="text-2xl font-semibold mb-4">Bienvenue dans votre garage !</h2>
      <p className="mb-2">
        Il semble que vous n&#39;ayez pas encore ajouté de véhicules. Commencez par cliquer sur le bouton ci-dessous pour ajouter votre premier véhicule.
      </p>
    </div>
  );
  }

  return null;
}