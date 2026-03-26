'use client';

/**
 * @file VehicleCardSkeleton.tsx
 * @fileoverview Skeleton loading state for vehicle cards.
 */
export function VehicleCardSkeleton() {
  return (
    <div
      className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm 
  dark:bg-gray-800 dark:border-gray-700 animate-pulse"
    >
      {/* Image skeleton */}
      <div className="aspect-video w-full relative">
        <div className="h-full w-full bg-gray-200 dark:bg-gray-700" />

        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <div className="h-5 w-16 rounded-full bg-gray-300/70 dark:bg-gray-600/70 backdrop-blur-sm" />
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h4 className="font-bold text-gray-900 dark:text-gray-100">
            <div className="flex items-center gap-2">
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded" />
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          </h4>

          <div className="h-4 w-20 custom-1/10 dark:bg-custom-1/30 rounded mt-1" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="h-4 w-20 bg-gray-300 dark:bg-gray-500 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
