'use client';

export default function ExpenseSkeleton({ isLast }: { isLast?: boolean }) {
  return (
    <div className="relative flex items-stretch gap-2 sm:gap-6 animate-pulse">
      {/* Desktop Date */}
      <div className="hidden sm:block w-16 sm:w-24 shrink-0 pt-1.5">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-10 mb-1 ml-auto"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-8 ml-auto"></div>
      </div>

      {/* Timeline Node */}
      <div className="relative flex flex-col items-center">
        <div className="hidden sm:flex w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-custom-2 z-10"></div>

        <div className="sm:hidden w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-custom-2 flex flex-col items-center justify-center z-10 -ml-1">
          <div className="h-2 w-4 bg-gray-300 dark:bg-gray-600 rounded mb-0.5"></div>
          <div className="h-1 w-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
        </div>
        {!isLast && <div className="w-0.5 bg-gray-200 dark:bg-gray-700 flex-1 my-1"></div>}
      </div>

      <div className="flex-1 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:gap-0">
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20 sm:w-32 mt-1"></div>
              <div className="h-6 bg-gray-300 dark:bg-custom-1/30 rounded-full w-16 sm:w-24 mt-1 border border-custom-1"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-18 ml-auto mt-1"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>

        <div className="w-full border-t border-gray-200 dark:border-gray-700 mt-6"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded sm:w-1/4 w-2/4 mt-6"></div>
      </div>
    </div>
  );
}
