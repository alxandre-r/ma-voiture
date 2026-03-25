/**
 * @file FamilyMembersSection.tsx
 * @fileoverview Server Component wrapper for family members list.
 * Fetches members on the server and renders the client component.
 */
import { getFamilyMembers } from '@/lib/data/family/getFamilyMembers';

import { FamilyMemberList } from './members/FamilyMemberList';

interface FamilyMembersSectionProps {
  familyId: string;
  currentUserId: string;
  currentUserRole: 'owner' | 'member';
  onRemoveMember?: (userId: string) => Promise<void>;
  isRemoving?: boolean;
}

export default async function FamilyMembersSection({
  familyId,
  currentUserId,
  currentUserRole,
  onRemoveMember,
  isRemoving = false,
}: FamilyMembersSectionProps) {
  // Fetch members on the server
  const members = await getFamilyMembers(familyId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      <FamilyMemberList
        members={members}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onRemoveMember={onRemoveMember}
        isRemoving={isRemoving}
      />
    </div>
  );
}
