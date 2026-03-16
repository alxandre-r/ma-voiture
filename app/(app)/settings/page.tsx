/**
 * @file app/settings/page.tsx
 * @summary Server Component for the Settings page that loads current user information.
 *
 * Current user informations are needed for the Account section.
 */

import { redirect } from 'next/navigation';
import React from 'react';

import { getCurrentUserInfo } from '@/lib/data/user';

import SettingsPageContent from './SettingsPageContent';

import type { User } from '@/types/user';

export default async function SettingsPage() {
  const user = await getCurrentUserInfo();
  if (!user) redirect('/');

  return <SettingsPageContent user={user as User} />;
}
