/**
 * @file src/app/family/page.tsx
 * @fileoverview Family page allowing users to create or join a family.
 */
import { redirect } from 'next/navigation';
import React from 'react';

import JoinFamilyWelcomePage from '@/components/family/welcomePage';
import { getFamilyInfo } from '@/lib/data/family/getFamilyInfo';
import { getCurrentUserInfo } from '@/lib/data/user/getCurrentUserInfo';

import FamilyClient from './FamilyClient';

import type { Family } from '@/types/family';
import type { User } from '@/types/user';

export default async function FamilyPage() {
  const user = await getCurrentUserInfo();
  if (!user) redirect('/');
  if (!user.has_family) {
    return <JoinFamilyWelcomePage />;
  }

  const familyInfo = await getFamilyInfo(user.family_id);
  return (
    <div className="family-page-content">
      <FamilyClient user={user as User} family={familyInfo as Family} />
    </div>
  );
}
