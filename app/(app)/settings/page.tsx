/**
 * @file app/settings/page.tsx
 * @summary Server Component for the Settings page.
 * All settings data is read from UserContext (populated by AppDataProvider).
 */

import SettingsClient from './SettingsClient';

export default function SettingsPage() {
  return <SettingsClient />;
}
