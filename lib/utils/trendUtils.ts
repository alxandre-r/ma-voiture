import { subMonths, subYears } from 'date-fns';

import { getEffectivePeriodRange } from '@/lib/utils/filterUtils';

import type { Expense } from '@/types/expense';
import type { PeriodSelection } from '@/types/period';

export interface PeriodTrend {
  trendPct: number;
  previousTotal: number;
}

/**
 * Computes the % change between the current period total and the equivalent prior period.
 * Returns null for 'all' and 'custom' periods (no meaningful prior window).
 */
export function computePeriodTrend(
  filteredExpenses: Expense[],
  allExpenses: Expense[],
  period: PeriodSelection,
): PeriodTrend | null {
  // No prior period for 'all' or custom ranges
  if (period === 'all' || (typeof period === 'object' && period.preset === 'custom')) {
    return null;
  }

  const { start: currentStart } = getEffectivePeriodRange(period);
  if (!currentStart) return null;

  // Shift window backward by the same duration
  const now = new Date();
  const durationMs = now.getTime() - currentStart.getTime();

  let previousStart: Date;
  let previousEnd: Date;

  switch (period) {
    case 'month':
      previousStart = subMonths(currentStart, 1);
      previousEnd = new Date(currentStart.getTime() - 1);
      break;
    case '3months':
      previousStart = subMonths(currentStart, 3);
      previousEnd = new Date(currentStart.getTime() - 1);
      break;
    case '6months':
      previousStart = subMonths(currentStart, 6);
      previousEnd = new Date(currentStart.getTime() - 1);
      break;
    case 'year':
      previousStart = subYears(currentStart, 1);
      previousEnd = new Date(currentStart.getTime() - 1);
      break;
    case '12months':
      previousStart = new Date(currentStart.getTime() - durationMs);
      previousEnd = new Date(currentStart.getTime() - 1);
      break;
    default:
      return null;
  }

  const previousTotal = allExpenses
    .filter((e) => {
      const d = new Date(e.date);
      return d >= previousStart && d <= previousEnd;
    })
    .reduce((sum, e) => sum + (e.amount ?? 0), 0);

  const currentTotal = filteredExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  if (previousTotal === 0) return null;

  const trendPct = ((currentTotal - previousTotal) / previousTotal) * 100;
  return { trendPct, previousTotal };
}
