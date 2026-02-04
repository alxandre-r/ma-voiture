// Represents a single fuel fill-up entry.
export interface Fill {
  id?: number;
  vehicle_id: number;
  owner: string;
  date: string;                 // YYYY-MM-DD
  odometer: number;
  liters: number;
  amount: number;
  price_per_liter: number;
  notes?: string | null;
  created_at?: string;

  // Computed for UI
  vehicle_name?: string | null;
}


//Form data structure for submitting a fill
export interface FillFormData {
  vehicle_id: number;
  date: string;
  odometer: string;
  liters: string;
  amount: string;
  price_per_liter: string;
  notes?: string;
}


// Computed statistics for fills
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