/**
 * @file lib/utils/anomalyUtils.ts
 * @description Detects abnormal fuel consumption patterns using a rolling baseline.
 * For each vehicle with sufficient fill history, compares the latest fill's L/100km
 * against the trailing average of the previous fills and flags significant deviations.
 */

import type { Expense } from '@/types/expense';
import type { Vehicle } from '@/types/vehicle';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConsumptionAnomaly {
  vehicleId: number;
  vehicleName: string;
  vehicleColor: string;
  /** L/100km of the latest fill */
  latestConsumption: number;
  /** Rolling average L/100km of previous fills */
  baselineConsumption: number;
  /** Signed deviation in % (positive = higher than usual) */
  deviationPct: number;
  direction: 'up' | 'down';
  fillDate: string;
  possibleCauses: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum number of fills (with odometer data) required to attempt analysis */
const MIN_FILLS = 6;

/** % deviation threshold above which a fill is flagged */
const ANOMALY_THRESHOLD_PCT = 15;

/** Number of preceding fills used to compute the baseline */
const BASELINE_WINDOW = 4;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface FillPoint {
  date: string;
  odometer: number;
  liters: number;
}

/** Extract valid fuel fill points (with odometer + liters) sorted by date asc. */
function extractFillPoints(expenses: Expense[]): FillPoint[] {
  return expenses
    .filter(
      (e): e is Expense & { odometer: number; liters: number } =>
        e.type === 'fuel' && e.odometer != null && e.liters != null && e.liters > 0,
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((e) => ({ date: e.date, odometer: e.odometer!, liters: e.liters! }));
}

/**
 * Compute L/100km for each consecutive pair.
 * Index 0 is always null (no predecessor).
 */
function computeConsumptions(points: FillPoint[]): (number | null)[] {
  return points.map((p, i) => {
    if (i === 0) return null;
    const dist = p.odometer - points[i - 1].odometer;
    if (dist <= 0) return null;
    return (p.liters / dist) * 100;
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyse fill expenses per vehicle and return anomalies where the latest
 * L/100km deviates more than ANOMALY_THRESHOLD_PCT from the rolling baseline.
 *
 * Only fuel (gasoline/diesel) fills are analysed — electric kWh/100km would
 * require a separate calibration.
 */
export function detectAnomalies(
  fillExpenses: Expense[],
  vehicles: Vehicle[],
): ConsumptionAnomaly[] {
  // Group fuel expenses by vehicle
  const byVehicle = new Map<number, Expense[]>();
  for (const e of fillExpenses) {
    if (e.type !== 'fuel') continue;
    const arr = byVehicle.get(e.vehicle_id) ?? [];
    arr.push(e);
    byVehicle.set(e.vehicle_id, arr);
  }

  const anomalies: ConsumptionAnomaly[] = [];

  for (const [vehicleId, expenses] of byVehicle) {
    const points = extractFillPoints(expenses);
    if (points.length < MIN_FILLS) continue;

    const consumptions = computeConsumptions(points);
    const valid = consumptions.filter((c): c is number => c !== null);
    if (valid.length < BASELINE_WINDOW + 1) continue;

    const latest = valid[valid.length - 1];
    const baseline = valid.slice(-(BASELINE_WINDOW + 1), -1);
    const baselineAvg = baseline.reduce((s, c) => s + c, 0) / baseline.length;

    if (baselineAvg <= 0) continue;

    const deviationPct = ((latest - baselineAvg) / baselineAvg) * 100;
    if (Math.abs(deviationPct) < ANOMALY_THRESHOLD_PCT) continue;

    const latestPoint = points[points.length - 1];
    const vehicle = vehicles.find((v) => v.vehicle_id === vehicleId);
    const vehicleName =
      (vehicle?.name ?? `${vehicle?.make ?? ''} ${vehicle?.model ?? ''}`.trim()) ||
      `Véhicule ${vehicleId}`;

    const possibleCauses =
      deviationPct > 0
        ? [
            'Conduite urbaine intense',
            'Pression des pneus insuffisante',
            'Filtre à air encrassé',
            'Usage intensif de la climatisation',
            'Températures froides',
          ]
        : ['Conduite sur autoroute', 'Éco-conduite', 'Températures douces'];

    anomalies.push({
      vehicleId,
      vehicleName,
      vehicleColor: vehicle?.color ?? '#6b7280',
      latestConsumption: Math.round(latest * 10) / 10,
      baselineConsumption: Math.round(baselineAvg * 10) / 10,
      deviationPct: Math.round(deviationPct * 10) / 10,
      direction: deviationPct > 0 ? 'up' : 'down',
      fillDate: latestPoint.date,
      possibleCauses,
    });
  }

  return anomalies;
}
