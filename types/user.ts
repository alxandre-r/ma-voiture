export interface UserFamily {
  id: string;
  name: string;
  role: 'owner' | 'member';
  is_owner: boolean;
}

// User type definition based on the "users_info" view in Supabase.
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  has_family: boolean;
  families: UserFamily[];
  has_vehicles: boolean;
  vehicle_count: number;
  vehicle_ids: number[];
  created_at: string;
}
