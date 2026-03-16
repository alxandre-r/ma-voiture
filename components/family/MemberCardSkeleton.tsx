'use client';

import React from 'react';

export const MemberCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800/40 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 flex flex-col animate-pulse min-w-0">
      <div className="flex justify-between items-start mb-4">
        {/* Avatar Skeleton */}
        <div className="w-16 h-16 rounded-full border-4 border-slate-50 dark:border-white/10 bg-slate-200 dark:bg-slate-700"></div>

        {/* Role Badge Skeleton */}
        <div className="w-16 h-5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
      </div>

      {/* Name & Email Skeleton */}
      <div className="space-y-2">
        <div className="w-32 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="w-40 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>

      {/* Footer Skeleton */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="w-24 h-3 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>
    </div>
  );
};
