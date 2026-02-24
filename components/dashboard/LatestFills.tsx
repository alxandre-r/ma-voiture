// components/dashboard/LatestFills.tsx
'use client';

import Link from 'next/link';

import FillRowContainer from '@/components/fill/FillRowContainer';
import FillRowSkeleton from '@/components/fill/FillRowSkeleton';

import type { Fill } from '@/types/fill';

interface LatestFillsProps {
  fills: Fill[];
  loading: boolean;
  onRefresh?: () => void;
}

export default function LatestFills({ fills, loading, onRefresh }: LatestFillsProps) {
  if (!loading && fills.length === 0) return null;

  return (
    <div className="w-full mt-6 relative bg-white dark:bg-gray-800 rounded-xl py-4 shadow-sm dark:shadow-xl px-2 lg:px-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white px-2 sm:px-0 mb-4">
        Derniers pleins
      </h3>

      {loading && <FillRowSkeleton />}

      {fills.length > 0 && (
        <div className="pb-5 overflow-x-auto">
          {fills.slice(0, 4).map((fill) => (
            <FillRowContainer key={fill.id} fill={fill} showVehicleName onRefresh={onRefresh} />
          ))}

          <div className="mt-8 text-center">
            <Link
              href="/historique"
              className="px-5 py-3 bg-gradient-to-tr from-orange-400 to-custom-2 hover:from-orange-500 hover:to-custom-2-hover text-white rounded-lg"
            >
              Voir l&apos;historique complet ({fills.length} pleins)
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
