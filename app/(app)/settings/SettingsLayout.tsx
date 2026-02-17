"use client";

import { useState } from "react";
import SettingsMenu from "./SettingsMenu";

import AppearanceSection from "./sections/Appearance";
import UnitsSection from "./sections/Units";
import AccountSection from "./sections/Account";
import PatchnotesSection from "./sections/Patchnotes";
import PrivacySection from "./sections/Privacy";
import LogoutSection from "./sections/Logout";

export type SettingsSection =
  | "account"
  | "appearance"
  | "units"
  | "patchnotes"
  | "privacy"
  | "logout";

export default function SettingsLayout() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("account");

  return (
    <main>
      <h1 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
        Paramètres
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <SettingsMenu
            activeSection={activeSection}
            onChange={setActiveSection}
          />
        </aside>

        <div className="lg:col-span-3">
          {activeSection === "account" && <AccountSection />}
          {activeSection === "appearance" && <AppearanceSection />}
          {activeSection === "units" && <UnitsSection />}
          {activeSection === "patchnotes" && <PatchnotesSection />}
          {activeSection === "privacy" && <PrivacySection />}
          {activeSection === "logout" && <LogoutSection />}
        </div>
      </div>
    </main>
  );
}