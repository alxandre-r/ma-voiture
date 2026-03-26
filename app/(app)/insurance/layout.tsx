// app/(app)/insurance/layout.tsx
import PrivateLayoutContent from '../PrivateLayoutContent';

import type { ReactNode } from 'react';

interface InsuranceLayoutProps {
  children: ReactNode;
}
export default function InsuranceLayout({ children }: InsuranceLayoutProps) {
  return (
    <PrivateLayoutContent title="Assurance" showFilters>
      {children}
    </PrivateLayoutContent>
  );
}
