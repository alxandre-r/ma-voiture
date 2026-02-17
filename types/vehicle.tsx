export interface Vehicle { // corresponds to the "vehicles_for_display" view in Supabase
  vehicle_id: number;
  owner_id?: string | null;
  owner_name?: string | null;
  family_id?: string | null;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
  fuel_type?: string | null;
  odometer?: number | null;
  plate?: string | null;
  created_at?: string | null;
  last_fill?: string | null;          // timestamptz
  calculated_consumption?: number | null; // L/100km
}

export interface VehicleForDisplay extends Vehicle {
  last_fill_date?: string | null;    // timestamptz
  last_fill_amount?: number | null;  // litres
  last_fill_odometer?: number | null; // km
}

export interface VehicleMinimal {
  vehicle_id: number;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  odometer?: number | null;
  color?: string | null;
}