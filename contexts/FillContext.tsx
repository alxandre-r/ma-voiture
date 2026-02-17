'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { Fill, FillStats } from '@/types/fill';
import { VehicleMinimal } from '@/types/vehicle';

/* =========================
   🆕 Period Types
========================= */

export type PeriodType = '1m' | '3m' | '6m' | '12m';

interface FillContextType {
  fills: Fill[] | undefined;
  loading: boolean;
  error: string | null;
  stats: FillStats;

  selectedVehicleIds: number[];
  selectedVehicleId: number | null;
  vehicles: VehicleMinimal[];

  /* 🆕 Period */
  selectedPeriod: PeriodType;
  setSelectedPeriod: (period: PeriodType) => void;

  refreshFills: () => void;
  addFillOptimistic: (fill: Fill) => void;
  updateFillOptimistic: (fillId: number, updatedData: Partial<Fill>) => void;
  deleteFillOptimistic: (fillId: number) => void;

  setSelectedVehicleIds: (vehicleIds: number[]) => void;
  setSelectedVehicleId: (vehicleId: number | null) => void;
  setVehicles: (vehicles: VehicleMinimal[]) => void;

  getFilteredFills: (vehicleIds?: number[]) => Fill[];
  getFilteredStats: (vehicleIds?: number[]) => FillStats;
  getVehicleName: (vehicleId: number) => string;
}

const FillContext = createContext<FillContextType | undefined>(undefined);

const emptyStats = (): FillStats => ({
  total_fills: 0,
  total_liters: 0,
  total_cost: 0,
  avg_price_per_liter: 0,
  avg_consumption: 0,
  last_fill_date: null,
  last_odometer: null,
  monthly_chart: [],
});

