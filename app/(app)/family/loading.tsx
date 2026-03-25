'use client';

/**
 * @file app/(app)/family/loading.tsx
 * @fileoverview Loading skeleton shown during navigation to the family page.
 * Uses UserContext (already populated by AppDataProvider) to show the correct
 * skeleton without an extra fetch — no flicker for users without a family.
 */
import Icon from '@/components/common/ui/Icon';
import Spinner from '@/components/common/ui/Spinner';
import { useUser } from '@/contexts/UserContext';

import FamilySharedInfo from './components/FamilySharedInfo';
import { MemberCardSkeleton } from './components/members/MemberCardSkeleton';

export default function Loading() {
  const user = useUser();

  // Users without a family → just a spinner
  if (!user.has_family) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  // Users with a family → show real header data from context + member skeleton
  return (
    <div>
      {/* Header with real data — no skeleton needed since data is already in context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:justify-between">
        <div className="md:flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-custom-2 dark:text-gray-100 tracking-tight flex items-center gap-2 justify-center md:justify-start">
            {user.family_name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Vous partagez vos véhicules et l&apos;historique de vos trajets avec votre famille
          </p>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {user.is_family_owner && (
            <button
              disabled
              className="inline-flex items-center justify-center gap-2 px-10 py-2 bg-custom-1 text-white font-semibold rounded-xl h-[44px] opacity-50 cursor-not-allowed"
            >
              <Spinner />
            </button>
          )}
          <button
            disabled
            className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center h-[44px] w-[44px] opacity-50 cursor-not-allowed"
            aria-label="Paramètres"
          >
            <Icon name="settings" size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Members skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {[1, 2].map((i) => (
          <MemberCardSkeleton key={i} />
        ))}
      </div>

      <FamilySharedInfo />
    </div>
  );
}
