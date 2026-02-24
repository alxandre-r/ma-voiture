'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// ----- Configuration -----
const menuItems = [
  { name: 'Tableau de bord', path: '/dashboard', icon: '/icons/dashboard.svg' },
  { name: 'Garage', path: '/garage', icon: '/icons/garage.svg' },
  { name: 'Famille', path: '/family', icon: '/icons/responsive.svg' },
  { name: 'Paramètres', path: '/settings', icon: '/icons/settings.svg' },
];

// ----- NavBar component -----
export default function NavBar() {
  const pathname = usePathname() || '/';
  const [activeIndex, setActiveIndex] = useState(0);
  const refs = useRef<HTMLAnchorElement[]>([]);

  // Détecter l'item actif
  useEffect(() => {
    const index = menuItems.findIndex((item) => pathname.startsWith(item.path));
    setActiveIndex(index === -1 ? 0 : index);
  }, [pathname]);

  return (
    <nav
      role="navigation"
      aria-label="Navigation mobile"
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 rounded-t-lg md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-screen mx-auto relative flex justify-around items-center py-4">
        {/* Fond animé */}
        {refs.current[activeIndex] && (
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute mt-4 h-14 rounded-md bg-gradient-to-tr from-orange-400 to-orange-600 z-0"
            style={{
              top: 0,
              left: refs.current[activeIndex]?.offsetLeft,
              width: refs.current[activeIndex]?.offsetWidth,
            }}
          />
        )}

        {menuItems.map((item, index) => {
          const active = index === activeIndex;

          return (
            <Link
              key={item.path}
              href={item.path}
              ref={(el) => {
                if (el) refs.current[index] = el;
              }}
              aria-current={active ? 'page' : undefined}
              className={`relative z-10 flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-md transition-colors duration-200
                ${active ? 'text-gray-100' : 'text-white hover:text-white hover:bg-gray-800'}`}
            >
              <Image
                src={item.icon}
                width={22}
                height={22}
                alt={item.name}
                className="invert transition-transform duration-200 ease-in-out group-hover:rotate-12"
              />
              <span className="text-[11px] leading-none">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
