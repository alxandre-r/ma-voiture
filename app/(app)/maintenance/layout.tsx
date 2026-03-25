// app/(app)/maintenance/layout.tsx
import PrivateLayoutContent from '../PrivateLayoutContent';

import type { ReactNode } from 'react';

interface MaintenanceLayoutProps {
  children: ReactNode;
}

export default function MaintenanceLayout({ children }: MaintenanceLayoutProps) {
  return (
    <PrivateLayoutContent title="Entretiens" showFilters>
      {children}
    </PrivateLayoutContent>
  );
}
