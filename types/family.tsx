export type FamilyRole = 'owner' | 'member';

export interface Family {
  id: string;
  name: string;
  owner: string;       // User ID
  created_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: FamilyRole;
  joined_at: string;
}

export interface FamilyWithMembers extends Family {
  members: FamilyMember[];
}