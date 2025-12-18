/**
 * @file contexts/FillContext.tsx
 * @fileoverview React context for fuel fill-up state management.
 * 
 * This context provides a way to manage fill-up records across components
 * and trigger refreshes when fills are added, updated, or deleted.
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Fill, FillStats } from '@/types/fill';

interface FillContextType {
  fills: Fill[] | null;
  loading: boolean;
  error: string | null;
  stats: FillStats | null;
  selectedVehicleId: string | null;
  vehicles: Array<{
    id: number;
    name: string | null;
    make: string | null;
    model: string | null;
    odometer: number | null;
  }> | null;
  refreshFills: () => Promise<void>;
  addFillOptimistic: (fill: Fill) => void;
  updateFillOptimistic: (fillId: number, updatedData: Partial<Fill>) => void;
  deleteFillOptimistic: (fillId: number) => void;
  setSelectedVehicleId: (vehicleId: string | null) => void;
  setVehicles: (vehicles: Array<{
    id: number;
    name: string | null;
    make: string | null;
    model: string | null;
    odometer: number | null;
  }> | null) => void;
  getFilteredFills: (vehicleId: string | null) => Fill[];
  getFilteredStats: (vehicleId: string | null) => FillStats;
  getVehicleName: (vehicleId: number) => string;
}

const FillContext = createContext<FillContextType | undefined>(undefined);

/**
 * FillProvider Component
 * 
 * Provides fill-up state management to child components.
 * Handles fetching, caching, and refreshing fill-up data.
 */
