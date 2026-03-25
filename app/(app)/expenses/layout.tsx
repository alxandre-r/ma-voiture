// app/(app)/expenses/layout.tsx
import PrivateLayoutContent from '../PrivateLayoutContent';

import type { ReactNode } from 'react';

interface ExpensesLayoutProps {
  children: ReactNode;
}

export default function ExpensesLayout({ children }: ExpensesLayoutProps) {
  return (
    <PrivateLayoutContent title="Dépenses" showFilters>
      {children}
    </PrivateLayoutContent>
  );
}
