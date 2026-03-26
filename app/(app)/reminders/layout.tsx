import PrivateLayoutContent from '../PrivateLayoutContent';

import type { ReactNode } from 'react';

export const metadata = {
  title: 'Rappels – Ma Voiture',
};

export default function RemindersLayout({ children }: { children: ReactNode }) {
  return (
    <PrivateLayoutContent title="Rappels" showFilters>
      {children}
    </PrivateLayoutContent>
  );
}
