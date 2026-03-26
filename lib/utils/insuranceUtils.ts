import { differenceInDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import type { InsuranceContract } from '@/types/insurance';

export function getTodayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getActiveContract(contracts: InsuranceContract[]): InsuranceContract | null {
  const today = getTodayMidnight();
  return contracts.find((c) => !c.end_date || parseISO(c.end_date) >= today) ?? null;
}

export function getHistoricalContracts(contracts: InsuranceContract[]): InsuranceContract[] {
  const today = getTodayMidnight();
  return contracts.filter((c) => c.end_date && parseISO(c.end_date) < today);
}

/** Returns the number of days until a contract's end_date. Negative = already expired. */
export function getDaysUntilExpiry(contract: InsuranceContract): number | null {
  if (!contract.end_date) return null;
  return differenceInDays(parseISO(contract.end_date), getTodayMidnight());
}

/** Next monthly payment date based on the day-of-month from start_date. Always in the future. */
export function getNextMonthlyPaymentDate(startDate: string): Date {
  const dayOfMonth = parseISO(startDate).getDate();
  const today = getTodayMidnight();
  const candidate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
  if (candidate <= today) {
    return new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth);
  }
  return candidate;
}

/** Suggested start date for a new contract: day after the most recent contract's end_date, or today. */
export function getSuggestedStartDate(contracts: InsuranceContract[]): string {
  const todayStr = new Date().toISOString().split('T')[0];
  if (contracts.length === 0) return todayStr;
  const sorted = [...contracts].sort(
    (a, b) => parseISO(b.start_date).getTime() - parseISO(a.start_date).getTime(),
  );
  const last = sorted[0];
  if (!last.end_date) return todayStr;
  const next = parseISO(last.end_date);
  next.setDate(next.getDate() + 1);
  return next.toISOString().split('T')[0];
}

export function formatInsuranceDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy', { locale: fr });
  } catch {
    return dateStr;
  }
}
