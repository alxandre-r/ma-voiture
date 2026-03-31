'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

import type { PeriodType } from '@/types/period';
import type { UserPreferences } from '@/types/userPreferences';
import type { VehicleMinimal } from '@/types/vehicle';
import type { ReactNode } from 'react';

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
  initialPreferences?: UserPreferences | null;
  currentUserId?: string;
}

const SelectorsContext = createContext<SelectorsContextType | undefined>(undefined);

// LocalStorage keys
const STORAGE_KEYS = {
  VEHICLE_IDS: 'ma-voiture-selected-vehicles',
  PERIOD: 'ma-voiture-selected-period',
  PREFS_SYNCED_AT: 'ma-voiture-prefs-synced-at',
  KNOWN_VEHICLE_IDS: 'ma-voiture-known-vehicles',
} as const;

/**
 * Global context for vehicle and period selection state.
 * Uses localStorage for persistence across page navigations in the browser.
 * The provider is placed at the layout level to ensure it's always available.
 */
export function SelectorsProvider({
  children,
  initialVehicles,
  initialPreferences,
  currentUserId,
}: SelectorsProviderProps) {
  // Initialize state from localStorage or from props
  const [selectedVehicleIds, setSelectedVehicleIdsState] = useState<number[]>(() => {
    return initialVehicles.map((v) => v.vehicle_id);
  });

  const [selectedPeriod, setSelectedPeriodState] = useState<PeriodType>(
    () => (initialPreferences?.default_period as PeriodType) ?? 'year',
  );

  // Hydrate from localStorage on mount, respecting DB preferences when they are newer
  useEffect(() => {
    try {
      const storedVehicleIds = localStorage.getItem(STORAGE_KEYS.VEHICLE_IDS);
      const storedPeriod = localStorage.getItem(STORAGE_KEYS.PERIOD);
      const storedPrefsSyncedAt = localStorage.getItem(STORAGE_KEYS.PREFS_SYNCED_AT);

      const dbUpdatedAt = initialPreferences?.updated_at ?? null;
      // DB preferences win when they are newer than the last time we synced them to localStorage
      const preferencesAreNewer =
        !!dbUpdatedAt && (!storedPrefsSyncedAt || dbUpdatedAt > storedPrefsSyncedAt);

      const storedKnownVehicleIds = localStorage.getItem(STORAGE_KEYS.KNOWN_VEHICLE_IDS);

      if (preferencesAreNewer && initialPreferences) {
        // Apply DB preferences and re-sync localStorage
        const period = initialPreferences.default_period as PeriodType;
        setSelectedPeriodState(period);
        localStorage.setItem(STORAGE_KEYS.PERIOD, period);

        const scope = initialPreferences.default_vehicle_scope;
        let ids: number[];
        if (scope === 'personal' && currentUserId) {
          ids = initialVehicles
            .filter((v) => v.owner_id === currentUserId)
            .map((v) => v.vehicle_id);
        } else if (scope === 'family' && currentUserId) {
          ids = initialVehicles
            .filter((v) => v.owner_id !== currentUserId)
            .map((v) => v.vehicle_id);
        } else {
          ids = initialVehicles.map((v) => v.vehicle_id);
        }
        if (ids.length > 0) setSelectedVehicleIdsState(ids);
        const allIds = initialVehicles.map((v) => v.vehicle_id);
        localStorage.setItem(STORAGE_KEYS.VEHICLE_IDS, JSON.stringify(ids));
        localStorage.setItem(STORAGE_KEYS.KNOWN_VEHICLE_IDS, JSON.stringify(allIds));
        localStorage.setItem(STORAGE_KEYS.PREFS_SYNCED_AT, dbUpdatedAt);
        return;
      }

      // localStorage wins — apply stored values
      if (storedVehicleIds) {
        const parsed = JSON.parse(storedVehicleIds) as number[];
        // Keep previously-selected IDs that still exist
        const validIds = parsed.filter((id) => initialVehicles.some((v) => v.vehicle_id === id));
        // Auto-select only vehicles that are genuinely new (absent from knownVehicleIds at last save).
        // If knownVehicleIds is not present we cannot safely distinguish "new" from "intentionally
        // excluded", so we skip auto-add to avoid overriding preference-based selections.
        const newIds = storedKnownVehicleIds
          ? initialVehicles
              .map((v) => v.vehicle_id)
              .filter((id) => !(JSON.parse(storedKnownVehicleIds) as number[]).includes(id))
          : [];
        const merged = [...validIds, ...newIds];
        if (merged.length > 0) setSelectedVehicleIdsState(merged);
        // Update known vehicles to current list
        localStorage.setItem(
          STORAGE_KEYS.KNOWN_VEHICLE_IDS,
          JSON.stringify(initialVehicles.map((v) => v.vehicle_id)),
        );
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
      // Track all currently known vehicles so future sessions can distinguish new vs excluded
      localStorage.setItem(
        STORAGE_KEYS.KNOWN_VEHICLE_IDS,
        JSON.stringify(initialVehicles.map((v) => v.vehicle_id)),
      );
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
