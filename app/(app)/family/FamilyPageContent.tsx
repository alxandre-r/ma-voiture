'use client';

import { useEffect } from 'react';

import JoinFamilyWelcomePage from '@/components/family/welcomePage';
import { useSetHeader } from '@/contexts/HeaderContext';

import FamilyClient from './FamilyClient';

import type { Family } from '@/types/family';
import type { User } from '@/types/user';

interface FamilyMember {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  joined_at: string;
  avatar_url?: string;
}

interface FamilyPageContentProps {
  user: User;
  familyInfo: Family | null;
  familyMembers?: FamilyMember[];
}

export default function FamilyPageContent({
  user,
  familyInfo,
  familyMembers = [],
}: FamilyPageContentProps) {
  const setHeader = useSetHeader();

  useEffect(() => {
    if (!user.has_family) {
      setHeader({ title: 'Ma Famille' });
    } else if (familyInfo) {
      setHeader({ title: 'Gestion de la famille' });
    }
  }, [setHeader, user.has_family, familyInfo]);

  if (!user.has_family) {
    return <JoinFamilyWelcomePage />;
  }

  return (
    <div className="family-page-content">
      <FamilyClient user={user} family={familyInfo as Family} initialMembers={familyMembers} />
    </div>
  );
}
