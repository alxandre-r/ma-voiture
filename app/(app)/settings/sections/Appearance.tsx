"use client";

import { useTheme } from "next-themes";
import Icon from "@/components/ui/Icon";

export default function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Icon name="settings" size={24} />
        Apparence
      </h2>

      <label className="block mb-2 font-medium">Thème</label>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="w-full lg:w-[360px] p-3 rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
      >
        <option value="light">Clair</option>
        <option value="dark">Sombre</option>
        <option value="system">Système</option>
      </select>
    </section>
  );
}