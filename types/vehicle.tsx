/**
 * @file types/vehicle.ts
 * @fileoverview TypeScript type definition for Vehicle objects stored in Supabase.
 */

export interface Vehicle {
  id: string;
  owner: string;
  name: string;
  make: string;
  model: string;
  year: number;
  fuel_type: string;
  manufacturer_consumption: number;
  odometer: number | null;
  created_at: string;
}