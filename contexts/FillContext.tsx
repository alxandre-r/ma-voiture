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

/* ---------------- Types ---------------- */

interface FillContextType {
  fills: Fill[];
  loading: boolean;
  error: string | null;
  stats: FillStats;

  selectedVehicleIds: number[]; // multi-sélection
  vehicles: VehicleMinimal[];

  refreshFills: () => void;
  addFillOptimistic: (fill: Fill) => void;
  updateFillOptimistic: (fillId: number, updatedData: Partial<Fill>) => void;
  deleteFillOptimistic: (fillId: number) => void;

  setSelectedVehicleIds: (vehicleIds: number[]) => void;
  setVehicles: (vehicles: VehicleMinimal[]) => void;

  getVehicleName: (vehicleId: number) => string;
}

const FillContext = createContext<FillContextType | undefined>(undefined);

/* ---------------- Utils ---------------- */

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

/* ---------------- Provider ---------------- */

export function FillProvider({
  children,
  vehiclesProp,
}: {
  children: ReactNode;
  vehiclesProp: VehicleMinimal[] | null;
}) {
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);

  const [fills, setFills] = useState<Fill[]>([]);
  const [stats, setStats] = useState<FillStats>(emptyStats());

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Sync vehiclesProp ---------------- */
  useEffect(() => {
    if (!vehiclesProp || vehiclesProp.length === 0) return;
    setVehicles(vehiclesProp);
    // Par défaut, sélectionner tous les véhicules disponibles
    setSelectedVehicleIds(vehiclesProp.map(v => Number(v.id)).filter(id => Number.isFinite(id)));
  }, [vehiclesProp]);

  /* ---------------- Derived state ---------------- */
  const vehicleIdsKey = useMemo(
    () => selectedVehicleIds.filter(id => Number.isFinite(id) && id > 0).sort((a, b) => a - b).join(','),
    [selectedVehicleIds]
  );

  const isReady = vehicleIdsKey.length > 0;

  /* ---------------- Helpers ---------------- */
  const getVehicleName = useCallback(
    (vehicleId: number): string => {
      const v = vehicles.find(v => v.id === vehicleId);
      if (!v) return `Véhicule #${vehicleId}`;
      if (v.name) return v.name;
      if (v.make || v.model) return `${v.make ?? ''} ${v.model ?? ''}`.trim();
      return `Véhicule #${vehicleId}`;
    },
    [vehicles]
  );

  const calculateStats = useCallback((data: Fill[]): FillStats => {
    if (!data.length) return emptyStats();

    const totalLiters = data.reduce((sum, f) => sum + (f.liters ?? 0), 0);
    const totalCost = data.reduce((sum, f) => sum + (f.amount ?? 0), 0);

    const lastFill = [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    return {
      total_fills: data.length,
      total_liters: +totalLiters.toFixed(2),
      total_cost: +totalCost.toFixed(2),
      avg_price_per_liter: totalLiters > 0 ? +(totalCost / totalLiters).toFixed(3) : 0,
      avg_consumption: 0,
      last_fill_date: lastFill?.date ?? null,
      last_odometer: lastFill?.odometer ?? null,
      monthly_chart: [],
    };
  }, []);

  /* ---------------- Fetch fills ---------------- */
  const fetchFills = useCallback(async () => {
    if (!isReady) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/fills/get?vehicleIds=${vehicleIdsKey}`);
      const body = await res.json();

      if (!res.ok) throw new Error(body?.error || `Erreur ${res.status}`);

      const fetchedFills: Fill[] = body.fills ?? [];
      setFills(fetchedFills);
      setStats(calculateStats(fetchedFills));
    } catch (err) {
      setError((err as Error).message);
      setFills([]);
      setStats(emptyStats());
    } finally {
      setLoading(false);
    }
  }, [vehicleIdsKey, isReady, calculateStats]);

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    if (!isReady) return;
    fetchFills();
  }, [fetchFills, isReady]);

  /* ---------------- Optimistic updates ---------------- */
  const refreshFills = useCallback(() => fetchFills(), [fetchFills]);

  const addFillOptimistic = useCallback(
    (fill: Fill) => {
      setFills(prev => {
        const next = [fill, ...prev];
        setStats(calculateStats(next));
        return next;
      });
    },
    [calculateStats]
  );

  const updateFillOptimistic = useCallback(
    (fillId: number, updatedData: Partial<Fill>) => {
      setFills(prev => {
        const next = prev.map(f => f.id === fillId ? { ...f, ...updatedData } : f);
        setStats(calculateStats(next));
        return next;
      });
    },
    [calculateStats]
  );

  const deleteFillOptimistic = useCallback(
    (fillId: number) => {
      setFills(prev => {
        const next = prev.filter(f => f.id !== fillId);
        setStats(calculateStats(next));
        return next;
      });
    },
    [calculateStats]
  );

  /* ---------------- Provider ---------------- */
  return (
    <FillContext.Provider
      value={{
        fills,
        loading,
        error,
        stats,
        selectedVehicleIds,
        vehicles,
        refreshFills,
        addFillOptimistic,
        updateFillOptimistic,
        deleteFillOptimistic,
        setSelectedVehicleIds,
        setVehicles,
        getVehicleName,
      }}
    >
      {children}
    </FillContext.Provider>
  );
}

/* ---------------- Hook ---------------- */
export function useFills() {
  const ctx = useContext(FillContext);
  if (!ctx) throw new Error('useFills must be used within a FillProvider');
  return ctx;
}