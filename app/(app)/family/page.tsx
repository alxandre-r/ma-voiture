/**
 * @file app/(app)/family/page.tsx
 * @fileoverview Page famille multi-famille.
 *
 * Affiche une carte par famille, avec membres et véhicules.
 * Une section "Rejoindre une autre famille" est toujours accessible.
 */
import { getCurrentUserInfo } from '@/lib/data/user/getCurrentUserInfo';

import FamilyCard from './components/FamilyCard';
import { FamilyPageHeader } from './components/FamilyPageHeader';
import FamilySharedInfo from './components/FamilySharedInfo';
import WelcomePage from './components/WelcomePage';

import type { User } from '@/types/user';

export default async function FamilyPage() {
  const user = (await getCurrentUserInfo()) as User | null;

  if (!user) {
    return null;
  }

  if (!user.has_family || user.families.length === 0) {
    return <WelcomePage />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {[...user.families]
        .sort((a, b) => (b.is_owner ? 1 : 0) - (a.is_owner ? 1 : 0))
        .map((family) => (
          <FamilyCard
            key={family.id}
            familyId={family.id}
            isOwner={family.is_owner}
            currentUserId={user.id}
          />
        ))}
      <FamilySharedInfo />
      <FamilyPageHeader />
    </div>
  );
}
