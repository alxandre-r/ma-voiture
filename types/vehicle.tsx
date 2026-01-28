/**
 * @file types/vehicle.ts
 * @fileoverview TypeScript type definition for Vehicle objects stored in Supabase.
 */

export interface Vehicle {
  id: number;
  owner?: string | null;
  owner_name?: string | null;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  fuel_type?: string | null;
  manufacturer_consumption?: number | null;
  odometer?: number | null;
  plate?: string | null;
  last_fill?: string | null; // timestamptz format
  created_at?: string | null;
  [key: string]: unknown; // Allow for additional fields from API
}

export interface VehicleMinimal {
  id: number;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  odometer?: number | null;
}