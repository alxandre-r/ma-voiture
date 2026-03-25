/**
 * @file app/(app)/family/page.tsx
 * @fileoverview Family page with streaming only where needed.
 *
 * Streaming strategy:
 * - Header renders immediately: family_name + isOwner come from cached user,
 *   invite_token from getFamilyInfo (fast single-row query, no skeleton needed).
 * - Members stream independently behind their own Suspense boundary.
 * - Static info renders immediately.
 */
import { Suspense } from 'react';

import { getFamilyInfo } from '@/lib/data/family/getFamilyInfo';
import { getCurrentUserInfo } from '@/lib/data/user/getCurrentUserInfo';

import { FamilyErrorBoundary } from './components/FamilyErrorBoundary';
import { FamilyInfoUI } from './components/FamilyInfoUI';
import FamilyMembers from './components/FamilyMembers';
import { FamilyMembersSkeleton } from './components/FamilyMembersSkeleton';
import FamilySharedInfo from './components/FamilySharedInfo';
import WelcomePage from './components/WelcomePage';

import type { User } from '@/types/user';

export default async function FamilyPage() {
  const user = (await getCurrentUserInfo()) as User;

  if (!user.has_family || !user.family_id) {
    return <WelcomePage />;
  }

  // getFamilyInfo is cached — only needed for invite_token (not in user object).
  // Awaiting here keeps the header skeleton-free: it renders with real data immediately.
  const family = await getFamilyInfo(user.family_id);

  return (
    <div>
      {/* Header — renders immediately, no Suspense needed */}
      {family && <FamilyInfoUI family={family} isOwner={user.is_family_owner} />}

      {/* Members — only section that streams */}
      <FamilyErrorBoundary>
        <Suspense fallback={<FamilyMembersSkeleton />}>
          <FamilyMembers
            familyId={user.family_id}
            currentUserId={user.id}
            currentUserRole={user.is_family_owner ? 'owner' : 'member'}
          />
        </Suspense>
      </FamilyErrorBoundary>

      <FamilySharedInfo />
    </div>
  );
}
