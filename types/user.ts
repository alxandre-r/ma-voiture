// User type definition based on the "users_info" view in Supabase.
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  has_family: boolean;
  family_id?: string | null;
  family_name?: string | null;
  family_role?: 'owner' | 'member' | null;
  is_family_owner: boolean;
  has_vehicles: boolean;
  vehicle_count: number;
  vehicle_ids: number[];
  created_at: string;
}
