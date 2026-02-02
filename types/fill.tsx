/**
 * @file types/fill.tsx
 * @fileoverview Type definitions for fuel fill-up records.
 * 
 * This file contains TypeScript interfaces for fuel fill-up data
 * used throughout the application.
 */

/**
 * Fuel Fill-Up Record Interface
 * 
 * Represents a single fuel fill-up entry with all relevant data
 * for tracking vehicle fuel consumption and expenses.
 */
export interface Fill {
  id?: number; // Auto-incremented by database
  vehicle_id: number; // Foreign key to vehicles table
  owner: string; // User ID who created the fill
  date: string; // Date of fill-up (YYYY-MM-DD)
  odometer: number | null; // Odometer reading in km
  liters: number | null; // Liters of fuel added
  amount: number | null; // Total cost of fill-up
  price_per_liter: number | null; // Price per liter (calculated or entered)
  is_full?: boolean; // Whether this was a full tank fill
  notes: string | null; // Additional notes
  created_at?: string; // Timestamp when record was created
  
  // Additional computed fields for UI display
  vehicle_name?: string | null; // Vehicle name for display
}

/**
 * Fill Form Data Interface
 * 
 * Data structure used in fill-up forms before submission.
 */
export interface FillFormData {
  vehicle_id: number;
  date: string;
  odometer: string;
  liters: string;
  amount: string;
  price_per_liter: string;
  notes: string;
}

/**
 * Fill Stats Interface
 * 
 * Computed statistics for fuel consumption analysis.
 */
export interface FillStats {
  total_fills: number;
  total_liters: number;
  total_cost: number;
  avg_price_per_liter: number;
  avg_consumption: number; // L/100km
  last_fill_date: string | null;
  last_odometer: number | null;
  monthly_chart: Array<{
    month: string;
    amount: number;
    count: number;
    odometer: number | null;
  }>;
}