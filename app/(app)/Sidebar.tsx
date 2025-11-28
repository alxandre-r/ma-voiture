"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Tableau de bord", path: "/dashboard", icon: "/icons/dashboard.svg" },
  { name: "Mon garage", path: "/garage", icon: "/icons/garage.svg" },
  { name: "Mes consommations", path: "/conso", icon: "/icons/conso.svg" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-50 h-screen w-64 flex-shrink-0 bg-gray-900 text-white flex flex-col py-6 px-4">
      <div className="text-2xl font-bold pb-8">
        Ma voiture sandy
      </div>

      <nav className="flex flex-col mt-6 gap-2">
        {menuItems.map(item => {
          const active = pathname.startsWith(item.path);

          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
                  ${active ? "bg-gray-700" : "hover:bg-gray-800"}
                `}
              >
                <Image
                  src={item.icon}
                  width={22}
                  height={22}
                  alt={item.name}
                  className="dark:invert"
                />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}