/**
 * @file app/(app)/maintenance/loading.tsx
 * @fileoverview Loading skeleton for the maintenance page.
 * Mirrors the exact structure of MaintenanceClient: titles are visible,
 * only data values (dates, amounts, descriptions) are pulsed.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';

import MaintenanceCardSkeleton from './components/cards/MaintenanceCardSkeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header button — desktop only, matches MaintenanceContent layout */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="h-10 w-52 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>

      {/* Timeline card — mirrors MaintenanceTimeline structure */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Historique Récent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <MaintenanceCardSkeleton isLast={false} />
              <MaintenanceCardSkeleton isLast={false} />
              <MaintenanceCardSkeleton isLast={false} />
              <MaintenanceCardSkeleton isLast={true} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
