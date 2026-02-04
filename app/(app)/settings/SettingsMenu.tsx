"use client";

import Icon from "@/components/ui/Icon";
import { SettingsSection } from "./SettingsLayout";

type Props = {
  activeSection: SettingsSection;
  onChange: (section: SettingsSection) => void;
};

const menuItems: {
  id: SettingsSection;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
}[] = [
  { id: "appearance", label: "Apparence", icon: "settings" },
  { id: "units", label: "Unités", icon: "conso" },
  { id: "account", label: "Mon compte", icon: "user" },
  { id: "patchnotes", label: "Notes de version", icon: "notes" },
  { id: "privacy", label: "Confidentialité", icon: "secure" },
  { id: "logout", label: "Déconnexion", icon: "garage" },
];

export default function SettingsMenu({ activeSection, onChange }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-6">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors
              ${
                activeSection === item.id
                  ? "bg-custom-1 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
          >
            <Icon
              name={item.icon}
              size={18}
              className={activeSection === item.id ? "invert dark:invert-0" : ""}
            />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}