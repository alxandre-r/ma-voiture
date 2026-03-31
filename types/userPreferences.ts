export interface UserPreferences {
  user_id: string;
  show_consumption: boolean;
  show_insurance: boolean;
  show_vehicle_details: boolean;
  show_financials: boolean;
  default_period: 'month' | 'year' | 'all';
  default_vehicle_scope: 'personal' | 'family' | 'all';
  created_at: string;
  updated_at: string;
}
