import { Card, CardContent, CardHeader } from '@/components/common/ui/card';

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-8 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {[1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse px-1" />
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="flex gap-1.5">
                  <div className="h-7 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
