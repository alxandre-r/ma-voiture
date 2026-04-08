'use client';

/**
 * @file app/(app)/family/loading.tsx
 * @fileoverview Loading skeleton shown during navigation to the family page.
 * Uses UserContext (already populated by AppDataProvider) to show the correct
 * skeleton without an extra fetch — no flicker for users without a family.
 */
import Spinner from '@/components/common/ui/Spinner';
import { useUser } from '@/contexts/UserContext';

import FamilySharedInfo from './components/FamilySharedInfo';

export default function Loading() {
  const user = useUser();

  // Users without a family → just a spinner
  if (!user.has_family) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-in fade-in duration-300">
        <Spinner />
      </div>
    );
  }

  // Users with a family → skeleton matching the new multi-family page layout
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-gray-500 dark:text-gray-400">
          Gérez vos groupes familiaux et le partage de vos véhicules.
        </p>
        <button
          disabled
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-custom-2 text-white font-semibold rounded-xl opacity-50 cursor-not-allowed whitespace-nowrap"
        >
          <Spinner />
        </button>
      </div>

      {/* Family card skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div>
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-600 rounded mt-1 animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-20 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 w-24 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      <FamilySharedInfo />
    </div>
  );
}
