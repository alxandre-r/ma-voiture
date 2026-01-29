"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// ----- Types -----
type MenuItem = {
  name: string;
  path: string;
  icon: string;
};

// ----- Configuration -----
const MENU_ITEMS: MenuItem[] = [
  { name: "Tableau de bord", path: "/dashboard", icon: "/icons/dashboard.svg" },
  { name: "Garage", path: "/garage", icon: "/icons/garage.svg" },
  { name: "Consommations", path: "/historique", icon: "/icons/conso.svg" },
  { name: "Famille", path: "/family", icon: "/icons/responsive.svg" },
];

const BOTTOM_ITEM: MenuItem = {
  name: "Paramètres",
  path: "/settings",
  icon: "/icons/settings.svg",
};

// ----- Reusable item component -----
function SidebarItem({
  item,
  active,
  rotateOnActive = false,
}: {
  item: MenuItem;
  active: boolean;
  rotateOnActive?: boolean;
}) {
  return (
    <Link
      href={item.path}
      className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 focus:outline-none ${
      active ? "bg-gradient-to-tr from-orange-400 to-custom-2" : "hover:bg-gray-800"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <Image
      src={item.icon}
      width={22}
      height={22}
      alt={item.name}
      className={`invert transition-transform duration-200 ease-in-out ${
        rotateOnActive
        ? active
          ? "rotate-90"
          : "group-hover:rotate-90"
        : ""
      }`}
      />
      <span className="truncate">{item.name}</span>
    </Link>
  );
}

// ----- Sidebar -----
export default function Sidebar() {
  const pathname = usePathname() ?? "/";

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <aside className="sticky top-0 z-50 h-screen w-72 border-r border-gray-800 flex-shrink-0 bg-gray-900 text-gray-100 flex flex-col pb-6 pt-8 sm:px-4 lg:px-6">
      {/* Logo / Title */}
      <div className="flex items-center text-2xl font-bold pb-8">Ma voiture sandy</div>

      {/* Main navigation */}
      <nav className="flex flex-col mt-2 gap-2" aria-label="Primary">
        {MENU_ITEMS.map((item) => (
          <SidebarItem key={item.path} item={item} active={isActive(item.path)} />
        ))}
      </nav>

      {/* Bottom-aligned settings (always at bottom thanks to mt-auto) */}
      <div className="mt-auto">
        <SidebarItem
          item={BOTTOM_ITEM}
          active={isActive(BOTTOM_ITEM.path)}
          rotateOnActive
        />
      </div>
    </aside>
  );
}
