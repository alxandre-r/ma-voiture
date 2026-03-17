/**
 * @file lib/utils/formatUtils.ts
 * @fileoverview Utility functions for formatting currency and dates.
 */

/**
 * Format a number as currency (EUR)
 * @param value - The number to format
 * @returns Formatted currency string (e.g., "12.50 €")
 */
export function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(2)} €`;
}

/**
 * Format a number with spaces as thousand separator (French locale)
 * @param value - The number to format
 * @returns Formatted number string (e.g., "1 234")
 */
export function formatNumber(value: number | null | undefined): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }
  return value.toLocaleString('fr-FR');
}

/**
 * Format a date string to French locale format
 * @param dateStr - The date string to format
 * @returns Formatted date string (e.g., "12 jan. 2024")
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date string to short French locale format (for charts)
 * @param dateStr - The date string to format
 * @returns Short formatted date string (e.g., "24 janv.")
 */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}
