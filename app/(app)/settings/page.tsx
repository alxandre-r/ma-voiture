/**
 * @file app/settings/page.tsx
 * @summary Server Component for the Settings page.
 */

import { getUserPreferences } from '@/lib/data/user/getUserPreferences';

import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const preferences = await getUserPreferences();
  return <SettingsClient initialPreferences={preferences} />;
}