export function FillProvider({
  children,
  vehiclesProp,
}: {
  children: ReactNode;
  vehiclesProp: VehicleMinimal[] | null;
}) {
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  const [fills, setFills] = useState<Fill[] | undefined>(undefined);
  const [stats, setStats] = useState<FillStats>(emptyStats());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     🆕 Period State
  ========================= */

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('6m');

  const periodStartDate = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    switch (selectedPeriod) {
      case '1m':
        start.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        start.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        start.setMonth(now.getMonth() - 6);
        break;
      case '12m':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    start.setHours(0, 0, 0, 0);
    return start;
  }, [selectedPeriod]);

  /* =========================
     Init véhicules
  ========================= */

  useEffect(() => {
    if (!vehiclesProp || vehiclesProp.length === 0) return;

    setVehicles(vehiclesProp);

    const ids = vehiclesProp
      .map(v => Number(v.vehicle_id))
      .filter(id => Number.isFinite(id));

    setSelectedVehicleIds(ids);
    setSelectedVehicleId(ids[0] ?? null);
  }, [vehiclesProp]);

  useEffect(() => {
    if (!selectedVehicleIds.includes(selectedVehicleId ?? -1)) {
      setSelectedVehicleId(selectedVehicleIds[0] ?? null);
    }
  }, [selectedVehicleIds, selectedVehicleId]);

  const getVehicleName = useCallback(
    (vehicleId: number): string => {
      const v = vehicles.find(v => v.vehicle_id === vehicleId);
      if (!v) return `Véhicule #${vehicleId}`;
      if (v.name) return v.name;
      if (v.make || v.model) return `${v.make ?? ''} ${v.model ?? ''}`.trim();
      return `Véhicule #${vehicleId}`;
    },
    [vehicles]
  );

  /* =========================
     Stats
  ========================= */

  const calculateStats = useCallback((data: Fill[]): FillStats => {
    if (!data.length) return emptyStats();

    const totalLiters = data.reduce((sum, f) => sum + (f.liters ?? 0), 0);
    const totalCost = data.reduce((sum, f) => sum + (f.amount ?? 0), 0);

    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const lastFill = sorted[sorted.length - 1];

    let avgConsumption = 0;
    const fillsWithOdometer = sorted.filter(
      f => f.odometer != null && f.liters != null
    );

    if (fillsWithOdometer.length > 1) {
      let totalDistance = 0;
      let totalFuel = 0;

      for (let i = 1; i < fillsWithOdometer.length; i++) {
        const prev = fillsWithOdometer[i - 1];
        const curr = fillsWithOdometer[i];

        const distance = curr.odometer! - prev.odometer!;
        if (distance > 0) {
          totalDistance += distance;
          totalFuel += curr.liters!;
        }
      }

      if (totalDistance > 0)
        avgConsumption = (totalFuel / totalDistance) * 100;
    }

    return {
      total_fills: data.length,
      total_liters: +totalLiters.toFixed(2),
      total_cost: +totalCost.toFixed(2),
      avg_price_per_liter:
        totalLiters > 0 ? +(totalCost / totalLiters).toFixed(3) : 0,
      avg_consumption: +avgConsumption.toFixed(2),
      last_fill_date: lastFill?.date ?? null,
      last_odometer: lastFill?.odometer ?? null,
      monthly_chart: [], // conservé temporairement
    };
  }, []);

  /* =========================
     🆕 Filtres avec période
  ========================= */

  const getFilteredFills = useCallback(
    (vehicleIds?: number[]): Fill[] => {
      if (!fills) return [];

      const ids =
        vehicleIds && vehicleIds.length > 0
          ? vehicleIds
          : selectedVehicleIds;

      let result = fills;

      if (ids && ids.length > 0) {
        result = result.filter(f => ids.includes(f.vehicle_id));
      }

      // 🆕 Filtre par période
      result = result.filter(f => {
        if (!f.date) return false;
        const fillDate = new Date(f.date);
        return fillDate >= periodStartDate;
      });

      return result;
    },
    [fills, selectedVehicleIds, periodStartDate]
  );

  const getFilteredStats = useCallback(
    (vehicleIds?: number[]): FillStats => {
      const filtered = getFilteredFills(vehicleIds);
      return calculateStats(filtered);
    },
    [getFilteredFills, calculateStats]
  );

  /* =========================
     Fetch
  ========================= */

  const vehicleIdsKey = useMemo(
    () =>
      selectedVehicleIds
        .filter(id => id > 0)
        .sort((a, b) => a - b)
        .join(','),
    [selectedVehicleIds]
  );

  const fetchFills = useCallback(async () => {
    if (!vehicleIdsKey) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/fills/get?vehicleIds=${vehicleIdsKey}`
      );
      const body = await res.json();

      if (!res.ok)
        throw new Error(body?.error || `Erreur ${res.status}`);

      const fetched: Fill[] = body.fills ?? [];
      setFills(fetched);

      const filtered = fetched.filter(f => {
        const fillDate = new Date(f.date);
        return fillDate >= periodStartDate;
      });

      setStats(calculateStats(filtered));
    } catch (err) {
      setError((err as Error).message);
      setFills([]);
      setStats(emptyStats());
    } finally {
      setLoading(false);
    }
  }, [vehicleIdsKey, calculateStats, periodStartDate]);

  useEffect(() => {
    if (vehicleIdsKey) fetchFills();
  }, [vehicleIdsKey, fetchFills]);

  const refreshFills = useCallback(() => fetchFills(), [fetchFills]);

  /* =========================
     Optimistic Updates
  ========================= */

  const addFillOptimistic = useCallback(
    (fill: Fill) => {
      setFills(prev => {
        const next = prev ? [fill, ...prev] : [fill];
        const filtered = next.filter(f => new Date(f.date) >= periodStartDate);
        setStats(calculateStats(filtered));
        return next;
      });
    },
    [calculateStats, periodStartDate]
  );

  const updateFillOptimistic = useCallback(
    (fillId: number, updatedData: Partial<Fill>) => {
      setFills(prev => {
        if (!prev) return prev;

        const next = prev.map(f =>
          f.id === fillId ? { ...f, ...updatedData } : f
        );

        const filtered = next.filter(f => new Date(f.date) >= periodStartDate);
        setStats(calculateStats(filtered));

        return next;
      });
    },
    [calculateStats, periodStartDate]
  );

  const deleteFillOptimistic = useCallback(
    (fillId: number) => {
      setFills(prev => {
        if (!prev) return prev;

        const next = prev.filter(f => f.id !== fillId);
        const filtered = next.filter(f => new Date(f.date) >= periodStartDate);

        setStats(calculateStats(filtered));
        return next;
      });
    },
    [calculateStats, periodStartDate]
  );

  return (
    <FillContext.Provider
      value={{
        fills,
        loading,
        error,
        stats,
        selectedVehicleIds,
        selectedVehicleId,
        vehicles,
        selectedPeriod,
        setSelectedPeriod,
        refreshFills,
        addFillOptimistic,
        updateFillOptimistic,
        deleteFillOptimistic,
        setSelectedVehicleIds,
        setSelectedVehicleId,
        setVehicles,
        getFilteredFills,
        getFilteredStats,
        getVehicleName,
      }}
    >
      {children}
    </FillContext.Provider>
  );
}

export function useFills() {
  const ctx = useContext(FillContext);
  if (!ctx)
    throw new Error('useFills must be used within a FillProvider');
  return ctx;
}