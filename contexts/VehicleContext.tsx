/**
 * @file contexts/VehicleContext.tsx
 * @fileoverview React context for vehicle state management.
 * 
 * This context provides a way to manage vehicle state across components
 * and trigger refreshes when vehicles are added, updated, or deleted.
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VehicleContextType {
  vehicles: any[] | null;
  loading: boolean;
  error: string | null;
  refreshVehicles: () => Promise<void>;
  addVehicleOptimistic: (vehicle: any) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

/**
 * VehicleProvider Component
 * 
 * Provides vehicle state management to child components.
 * Handles fetching, caching, and refreshing vehicle data.
 */
export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  /**
   * Fetch vehicles from API
   */
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
      
      setVehicles(Array.isArray(body?.vehicles) ? body.vehicles : []);
    } catch (err) {
      setError((err as Error).message || 'Unknown error');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh vehicles data
   */
  const refreshVehicles = async () => {
    await fetchVehicles();
  };

  /**
   * Add vehicle optimistically to the list
   */
  const addVehicleOptimistic = (vehicle: any) => {
    setVehicles((prev) => {
      if (!prev) return [vehicle];
      return [vehicle, ...prev];
    });
  };

  /**
   * Fetch vehicles on mount or when refresh is triggered
   */
  useEffect(() => {
    fetchVehicles();
  }, [refreshTrigger]);

  /**
   * Auto-refresh every 5 minutes to keep data fresh
   */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVehicles();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  return (
    <VehicleContext.Provider value={{
      vehicles,
      loading,
      error,
      refreshVehicles,
      addVehicleOptimistic,
    }}>
      {children}
    </VehicleContext.Provider>
  );
}

/**
 * Custom hook to use vehicle context
 */
export function useVehicles() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
}