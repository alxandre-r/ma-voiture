// app/(app)/dashboard/layout.tsx
import PrivateLayoutContent from '../PrivateLayoutContent';

import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <PrivateLayoutContent title="Tableau de bord" showFilters>
      {children}
    </PrivateLayoutContent>
  );
}
