'use client';

/**
 * VehicleContext - Gestion d'état global pour les véhicules
 * 
 * ⚠️ NOTE: Ce contexte n'est plus utilisé pour la feature History.
 * La page history utilise maintenant le SSR (Server-Side Rendering) pour de meilleures performances.
 * Ce contexte reste utilisé pour la page Garage et les formulaires d'ajout/modification de véhicules.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Vehicle, VehicleMinimal } from '@/types/vehicle';

interface VehicleContextType {
  vehicles: VehicleMinimal[];
  vehiclesFull: Vehicle[];
  selectedVehicleId: number | null;
  loading: boolean;
  error: string | null;
  refreshVehicles: () => Promise<void>;
  addVehicleOptimistic: (vehicle: Vehicle) => void;
  setSelectedVehicleId: (id: number | null) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

interface VehicleProviderProps {
  children: ReactNode;
  userId: string; // on passe maintenant le userId côté client
}

export function VehicleProvider({ children, userId }: VehicleProviderProps) {
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([]);
  const [vehiclesFull, setVehiclesFull] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Normalise un Vehicle complet en VehicleMinimal
   */
  function normalizeVehicle(v: Vehicle): VehicleMinimal {
    return {
      vehicle_id: v.vehicle_id,
      name: v.name ?? null,
      make: v.make,
      model: v.model,
      color: v.color ?? null,
      odometer: v.odometer ?? null,
    };
  }

  const fetchVehicles = async () => {
    if (!userId) {
      setVehicles([]);
      setVehiclesFull([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // GET véhicules utilisateur
      const resUser = await fetch(`/api/vehicles/get`);
      const userVehicles: Vehicle[] = (await resUser.json()) || [];

      // GET véhicules famille côté client
      const resFamily = await fetch(`/api/familyVehicles?userId=${userId}`);
      const familyVehicles: Vehicle[] = resFamily.ok ? await resFamily.json() : [];

      const allVehicles = [...userVehicles, ...familyVehicles];

      setVehiclesFull(allVehicles);
      setVehicles(allVehicles.map(normalizeVehicle));
    } catch (err) {
      setError((err as Error).message || 'Unknown error');
      setVehicles([]);
      setVehiclesFull([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshVehicles = async () => {
    await fetchVehicles();
  };

  const addVehicleOptimistic = (vehicle: Vehicle) => {
    setVehiclesFull(prev => [vehicle, ...prev]);
    setVehicles(prev => [normalizeVehicle(vehicle), ...prev]);
  };

  useEffect(() => {
    fetchVehicles();
  }, [userId]);

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        vehiclesFull,
        selectedVehicleId,
        loading,
        error,
        refreshVehicles,
        addVehicleOptimistic,
        setSelectedVehicleId,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicles() {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicles must be used within VehicleProvider');
  }
  return context;
}