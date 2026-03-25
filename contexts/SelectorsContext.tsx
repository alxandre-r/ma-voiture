'use client';

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';

import type { PeriodType } from '@/types/period';
import type { VehicleMinimal } from '@/types/vehicle';

interface SelectorsContextType {
  // Vehicles list
  vehicles: VehicleMinimal[];
  // Vehicle selection
  selectedVehicleIds: number[];
  setSelectedVehicleIds: (ids: number[]) => void;
  // Period selection
  selectedPeriod: PeriodType;
  setSelectedPeriod: (period: PeriodType) => void;
  // Computed
  periodLabel: string;
}

interface SelectorsProviderProps {
  children: ReactNode;
  initialVehicles: VehicleMinimal[];
}

const SelectorsContext = createContext<SelectorsContextType | undefined>(undefined);

// LocalStorage keys
const STORAGE_KEYS = {
  VEHICLE_IDS: 'ma-voiture-selected-vehicles',
  PERIOD: 'ma-voiture-selected-period',
} as const;

/**
 * Global context for vehicle and period selection state.
 * Uses localStorage for persistence across page navigations in the browser.
 * The provider is placed at the layout level to ensure it's always available.
 */
export function SelectorsProvider({ children, initialVehicles }: SelectorsProviderProps) {
  // Initialize state from localStorage or from props
  const [selectedVehicleIds, setSelectedVehicleIdsState] = useState<number[]>(() => {
    return initialVehicles.map((v) => v.vehicle_id);
  });

  const [selectedPeriod, setSelectedPeriodState] = useState<PeriodType>(() => 'year');

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedVehicleIds = localStorage.getItem(STORAGE_KEYS.VEHICLE_IDS);
      const storedPeriod = localStorage.getItem(STORAGE_KEYS.PERIOD);

      if (storedVehicleIds) {
        const parsed = JSON.parse(storedVehicleIds) as number[];
        // Validate against current vehicles
        const validIds = parsed.filter((id) => initialVehicles.some((v) => v.vehicle_id === id));
        if (validIds.length > 0) {
          setSelectedVehicleIdsState(validIds);
        }
      }

      if (storedPeriod && ['month', 'year', 'all'].includes(storedPeriod)) {
        setSelectedPeriodState(storedPeriod as PeriodType);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [initialVehicles]);

  // Update localStorage when state changes
  const setSelectedVehicleIds = (ids: number[]) => {
    setSelectedVehicleIdsState(ids);
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLE_IDS, JSON.stringify(ids));
    } catch {
      // Ignore storage errors
    }
  };

  const setSelectedPeriod = (period: PeriodType) => {
    setSelectedPeriodState(period);
    try {
      localStorage.setItem(STORAGE_KEYS.PERIOD, period);
    } catch {
      // Ignore storage errors
    }
  };

  // Computed period label
  const periodLabel = useMemo(() => {
    return selectedPeriod === 'month'
      ? 'ce mois'
      : selectedPeriod === 'year'
        ? 'cette année'
        : 'tout';
  }, [selectedPeriod]);

  const value = useMemo(
    () => ({
      vehicles: initialVehicles,
      selectedVehicleIds,
      setSelectedVehicleIds,
      selectedPeriod,
      setSelectedPeriod,
      periodLabel,
    }),
    [initialVehicles, selectedVehicleIds, selectedPeriod, periodLabel],
  );

  return <SelectorsContext.Provider value={value}>{children}</SelectorsContext.Provider>;
}

/**
 * Hook to access the shared selectors state.
 * Must be used within a SelectorsProvider.
 */
export function useSelectors() {
  const context = useContext(SelectorsContext);
  if (!context) {
    throw new Error('useSelectors must be used within a SelectorsProvider');
  }
  return context;
}
