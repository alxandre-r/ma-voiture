'use client';

import { useState } from 'react';

import AccountSection from './sections/Account';
import AppearanceSection from './sections/Appearance';
import LogoutSection from './sections/Logout';
import PatchnotesSection from './sections/Patchnotes';
import PrivacySection from './sections/Privacy';
import UnitsSection from './sections/Units';
import SettingsMenu from './SettingsMenu';

import type { User } from '@/types/user';

export default function SettingsLayout({ user }: { user: User }) {
  const [activeSection, setActiveSection] = useState('account');

  return (
    <main>
      <h1 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Paramètres</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <SettingsMenu activeSection={activeSection} onChange={setActiveSection} />
        </aside>

        <div className="lg:col-span-3">
          {activeSection === 'account' && <AccountSection user={user} />}
          {activeSection === 'appearance' && <AppearanceSection />}
          {activeSection === 'units' && <UnitsSection />}
          {activeSection === 'patchnotes' && <PatchnotesSection />}
          {activeSection === 'privacy' && <PrivacySection />}
          {activeSection === 'logout' && <LogoutSection />}
        </div>
      </div>
    </main>
  );
}
