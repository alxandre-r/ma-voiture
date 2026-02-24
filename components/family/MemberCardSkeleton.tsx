// components/family/MemberCardSkeleton.tsx
// This component is a skeleton loader for the family member card, used while fetching family members data.

import React from 'react';

export const MemberCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-lg shadow-xs border border-gray-200 dark:border-gray-600 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Avatar */}
        <div className="hidden lg:flex w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

        {/* Center: Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + Badge | Role */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {/* Name */}
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              {/* "Vous" badge skeleton */}
              <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>

            {/* Role badge */}
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>

          {/* Row 2: Email | Joined date */}
          <div className="flex items-center justify-between gap-2">
            {/* Email */}
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />

            {/* Joined date */}
            <div className="hidden lg:flex h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
