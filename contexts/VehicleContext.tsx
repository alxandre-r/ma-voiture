'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Vehicle, VehicleMinimal} from '@/types/vehicle';

interface VehicleContextType {
  vehicles: VehicleMinimal[];
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
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userRole } = useFamily();

  function normalizeVehicle(v: Vehicle): VehicleMinimal {
    return {
      id: v.id,
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
      const endpoint = userRole ? '/api/vehicles/get/family_vehicles' : '/api/vehicles/get';
      const res = await fetch(endpoint);
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body?.error ?? `Request failed (${res.status})`);
        setVehicles([]);
        return;
      }

    const rawVehicles: Vehicle[] = Array.isArray(body?.vehicles)
      ? body.vehicles
      : Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
      ? body.data
      : [];

    const normalized = rawVehicles.map(normalizeVehicle);
    setVehicles(normalized);
    } catch (err) {
      setError((err as Error).message || 'Unknown error');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshVehicles = async () => {
    await fetchVehicles();
  };

  const addVehicleOptimistic = (vehicle: Vehicle) => {
    setVehicles(prev => [normalizeVehicle(vehicle), ...prev]);
  };


  const handleSetSelectedVehicleId = (id: number | null) => {
    setSelectedVehicleId(id);
  };

  useEffect(() => {
    fetchVehicles(); // Fetch vehicles on initial load
  }, [userRole]);


  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        selectedVehicleId,
        loading,
        error,
        refreshVehicles,
        addVehicleOptimistic,
        setSelectedVehicleId: handleSetSelectedVehicleId,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicles() {
  const context = useContext(VehicleContext);
  if (!context) throw new Error('useVehicles must be used within VehicleProvider');
  return context;
}