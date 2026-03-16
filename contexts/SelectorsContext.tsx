'use client';

import { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';

import type { PeriodType } from '@/types/period';
import type { VehicleMinimal } from '@/types/vehicle';
import type { ReactNode } from 'react';

interface SelectorsContextType {
  // Vehicle selection
  selectedVehicleIds: number[];
  setSelectedVehicleIds: (ids: number[]) => void;
  // Period selection
  selectedPeriod: PeriodType;
  setSelectedPeriod: (period: PeriodType) => void;
  // Computed
  periodLabel: string;
}

const SelectorsContext = createContext<SelectorsContextType | undefined>(undefined);

// Global state outside of React to persist across page navigations
// This is a singleton that survives across component mounts
let globalSelectedVehicleIds: number[] = [];
let globalSelectedPeriod: PeriodType = 'year';

// Track if we're in the browser for SSR handling
let isBrowser = false;

interface SelectorsProviderProps {
  children: ReactNode;
  initialVehicles: VehicleMinimal[];
}

/**
 * Global context for vehicle and period selection state.
 * Uses a singleton pattern to persist state across page navigations in the browser.
 * The provider is placed at the layout level to ensure it's always available.
 */
export function SelectorsProvider({ children, initialVehicles }: SelectorsProviderProps) {
  // Use ref to track if this is the first render
  const isFirstRender = useRef(true);
  const hasInitialized = useRef(false);

  // Initialize state from global values or from props
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>(() => {
    if (isBrowser && globalSelectedVehicleIds.length > 0) {
      return globalSelectedVehicleIds;
    }
    return initialVehicles.map((v) => v.vehicle_id);
  });

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(() => {
    if (isBrowser && globalSelectedPeriod) {
      return globalSelectedPeriod;
    }
    return 'year';
  });

  // Mark as initialized after first render
  useEffect(() => {
    isBrowser = true;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      hasInitialized.current = true;
    }
  }, []);

  // Validate and update selected vehicles when initialVehicles changes
  useEffect(() => {
    // Only run after initial mount
    if (!hasInitialized.current) return;

    if (initialVehicles.length > 0) {
      // Check if current selection is still valid
      const validSelection = selectedVehicleIds.filter((id) =>
        initialVehicles.some((v) => v.vehicle_id === id),
      );

      // If no valid selection, select all vehicles
      if (validSelection.length === 0) {
        const newSelection = initialVehicles.map((v) => v.vehicle_id);
        setSelectedVehicleIds(newSelection);
        globalSelectedVehicleIds = newSelection;
      } else if (validSelection.length !== selectedVehicleIds.length) {
        // Some vehicles no longer exist, update but keep valid ones
        setSelectedVehicleIds(validSelection);
        globalSelectedVehicleIds = validSelection;
      }
    }
  }, [initialVehicles]);

  // Update global state when local state changes
  const handleSetSelectedVehicleIds = (ids: number[]) => {
    setSelectedVehicleIds(ids);
    globalSelectedVehicleIds = ids;
  };

  const handleSetSelectedPeriod = (period: PeriodType) => {
    setSelectedPeriod(period);
    globalSelectedPeriod = period;
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
      selectedVehicleIds,
      setSelectedVehicleIds: handleSetSelectedVehicleIds,
      selectedPeriod,
      setSelectedPeriod: handleSetSelectedPeriod,
      periodLabel,
    }),
    [selectedVehicleIds, selectedPeriod, periodLabel],
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
