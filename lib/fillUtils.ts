/**
 * @file lib/fillUtils.ts
 * @fileoverview Utility functions for sorting and filtering fuel fill-up records.
 * 
 * This file contains helper functions for sorting fills by various criteria
 * and handling date comparisons.
 */

import { Fill } from '@/types/fill';

/**
 * Sort fills based on criteria and direction
 * 
 * @param fills - Array of fill records to sort
 * @param sortBy - Field to sort by ('date', 'amount', 'price_per_liter')
 * @param sortDirection - Sort direction ('asc' or 'desc')
 * @returns Sorted array of fills
 */
export function sortFills(
  fills: Fill[],
  sortBy: string = 'date',
  sortDirection: 'asc' | 'desc' = 'desc'
): Fill[] {
  if (!fills || fills.length === 0) {
    return fills;
  }

  return [...fills].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        // Compare by date (newest first by default)
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        break;
      
      case 'amount':
        // Compare by amount
        const aAmount = a.amount || 0;
        const bAmount = b.amount || 0;
        comparison = bAmount - aAmount; // Higher amounts first by default
        break;
      
      case 'price_per_liter':
        // Compare by price per liter
        const aPrice = a.price_per_liter || 0;
        const bPrice = b.price_per_liter || 0;
        comparison = bPrice - aPrice; // Higher prices first by default
        break;
      
      default:
        // Default to date sorting
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
    }

    // Apply sort direction
    return sortDirection === 'desc' ? comparison : -comparison;
  });
}

/**
 * Filter fills based on vehicle, year, and month criteria
 * 
 * @param fills - Array of fill records to filter
 * @param vehicleFilter - Vehicle ID to filter by, or 'all'
 * @param yearFilter - Year to filter by, or 'all'
 * @param monthFilter - Month to filter by (0-11), or 'all'
 * @returns Filtered array of fills
 */
export function filterFills(
  fills: Fill[],
  vehicleFilter: string | number = 'all',
  yearFilter: string = 'all',
  monthFilter: string = 'all'
): Fill[] {
  if (!fills || fills.length === 0) {
    return fills;
  }

  return fills.filter((fill) => {
    // Vehicle filter - now using vehicle_id instead of vehicle_name
    const vehicleMatch = vehicleFilter === 'all' ||
      (fill.vehicle_id && fill.vehicle_id.toString() === vehicleFilter.toString());

    // Year filter
    const yearMatch = yearFilter === 'all' ||
      (fill.date && new Date(fill.date).getFullYear().toString() === yearFilter);

    // Month filter
    const monthMatch = monthFilter === 'all' ||
      (fill.date && new Date(fill.date).getMonth().toString() === monthFilter);

    return vehicleMatch && yearMatch && monthMatch;
  });
}

/**
 * Apply both filtering and sorting to fills
 * 
 * @param fills - Array of fill records
 * @param filters - Filter and sort criteria
 * @returns Processed array of fills
 */
export function processFills(
  fills: Fill[],
  filters: {
    vehicleFilter: string | number;
    yearFilter: string;
    monthFilter: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  }
): Fill[] {
  const filtered = filterFills(
    fills,
    filters.vehicleFilter,
    filters.yearFilter,
    filters.monthFilter
  );

  const sorted = sortFills(filtered, filters.sortBy, filters.sortDirection);

  return sorted;
}

// Formatage monétaire
export function formatCurrency(value: number | null | undefined) {
  return value != null ? `${value.toFixed(2)} €` : "N/A";
}
