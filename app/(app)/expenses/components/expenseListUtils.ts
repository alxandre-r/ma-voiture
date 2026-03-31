import type { Expense } from '@/types/expense';

// ---------------------------------------------------------------------------
// Category definitions (multi-select filter pills)
// ---------------------------------------------------------------------------

export const CATEGORY_DEFS = [
  {
    key: 'energy',
    label: 'Énergie',
    icon: 'car',
    types: ['fuel', 'electric_charge'] as string[],
    activeClass:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  },
  {
    key: 'maintenance',
    label: 'Entretien',
    icon: 'tool',
    types: ['maintenance'] as string[],
    activeClass:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  },
  {
    key: 'insurance',
    label: 'Assurance',
    icon: 'secure',
    types: ['insurance'] as string[],
    activeClass:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
  },
  {
    key: 'other',
    label: 'Autre',
    icon: 'stack',
    types: ['other'] as string[],
    activeClass:
      'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700',
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getDescription(expense: Expense): string | null {
  if (expense.type === 'fuel' && expense.liters != null) {
    const parts = [`${expense.liters.toFixed(2)} L`];
    if (expense.price_per_liter) parts.push(`${expense.price_per_liter.toFixed(3)} €/L`);
    if (expense.odometer) parts.push(`${expense.odometer.toLocaleString('fr-FR')} km`);
    return parts.join(' · ');
  }
  if (expense.type === 'electric_charge' && expense.kwh != null) {
    const parts = [`${expense.kwh.toFixed(2)} kWh`];
    if (expense.price_per_kwh) parts.push(`${expense.price_per_kwh.toFixed(3)} €/kWh`);
    if (expense.odometer) parts.push(`${expense.odometer.toLocaleString('fr-FR')} km`);
    return parts.join(' · ');
  }
  if (expense.type === 'maintenance') {
    const parts: string[] = [];
    if (expense.maintenance_type_label) parts.push(expense.maintenance_type_label);
    if (expense.garage) parts.push(expense.garage);
    if (expense.odometer) parts.push(`${expense.odometer.toLocaleString('fr-FR')} km`);
    return parts.join(' · ') || null;
  }
  if (expense.type === 'insurance') return "Mensualité d'assurance";
  if (expense.type === 'other' && expense.label) return expense.label;
  return expense.notes ?? null;
}
