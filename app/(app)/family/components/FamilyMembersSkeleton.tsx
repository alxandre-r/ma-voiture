'use client';

/**
 * @file FamilyMembersSkeleton.tsx
 * @fileoverview Skeleton loading state for family members section.
 */
import { MemberCardSkeleton } from './members/MemberCardSkeleton';

export function FamilyMembersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      <MemberCardSkeleton />
      <MemberCardSkeleton />
      <MemberCardSkeleton />
    </div>
  );
}
