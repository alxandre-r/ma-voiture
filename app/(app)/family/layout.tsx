// app/(app)/family/layout.tsx
import PrivateLayoutContent from '../PrivateLayoutContent';

import type { ReactNode } from 'react';

interface FamilyLayoutProps {
  children: ReactNode;
}

export default function FamilyLayout({ children }: FamilyLayoutProps) {
  return <PrivateLayoutContent title="Famille">{children}</PrivateLayoutContent>;
}
