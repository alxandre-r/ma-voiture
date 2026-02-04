'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Vehicle, VehicleMinimal } from '@/types/vehicle';

interface VehicleContextType {
  vehicles: VehicleMinimal[];      // utilisé partout (dashboard, switcher…)
  vehiclesFull: Vehicle[];          // utilisé par Garage
  selectedVehicleId: number | null;
  loading: boolean;
  error: string | null;
  refreshVehicles: () => Promise<void>;
  addVehicleOptimistic: (vehicle: Vehicle) => void;
  setSelectedVehicleId: (id: number | null) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([]);
  const [vehiclesFull, setVehiclesFull] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { userRole } = useFamily();

  /**
   * Normalise un Vehicle complet en VehicleMinimal
   * TODO(cleanup): séparer la logique minimal / full dans un service dédié
   */
  function normalizeVehicle(v: Vehicle): VehicleMinimal {
    return {
      id: v.vehicle_id,
      name: v.name ?? null,
      make: v.make ?? null,
      model: v.model ?? null,
      odometer: v.odometer ?? null,
    };
  }

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = userRole
        ? '/api/vehicles/get/family_vehicles'
        : '/api/vehicles/get';

      const res = await fetch(endpoint);
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body?.error ?? `Request failed (${res.status})`);
        setVehicles([]);
        setVehiclesFull([]);
        return;
      }

      const rawVehicles: Vehicle[] = Array.isArray(body?.vehicles)
        ? body.vehicles
        : Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
        ? body.data
        : [];

      setVehiclesFull(rawVehicles);
      setVehicles(rawVehicles.map(normalizeVehicle));
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
    // Optimiste sur les deux représentations
    setVehiclesFull(prev => [vehicle, ...prev]);
    setVehicles(prev => [normalizeVehicle(vehicle), ...prev]);
  };

  useEffect(() => {
    fetchVehicles();
  }, [userRole]);

  return (
    console.log('VehicleProvider render with vehicles:', vehiclesFull),
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