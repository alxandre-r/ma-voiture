'use client';

/**
 * Skeleton shown while app data (user, vehicles) loads.
 * This allows the layout shell to render immediately.
 */
export default function AppLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex w-72 bg-gray-900 animate-pulse" />

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header skeleton */}
        <header className="bg-white/80 dark:bg-gray-900/80 h-16 animate-pulse" />

        {/* Page content area */}
        <main className="flex-1 p-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </main>
      </div>
    </div>
  );
}
