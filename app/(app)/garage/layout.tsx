// app/(app)/garage/layout.tsx
import PrivateLayoutContent from '../PrivateLayoutContent';

import type { ReactNode } from 'react';

interface GarageLayoutProps {
  children: ReactNode;
}

export default function GarageLayout({ children }: GarageLayoutProps) {
  return <PrivateLayoutContent title="Garage">{children}</PrivateLayoutContent>;
}
