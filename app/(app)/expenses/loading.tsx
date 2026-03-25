import { Card, CardContent } from '@/components/common/ui/card';

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 sm:gap-4 py-3 px-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-3 w-44 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <div className="h-3 w-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-8" />
      </div>
      <div className="sm:hidden h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

function MonthCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <CardContent className="p-0">
        {Array.from({ length: rows }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Add button placeholder */}
      <div className="hidden sm:flex justify-end">
        <div className="h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar skeleton */}
        <aside className="max-lg:hidden w-44 shrink-0">
          <Card>
            <div className="p-3 space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </Card>
        </aside>

        {/* Main skeleton */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <div className="p-2 sm:p-3 text-center space-y-1.5">
                  <div className="h-2.5 sm:h-3 w-10 sm:w-14 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mx-auto" />
                  <div className="h-3 sm:h-4 w-14 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                </div>
              </Card>
            ))}
          </div>

          <MonthCardSkeleton rows={4} />
          <MonthCardSkeleton rows={3} />
        </div>
      </div>
    </div>
  );
}
