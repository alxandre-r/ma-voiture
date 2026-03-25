// app/(app)/settings/layout.tsx
import PrivateLayoutContent from '../PrivateLayoutContent';

import type { ReactNode } from 'react';

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return <PrivateLayoutContent title="Paramètres">{children}</PrivateLayoutContent>;
}
