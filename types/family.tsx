export interface Family {
  id: string
  name: string
  owner: string
  created_at: string
  invite_token?: string
  invite_token_expires?: string
  invite_token_used?: boolean
}

export interface FamilyMember {
  user_id: string
  full_name: string
  email: string | null
  role: 'owner' | 'member'
  joined_at: string
}

export interface FamilySummary {
  total_vehicles: number
  total_fills: number
  total_liters: number
  total_spent: number
  last_fill_date: string | null
  average_consumption: number | null
}

export interface FamilyActivity {
  fill_id: number
  vehicle_id: number
  vehicle_name: string
  user_id: string
  user_name: string
  fill_date: string
  liters: number
  amount: number
  odometer: number
  activity_date: string
}

export interface InviteResponse {
  token: string
  link: string
  expires?: string
}