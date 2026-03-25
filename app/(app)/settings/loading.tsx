/**
 * @file app/(app)/settings/loading.tsx
 * @fileoverview Loading skeleton for the settings page, shown during navigation.
 */

function SettingsMenuSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="grid grid-cols-2 md:flex md:flex-col gap-2 md:space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse shrink-0" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsContentSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-100 dark:bg-gray-700/50 rounded-lg animate-pulse" />
        </div>
      ))}
      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <SettingsMenuSkeleton />
      </div>
      <div className="lg:col-span-3">
        <SettingsContentSkeleton />
      </div>
    </div>
  );
}
