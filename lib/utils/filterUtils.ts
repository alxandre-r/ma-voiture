import type { PeriodType } from '@/types/period';

/**
 * Returns the start-of-period cutoff date.
 * Returns null if period is 'all' or falsy (no date filter).
 */
export function getPeriodCutoff(period: PeriodType | string | null): Date | null {
  const now = new Date();
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === 'year') return new Date(now.getFullYear(), 0, 1);
  return null;
}

/**
 * Filters items by selected vehicle IDs and period.
 *
 * - Empty `selectedVehicleIds` → no vehicle filter applied (show all vehicles)
 * - `period` of 'all' or null → no date filter applied
 *
 * @param items             Array of items with `vehicle_id` and `date` fields
 * @param selectedVehicleIds Vehicle IDs to keep (empty = keep all)
 * @param period            Period filter ('month' | 'year' | 'all' | null)
 */
export function filterByVehiclesAndPeriod<T extends { vehicle_id: number; date: string }>(
  items: T[],
  selectedVehicleIds: number[],
  period: PeriodType | string | null,
): T[] {
  let result =
    selectedVehicleIds.length > 0
      ? items.filter((item) => selectedVehicleIds.includes(item.vehicle_id))
      : items;

  const cutoff = getPeriodCutoff(period);
  if (cutoff) {
    result = result.filter((item) => new Date(item.date) >= cutoff);
  }

  return result;
}
