// Period type definitions for filtering expenses by time range.

/** Named preset periods */
export type PeriodPreset = 'month' | '3months' | '6months' | 'year' | '12months' | 'all';

/** A custom date range chosen by the user */
export interface CustomPeriod {
  preset: 'custom';
  start: string; // ISO date YYYY-MM-DD (inclusive)
  end: string; // ISO date YYYY-MM-DD (inclusive)
}

/** Either a named preset or a custom date range */
export type PeriodSelection = PeriodPreset | CustomPeriod;

/** Human-readable labels for preset periods (used in the selector UI) */
export const PERIOD_PRESET_LABELS: Record<PeriodPreset, string> = {
  month: 'Ce mois',
  '3months': '3 derniers mois',
  '6months': '6 derniers mois',
  year: 'Cette année',
  '12months': '12 derniers mois',
  all: 'Tout',
};
