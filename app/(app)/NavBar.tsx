"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const menuItems = [
    { name: "Tableau de bord", path: "/dashboard", icon: "/icons/dashboard.svg" },
    { name: "Mon garage", path: "/garage", icon: "/icons/garage.svg" },
    { name: "Mes consommations", path: "/conso", icon: "/icons/conso.svg" },
    { name: "Paramètres", path: "/settings", icon: "/icons/settings.svg" }, 
];

export default function NavBar() {
    const pathname = usePathname() || "/";

    return (
        <nav
            role="navigation"
            aria-label="Navigation mobile"
            className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white border-t border-gray-800 md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            <div className="max-w-screen mx-auto flex justify-around items-center py-2">
                {menuItems.map((item) => {
                    const active = pathname.startsWith(item.path);

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            aria-current={active ? "page" : undefined}
                            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-md transition-colors
                                ${active ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
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