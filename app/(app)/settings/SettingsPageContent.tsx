'use client';

import { useEffect } from 'react';

import { useSetHeader } from '@/contexts/HeaderContext';

import SettingsLayout from './SettingsLayout';

import type { User } from '@/types/user';

export default function SettingsPageContent({ user }: { user: User }) {
  const setHeader = useSetHeader();

  useEffect(() => {
    setHeader({ title: 'Paramètres' });
  }, [setHeader]);

  return <SettingsLayout user={user} />;
}
