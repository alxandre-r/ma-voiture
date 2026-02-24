'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// ----- Types -----
type MenuItem = {
  name: string;
  path: string;
  icon: string;
};

// ----- Configuration -----
const MENU_ITEMS: MenuItem[] = [
  { name: 'Tableau de bord', path: '/dashboard', icon: '/icons/dashboard.svg' },
  { name: 'Garage', path: '/garage', icon: '/icons/garage.svg' },
  { name: 'Consommations', path: '/historique', icon: '/icons/conso.svg' },
  { name: 'Famille', path: '/family', icon: '/icons/responsive.svg' },
];

const BOTTOM_ITEM: MenuItem = {
  name: 'Paramètres',
  path: '/settings',
  icon: '/icons/settings.svg',
};

// ----- SidebarItem component -----
function SidebarItem({ item, active = false }: { item: MenuItem; active?: boolean }) {
  return (
    <Link
      href={item.path}
      className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 focus:outline-none relative z-10 
         ${active ? 'text-white' : 'hover:bg-gray-800 hover:scale-103 text-gray-200'}`}
      aria-current={active ? 'page' : undefined}
    >
      <Image
        src={item.icon}
        width={22}
        height={22}
        alt={item.name}
        className="invert transition-transform duration-200 ease-in-out"
      />
      <span className="truncate">{item.name}</span>
    </Link>
  );
}

// ----- Sidebar component -----
export default function Sidebar() {
  const pathname = usePathname() ?? '/';
  const [activeIndex, setActiveIndex] = useState(0);
  const refs = useRef<HTMLDivElement[]>([]);

  // Détecter l'item actif (y compris le bottom item)
  useEffect(() => {
    const index = MENU_ITEMS.findIndex((item) => pathname.startsWith(item.path));
    if (pathname.startsWith(BOTTOM_ITEM.path)) {
      setActiveIndex(MENU_ITEMS.length); // bottom item à la fin
    } else {
      setActiveIndex(index === -1 ? 0 : index);
    }
  }, [pathname]);

  return (
    <aside className="sticky top-0 z-50 h-screen w-72 border-r border-gray-800 flex-shrink-0 bg-gray-900 text-gray-100 flex flex-col pb-6 pt-8 sm:px-4 lg:px-6 relative">
      {/* Logo / Title */}
      <div className="flex items-center text-2xl font-bold pb-8">Ma voiture sandy</div>

      {/* Navigation principale */}
      <nav className="flex flex-col mt-2 gap-2 relative flex-1">
        {/* Fond animé */}
        {refs.current[activeIndex] && (
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 40 }}
            className="absolute left-0 right-0 h-12 rounded-lg bg-gradient-to-tr from-orange-400 to-orange-600"
            style={{
              top: refs.current[activeIndex]?.offsetTop,
            }}
          />
        )}

        {MENU_ITEMS.map((item, index) => (
          <div
            key={item.path}
            ref={(el) => {
              if (el) refs.current[index] = el;
            }}
          >
            <SidebarItem item={item} active={activeIndex === index} />
          </div>
        ))}

        {/* Bottom-aligned settings */}
        <div
          className="mt-auto"
          ref={(el) => {
            if (el) refs.current[MENU_ITEMS.length] = el;
          }}
        >
          <SidebarItem item={BOTTOM_ITEM} active={activeIndex === MENU_ITEMS.length} />
        </div>
      </nav>
    </aside>
  );
}
