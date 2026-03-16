// User type definition based on the "users_info" view in Supabase.
export interface Vehicle {
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
  last_fill_date: string | null; // timestamptz
  calculated_consumption?: number | null; // L/100km (calculated from fills)

  // New fields from garage_model
  status?: 'active' | 'inactive' | null;
  vin?: string | null;
  transmission?: 'Manuelle' | 'Automatique' | null;
  image?: string | null;
  insurance_start_date?: string | null;
  insurance_monthly_cost?: number | null;
  tech_control_expiry?: string | null;
  financing_mode?: 'owned' | 'lld' | 'loa' | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
}

// Owner info for family vehicles display
export interface VehicleOwner {
  user_id: string;
  user_name: string;
  avatar_url?: string | null;
}

export interface VehicleMinimal {
  vehicle_id: number;
  owner_id?: string | null;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  odometer?: number | null;
  color?: string | null;
  // Added for EV support
  fuel_type?: string | null;
  // Added for filtering active vehicles
  status?: 'active' | 'inactive' | null;
}
