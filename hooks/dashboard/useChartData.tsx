// app/hooks/dashboard/useFillChartData.ts

import { useMemo } from 'react';

import type { Fill } from '@/types/fill';
import type { Vehicle } from '@/types/vehicle';

export type PeriodType = '1m' | '3m' | '6m' | '12m';

/**
 * 🔹 Point utilisé par FillChart ET OdometerChart
 */
export interface ChartPoint {
  date: string;
  odometer: number;
  amount: number;

  // nécessaires pour FillChart
  vehicleId: string;
  vehicleName: string;
  color?: string;
  isVisible: boolean;
}

/**
 * 🔹 Structure utilisée par Charts → FillChart → OdometerChart
 */
export interface VehicleChartSeries {
  vehicleId: string;
  vehicleName: string;
  color: string;
  points: ChartPoint[];
}

interface UseFillChartDataProps {
  allVehicles: Vehicle[];
  fills: Fill[];
  selectedVehicleIds: number[];
  getVehicleName?: (vehicleId: number) => string;
  selectedPeriod?: PeriodType;
}

export function useFillChartData({
  allVehicles,
  fills,
  selectedVehicleIds,
  getVehicleName,
  selectedPeriod = '6m',
}: UseFillChartDataProps) {
  /**
   * 🔹 Date de début selon période
   */
  const periodStartDate = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    switch (selectedPeriod) {
      case '3m':
        start.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        start.setMonth(now.getMonth() - 6);
        break;
      case '12m':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setFullYear(now.getFullYear() - 1);
    }

    start.setHours(0, 0, 0, 0);
    return start;
  }, [selectedPeriod]);

  /**
   * 🔹 Données pour les charts
   */
  const vehiclesForChart: VehicleChartSeries[] = useMemo(() => {
    const colorPalette = ['#7C3AED', '#4F46E5', '#60A5FA', '#8B5CF6', '#C084FC', '#1E293B'];

    if (!allVehicles?.length || !fills?.length) return [];

    const now = new Date();

    return allVehicles
      .filter((v) => selectedVehicleIds.includes(v.vehicle_id))
      .map((v, index) => {
        const vehicleName =
          getVehicleName?.(v.vehicle_id) || v.name || `${v.make ?? ''} ${v.model ?? ''}`;

        const color = v.color || colorPalette[index % colorPalette.length];

        const vehicleFills = fills
          .filter((f) => f.vehicle_id === v.vehicle_id && f.odometer != null)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .filter((f) => {
            const fillDate = new Date(f.date);
            return fillDate >= periodStartDate && fillDate <= now;
          });

        return {
          vehicleId: String(v.vehicle_id),
          vehicleName,
          color,
          points: vehicleFills.map((f) => ({
            date: f.date,
            odometer: f.odometer!,
            amount: f.amount,

            // nécessaires pour FillChart
            vehicleId: String(v.vehicle_id),
            vehicleName,
            color,
            isVisible: true,
          })),
        };
      })
      .filter((v) => v.points.length > 0);
  }, [allVehicles, fills, selectedVehicleIds, getVehicleName, periodStartDate]);

  /**
   * 🔹 Stats filtrées par période
   */
  const filteredStats = useMemo(() => {
    const now = new Date();

    const filteredFills = fills.filter((f) => {
      const d = new Date(f.date);
      return d >= periodStartDate && d <= now;
    });

    const total_cost = filteredFills.reduce((sum, f) => sum + (f.amount || 0), 0);

    const total_distance = filteredFills.reduce((sum, f, i, arr) => {
      if (i === 0) return 0;
      return sum + ((f.odometer || 0) - (arr[i - 1].odometer || 0));
    }, 0);

    const avg_consumption = total_distance > 0 ? (total_cost / total_distance) * 100 : 0;

    const avg_price_per_liter =
      total_cost / (filteredFills.reduce((sum, f) => sum + (f.liters || 0), 0) || 1);

    return {
      avg_consumption,
      total_cost,
      avg_price_per_liter,
    };
  }, [fills, periodStartDate]);

  const hasData = !!fills?.length && vehiclesForChart.length > 0;

  return {
    vehiclesForChart,
    filteredStats,
    hasData,
  };
}
