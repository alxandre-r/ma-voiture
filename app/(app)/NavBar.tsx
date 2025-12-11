/**
 * @file app/(app)/NavBar.tsx
 * @fileoverview Mobile bottom navigation bar.
 * 
 * This component provides the main navigation for mobile users.
 * Shows navigation icons with labels in a bottom bar that's optimized for touch.
 * Only visible on mobile screens (hidden on md+ breakpoints).
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

/**
 * Mobile navigation menu items configuration.
 * 
 * @property {string} name - Display name
 * @property {string} path - URL path
 * @property {string} icon - Icon path
 */
const menuItems = [
    { name: "Tableau de bord", path: "/dashboard", icon: "/icons/dashboard.svg" },
    { name: "Garage", path: "/garage", icon: "/icons/garage.svg" },
    { name: "Consommations", path: "/historique", icon: "/icons/conso.svg" },
    { name: "Paramètres", path: "/settings", icon: "/icons/settings.svg" }, 
];

/**
 * NavBar Component
 * 
 * Mobile bottom navigation bar with icons and labels.
 * Highlights active route and provides touch-friendly navigation.
 * Automatically handles safe area insets for iOS devices.
 */
export default function NavBar() {
    const pathname = usePathname() || "/";

    return (
        <nav
            role="navigation"
            aria-label="Navigation mobile"
            className="fixed bottom-0 left-0 right-0 z-50 bg-white text-gray-900 border-t border-gray-300 dark:bg-gray-900 dark:text-white dark:border-gray-800 md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            {/* Navigation items container */}
            <div className="max-w-screen mx-auto flex justify-around items-center py-2">
                {menuItems.map((item) => {
                    const active = pathname.startsWith(item.path);

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            aria-current={active ? "page" : undefined}
                            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-md transition-colors
                                ${active ? "bg-white text-gray-900 dark:bg-gray-800 dark:text-white" : "dark:text-gray-400 hover:text-white hover:bg-gray-800"}`}
                        >
                            <Image
                                src={item.icon}
                                width={22}
                                height={22}
                                alt={item.name}
                                className={`block dark:invert`}
                            />
                            <span className="text-[11px] leading-none">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}