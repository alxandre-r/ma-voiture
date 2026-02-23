/**
 * @file src/app/family/page.tsx
 * @fileoverview Family page allowing users to create or join a family.
 */
import React from 'react';
import { redirect } from 'next/navigation';
import FamilyClient from './FamilyClient';

import { getCurrentUserInfo } from '@/lib/data/user/getCurrentUserInfo';
import { getFamilyInfo } from '@/lib/data/family/getFamilyInfo';

import JoinFamilyWelcomePage from '@/components/family/welcomePage';

export default async function FamilyPage() {
  const user = await getCurrentUserInfo();
  if (!user) redirect("/");
  if (!user.has_family) {
    return <JoinFamilyWelcomePage />;
  }

  const familyInfo = await getFamilyInfo(user.family_id); 
  return (
      <div className="family-page-content">
        <FamilyClient user={user} family={familyInfo} />
      </div>
  );
}