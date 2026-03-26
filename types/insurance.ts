export interface InsuranceContract {
  id: number;
  vehicle_id: number;
  owner_id: string;
  monthly_cost: number;
  start_date: string;
  end_date: string | null;
  provider: string | null;
}

export interface InsuranceFormData {
  provider: string;
  monthly_cost: number | string;
  start_date: string;
  end_date: string;
}
