// app/(app)/statistics/layout.tsx
import PrivateLayoutContent from '../PrivateLayoutContent';

import type { ReactNode } from 'react';

interface StatisticsLayoutProps {
  children: ReactNode;
}

export default function StatisticsLayout({ children }: StatisticsLayoutProps) {
  return (
    <PrivateLayoutContent title="Statistiques" showFilters>
      {children}
    </PrivateLayoutContent>
  );
}
