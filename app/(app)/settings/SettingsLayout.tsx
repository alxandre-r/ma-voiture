/* eslint-disable import/order */
/**
 * @file src/app/settings/SettingsLayout.tsx
 * @description Layout for the settings page : displays the settings floating menu at left and the active section at right.
 */

'use client';

import { useState } from 'react';

import AccountSection from './sections/Account';
import AppearanceSection from './sections/Appearance';
import LogoutSection from './sections/Logout';
import PatchnotesSection from './sections/Patchnotes';
import PrivacySection from './sections/Privacy';
import PreferencesSection from './sections/Preferences';
import SettingsMenu from './SettingsMenu';

import type { User } from '@/types/user';

export default function SettingsLayout({ user }: { user: User }) {
  const [activeSection, setActiveSection] = useState('account');

  return (
    <main>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Floating menu */}
        <aside className="lg:col-span-1">
          <SettingsMenu activeSection={activeSection} onChange={setActiveSection} />
        </aside>

        {/* Active section content */}
        <div className="lg:col-span-3">
          {activeSection === 'account' && <AccountSection user={user} />}
          {activeSection === 'appearance' && <AppearanceSection />}
          {activeSection === 'preferences' && <PreferencesSection />}
          {activeSection === 'patchnotes' && <PatchnotesSection />}
          {activeSection === 'privacy' && <PrivacySection />}
          {activeSection === 'logout' && <LogoutSection />}
        </div>
      </div>
    </main>
  );
}
