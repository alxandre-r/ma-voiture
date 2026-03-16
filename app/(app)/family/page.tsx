/**
 * @file src/app/family/page.tsx
 * @fileoverview Family page allowing users to create or join a family.
 */
import { redirect } from 'next/navigation';
import React from 'react';

import { getFamilyInfo, getFamilyMembers } from '@/lib/data/family';
import { getCurrentUserInfo } from '@/lib/data/user';

import FamilyPageContent from './FamilyPageContent';

import type { Family } from '@/types/family';
import type { User } from '@/types/user';

export default async function FamilyPage() {
  const user = await getCurrentUserInfo();
  if (!user) redirect('/');

  const familyInfo = user.has_family ? await getFamilyInfo(user.family_id) : null;
  const familyMembers =
    user.has_family && user.family_id ? await getFamilyMembers(user.family_id) : [];

  return (
    <FamilyPageContent
      user={user as User}
      familyInfo={familyInfo as Family | null}
      familyMembers={familyMembers}
    />
  );
}
