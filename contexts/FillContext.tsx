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

interface FillContextType {
  fills: Fill[] | undefined; // <-- undefined tant que non chargé
  loading: boolean;
  error: string | null;
  stats: FillStats;

  selectedVehicleIds: number[];
  selectedVehicleId: number | null;
  vehicles: VehicleMinimal[];

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

  // --- Initialisation des véhicules
  useEffect(() => {
    if (!vehiclesProp || vehiclesProp.length === 0) return;
    setVehicles(vehiclesProp);

    const ids = vehiclesProp.map(v => Number(v.vehicle_id)).filter(id => Number.isFinite(id));
    setSelectedVehicleIds(ids);
    setSelectedVehicleId(ids[0] ?? null);
  }, [vehiclesProp]);

  // --- Sync selectedVehicleId avec selectedVehicleIds
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

  // --- Calcul des stats
  const calculateStats = useCallback((data: Fill[]): FillStats => {
    if (!data.length) return emptyStats();

    const totalLiters = data.reduce((sum, f) => sum + (f.liters ?? 0), 0);
    const totalCost = data.reduce((sum, f) => sum + (f.amount ?? 0), 0);

    const lastFill = [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    const monthlyStats = data.reduce(
      (acc, fill) => {
        if (!fill.date || fill.amount == null) return acc;
        const date = new Date(fill.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey])
          acc[monthKey] = { month: monthKey, amount: 0, count: 0, odometer: fill.odometer ?? null };
        acc[monthKey].amount += fill.amount;
        acc[monthKey].count += 1;
        if (fill.odometer) acc[monthKey].odometer = fill.odometer;
        return acc;
      },
      {} as Record<string, { month: string; amount: number; count: number; odometer: number | null }>
    );

    const monthlyChart = Object.values(monthlyStats)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    let avgConsumption = 0;
    const fillsWithOdometer = data.filter(f => f.odometer != null && f.liters != null);
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
      if (totalDistance > 0) avgConsumption = (totalFuel / totalDistance) * 100;
    }

    return {
      total_fills: data.length,
      total_liters: +totalLiters.toFixed(2),
      total_cost: +totalCost.toFixed(2),
      avg_price_per_liter: totalLiters > 0 ? +(totalCost / totalLiters).toFixed(3) : 0,
      avg_consumption: +avgConsumption.toFixed(2),
      last_fill_date: lastFill?.date ?? null,
      last_odometer: lastFill?.odometer ?? null,
      monthly_chart: monthlyChart,
    };
  }, []);

  // --- Filtres
  const getFilteredFills = useCallback(
    (vehicleIds?: number[]): Fill[] => {
      if (!fills) return []; // <-- pas encore chargé
      const ids = vehicleIds && vehicleIds.length > 0 ? vehicleIds : selectedVehicleIds;
      if (!ids || ids.length === 0) return fills;
      return fills.filter(f => ids.includes(f.vehicle_id));
    },
    [fills, selectedVehicleIds]
  );

  const getFilteredStats = useCallback(
    (vehicleIds?: number[]): FillStats => {
      const filtered = getFilteredFills(vehicleIds);
      return calculateStats(filtered);
    },
    [getFilteredFills, calculateStats]
  );

  // --- Fetch des fills
  const vehicleIdsKey = useMemo(
    () => selectedVehicleIds.filter(id => id > 0).sort((a, b) => a - b).join(','),
    [selectedVehicleIds]
  );

  const fetchFills = useCallback(async () => {
    if (!vehicleIdsKey) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/fills/get?vehicleIds=${vehicleIdsKey}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || `Erreur ${res.status}`);
      const fetched: Fill[] = body.fills ?? [];
      setFills(fetched);
      setStats(calculateStats(fetched));
    } catch (err) {
      setError((err as Error).message);
      setFills([]);
      setStats(emptyStats());
    } finally {
      setLoading(false);
    }
  }, [vehicleIdsKey, calculateStats]);

  useEffect(() => {
    if (vehicleIdsKey) fetchFills();
  }, [vehicleIdsKey, fetchFills]);

  const refreshFills = useCallback(() => fetchFills(), [fetchFills]);

  const addFillOptimistic = useCallback(
    (fill: Fill) => {
      setFills(prev => {
        const next = prev ? [fill, ...prev] : [fill];
        setStats(calculateStats(next));
        return next;
      });
    },
    [calculateStats]
  );

  const updateFillOptimistic = useCallback(
    (fillId: number, updatedData: Partial<Fill>) => {
      setFills(prev => {
        if (!prev) return prev;
        const next = prev.map(f => (f.id === fillId ? { ...f, ...updatedData } : f));
        setStats(calculateStats(next));
        return next;
      });
    },
    [calculateStats]
  );

  const deleteFillOptimistic = useCallback(
    (fillId: number) => {
      setFills(prev => {
        if (!prev) return prev;
        const next = prev.filter(f => f.id !== fillId);
        setStats(calculateStats(next));
        return next;
      });
    },
    [calculateStats]
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
  if (!ctx) throw new Error('useFills must be used within a FillProvider');
  return ctx;
}