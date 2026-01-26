'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Vehicle {
  id: number;
  owner?: string | null;
  owner_name?: string | null;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  fuel_type?: string | null;
  manufacturer_consumption?: number | null;
  odometer?: number | null;
  plate?: string | null;
  last_fill?: string | null;
  [key: string]: unknown; // Allow for additional fields from API
}

interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicleId: number | null;
  loading: boolean;
  error: string | null;
  refreshVehicles: () => Promise<void>;
  addVehicleOptimistic: (vehicle: Vehicle) => void;
  setSelectedVehicleId: (id: number | null) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/vehicles/get');
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body?.error ?? `Request failed (${res.status})`);
        setVehicles([]);
        return;
      }

      // Support response arrays or { vehicles: [...] }
      let vehiclesData: Vehicle[] = [];
      if (Array.isArray(body?.vehicles)) vehiclesData = body.vehicles;
      else if (Array.isArray(body)) vehiclesData = body;
      else if (Array.isArray(body?.data)) vehiclesData = body.data;

      setVehicles(vehiclesData);
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
    setVehicles((prev) => [vehicle, ...prev]);
  };

  const handleSetSelectedVehicleId = (id: number | null) => {
    setSelectedVehicleId(id);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchVehicles, 5 * 60 * 1000); // 5 min
    return () => clearInterval(interval);
  }, []);

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