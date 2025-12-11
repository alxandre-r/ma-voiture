/**
 * @file app/(app)/Topbar.tsx
 * @fileoverview Top navigation bar for mobile layout.
 * 
 * This component provides a top bar with settings access for mobile users.
 * Includes a placeholder for page titles and a settings button.
 */

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * Topbar Component
 * 
 * Mobile top navigation bar with settings button.
 * Provides quick access to settings page.
 */
export default function Topbar() {
  const router = useRouter();

  return (
    <header className="sticky top-0  h-16 flex items-center justify-between px-6">
      {/* Page title placeholder - can be customized per page */}
      <h1 className="text-xl font-semibold">
        {/* Title can change depending on page if needed */}
      </h1>

      {/* Settings button with animation */}
      <button
        onClick={() => router.push("/settings")}
        className="group p-2 rounded-lg border transition hover:cursor-pointer hover:border-gray-400 hover:bg-gray-100
        dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Paramètres"
      >
        <Image
          src="/icons/settings.svg"
          alt="Paramètres"
          className="dark:invert transition-transform duration-200 ease-in-out group-hover:rotate-90"
          width={26}
          height={26}
        />
      </button>
    </header>
  );
}