export function FillProvider({ children }: { children: ReactNode }) {
  const [fills, setFills] = useState<Fill[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FillStats | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Array<{
    id: number;
    name: string | null;
    make: string | null;
    model: string | null;
    odometer: number | null;
  }> | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  /**
   * Get vehicle name by ID
   */
  const getVehicleName = (vehicleId: number): string => {
    if (!vehicles) return `Véhicule #${vehicleId}`;
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.name || `Véhicule #${vehicleId}`;
  };

  /**
   * Filter fills by vehicle ID
   */
  const getFilteredFills = (vehicleId: string | null): Fill[] => {
    if (!fills || vehicleId === null) {
      return fills || [];
    }
    return fills.filter(fill => fill.vehicle_id.toString() === vehicleId);
  };

  /**
   * Get filtered statistics by vehicle ID
   */
  const getFilteredStats = (vehicleId: string | null): FillStats => {
    const filteredFills = getFilteredFills(vehicleId);
    return calculateStats(filteredFills);
  };

  /**
   * Calculate statistics from fill data
   */
  const calculateStats = (fillData: Fill[]): FillStats => {
    if (!fillData || fillData.length === 0) {
      return {
        total_fills: 0,
        total_liters: 0,
        total_cost: 0,
        avg_price_per_liter: 0,
        avg_consumption: 0,
        last_fill_date: null,
        last_odometer: null,
        monthly_chart: [],
      };
    }

    const totalFills = fillData.length;
    const totalLiters = fillData.reduce((sum, fill) => sum + (fill.liters ?? 0), 0);
    const totalCost = fillData.reduce((sum, fill) => sum + (fill.amount ?? 0), 0);
    const avgPricePerLiter = totalCost / totalLiters || 0;
    
    // Calculate average consumption - improved algorithm
    let avgConsumption = 0;
    let distanceSum = 0;
    let litersSum = 0;
    let fillCount = 0;
    let hasOdometerData = false;
    
    // Sort by date to calculate distance between fills
    const sortedFills = [...fillData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // First pass: try to calculate with odometer data
    for (let i = 1; i < sortedFills.length; i++) {
      const prevFill = sortedFills[i - 1];
      const currFill = sortedFills[i];
      
      if (prevFill.odometer && currFill.odometer && currFill.liters) {
        hasOdometerData = true;
        const distance = currFill.odometer - prevFill.odometer;
        if (distance > 0) {
          distanceSum += distance;
          litersSum += currFill.liters;
          fillCount++;
        }
      }
    }
    
    // If we have valid odometer data, use it
    if (hasOdometerData && fillCount > 0 && distanceSum > 0) {
      avgConsumption = (litersSum / distanceSum) * 100;
    } else {
      // Fallback method: calculate based on time between fills and estimated distance
      // This is more realistic than the fixed 500km assumption
      const fillsWithLitersAndDates = sortedFills.filter(fill => 
        fill.liters && fill.liters > 0 && fill.date
      );
      
      if (fillsWithLitersAndDates.length >= 2) {
        let totalLiters = 0;
        let totalDays = 0;
        let validIntervals = 0;
        
        // Calculate average time between fills and liters used
        for (let i = 1; i < fillsWithLitersAndDates.length; i++) {
          const prevFill = fillsWithLitersAndDates[i - 1];
          const currFill = fillsWithLitersAndDates[i];
          
          const prevDate = new Date(prevFill.date);
          const currDate = new Date(currFill.date);
          const daysBetween = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysBetween > 0 && daysBetween < 90) { // Ignore unrealistic intervals
            totalLiters += currFill.liters || 0;
            totalDays += daysBetween;
            validIntervals++;
          }
        }
        
        // Estimate consumption based on average French driving habits (~35km/day)
        if (validIntervals > 0 && totalDays > 0) {
          const avgDailyDistance = 35; // km/day - French average
          const totalDistance = avgDailyDistance * totalDays;
          const avgConsumptionLitersPer100km = (totalLiters / totalDistance) * 100;
          
          // Only use this estimate if it's reasonable (between 3 and 15 L/100km)
          if (avgConsumptionLitersPer100km >= 3 && avgConsumptionLitersPer100km <= 15) {
            avgConsumption = avgConsumptionLitersPer100km;
          }
        }
      }
    }
    
    // Final fallback: if still 0 and we have at least 2 fills, use a very basic estimate
    if (avgConsumption === 0 && sortedFills.length >= 2) {
      const fillsWithLiters = sortedFills.filter(fill => fill.liters && fill.liters > 0);
      if (fillsWithLiters.length >= 2) {
        const avgLitersPerFill = fillsWithLiters.reduce((sum, fill) => sum + (fill.liters || 0), 0) / fillsWithLiters.length;
        // Very conservative estimate: 6L/100km for small cars, 8L/100km for larger ones
        avgConsumption = Math.max(6, Math.min(8, avgLitersPerFill * 2));
      }
    }
    
    // Get last fill data
    const lastFill = sortedFills[sortedFills.length - 1];
    
    // Calculate monthly statistics for chart - limit to last 12 months
    const monthlyStats = fillData.reduce((acc, fill) => {
      if (!fill.date || !fill.amount) return acc;
      
      const date = new Date(fill.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { 
          month: monthKey, 
          amount: 0, 
          count: 0,
          odometer: fill.odometer || 0,
          odometer_count: fill.odometer ? 1 : 0
        };
      } else {
        // For odometer, we want the latest value in the month
        if (fill.odometer) {
          acc[monthKey].odometer = fill.odometer;
          acc[monthKey].odometer_count = 1;
        }
      }
      
      acc[monthKey].amount += fill.amount;
      acc[monthKey].count += 1;
      
      return acc;
    }, {} as Record<string, { 
      month: string; 
      amount: number; 
      count: number;
      odometer: number;
      odometer_count: number
    }>);
    
    // Sort by month and limit to last 12 months
    const monthlyChartData = Object.values(monthlyStats)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12) // Keep only last 12 months
      .map(item => ({
        month: item.month,
        amount: parseFloat(item.amount.toFixed(2)),
        count: item.count,
        odometer: item.odometer_count > 0 ? item.odometer : null
      }));
    
    return {
      total_fills: totalFills,
      total_liters: parseFloat(totalLiters.toFixed(2)),
      total_cost: parseFloat(totalCost.toFixed(2)),
      avg_price_per_liter: parseFloat(avgPricePerLiter.toFixed(3)),
      avg_consumption: parseFloat(avgConsumption.toFixed(2)),
      last_fill_date: lastFill?.date || null,
      last_odometer: lastFill?.odometer || null,
      monthly_chart: monthlyChartData,
    };
  };

  /**
   * Fetch fills from API
   */
  const fetchFills = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/fills/get');
      const body = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        let errorMessage = body?.error ?? `Erreur de requête (${res.status})`;
        
        // Messages d'erreur plus spécifiques
        if (res.status === 401) {
          errorMessage = 'Veuillez vous connecter pour accéder à vos données.';
        } else if (res.status === 500) {
          errorMessage = 'Erreur serveur lors de la récupération des pleins. Veuillez réessayer plus tard.';
        } else if (body?.error?.includes('non autorisé')) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        }
        
        setError(errorMessage);
        setFills([]);
        setStats(null);
        return;
      }
      
      const fillData = Array.isArray(body?.fills) ? body.fills : [];
      setFills(fillData);
      setStats(calculateStats(fillData));
    } catch (err) {
      let errorMessage = 'Impossible de se connecter au serveur.';
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Le serveur met trop de temps à répondre.';
        }
      }
      
      setError(errorMessage);
      setFills([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh fills data
   */
  const refreshFills = async () => {
    await fetchFills();
  };

  /**
   * Add fill optimistically to the list
   */
  const addFillOptimistic = (fill: Fill) => {
    setFills((prev) => {
      if (!prev) return [fill];
      const newFills = [fill, ...prev];
      setStats(calculateStats(newFills));
      return newFills;
    });
  };

  /**
   * Update fill optimistically in the list
   */
  const updateFillOptimistic = (fillId: number, updatedData: Partial<Fill>) => {
    setFills((prev) => {
      if (!prev) return prev;
      
      const updatedFills = prev.map((fill) => 
        fill.id === fillId ? { ...fill, ...updatedData } : fill
      );
      setStats(calculateStats(updatedFills));
      return updatedFills;
    });
  };

  /**
   * Delete fill optimistically from the list
   */
  const deleteFillOptimistic = (fillId: number) => {
    setFills((prev) => {
      if (!prev) return prev;
      
      const filteredFills = prev.filter((fill) => fill.id !== fillId);
      setStats(calculateStats(filteredFills));
      return filteredFills;
    });
  };

  /**
   * Fetch fills on mount or when refresh is triggered
   */
  useEffect(() => {
    fetchFills();
  }, [refreshTrigger]);

  /**
   * Auto-refresh every 5 minutes to keep data fresh
   */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFills();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  return (
    <FillContext.Provider value={{
      fills,
      loading,
      error,
      stats,
      selectedVehicleId,
      vehicles,
      refreshFills,
      addFillOptimistic,
      updateFillOptimistic,
      deleteFillOptimistic,
      setSelectedVehicleId,
      setVehicles,
      getFilteredFills,
      getFilteredStats,
      getVehicleName,
    }}>
      {children}
    </FillContext.Provider>
  );
}

/**
 * Custom hook to use fill context
 */
export function useFills() {
  const context = useContext(FillContext);
  if (context === undefined) {
    throw new Error('useFills must be used within a FillProvider');
  }
  return context;
}