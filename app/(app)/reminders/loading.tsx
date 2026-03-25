import { Card, CardContent, CardHeader } from '@/components/common/ui/card';

function ReminderSkeleton() {
  return (
    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 animate-pulse space-y-3">
      <div className="flex items-center gap-2 pr-8">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-40" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
      </div>
      <div className="flex gap-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-36" />
      </div>
    </div>
  );
}

export default function RemindersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Button placeholder */}
      <div className="hidden sm:flex justify-end">
        <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>

      {/* Card with skeletons */}
      <Card>
        <CardHeader>
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ReminderSkeleton />
            <ReminderSkeleton />
            <ReminderSkeleton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
