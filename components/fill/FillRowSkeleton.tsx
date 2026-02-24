'use client';

export default function FillRowSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 px-2 sm:px-4 py-4 border-b border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="flex items-center justify-between gap-1">
        {/* Left items */}
        <div className="flex w-full items-center gap-1">
          {/* DATE */}
          <div className="w-2/12 h-4 md:h-5 bg-gray-200 dark:bg-gray-700 rounded" />

          {/* VEHICLE */}
          <div className="w-3/12 md:w-2/12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />

          {/* AMOUNT */}
          <div className="w-2/12 md:w-1/12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />

          {/* ODOMETER */}
          <div className="w-3/12 md:w-1/12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />

          {/* NOTES */}
          <div className="w-4/12 hidden lg:flex h-4 bg-gray-200 dark:bg-gray-700 rounded" />

          {/* Mobile notes toggle */}
          <div className="w-1/12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />

          {/* Action menu */}
          <div className="w-1/12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}
