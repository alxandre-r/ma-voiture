/**
 * @file app/(app)/family/components/FamilyMembers.tsx
 * @fileoverview Async Server Component that fetches and displays family members.
 * Wrapped in Suspense for streaming.
 */

import { getFamilyMembers } from '@/lib/data/family/getFamilyMembers';

import { FamilyMemberList } from './members/FamilyMemberList';

interface FamilyMembersProps {
  familyId: string;
  currentUserId: string;
  currentUserRole: 'owner' | 'member';
}

export default async function FamilyMembers({
  familyId,
  currentUserId,
  currentUserRole,
}: FamilyMembersProps) {
  // Fetch members on the server
  const members = await getFamilyMembers(familyId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      <FamilyMemberList
        members={members}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
