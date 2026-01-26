export type FamilyRole = 'owner' | 'member';

export interface Family {
  id: string;
  name: string;
  created_at: string;
  owner: string;
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