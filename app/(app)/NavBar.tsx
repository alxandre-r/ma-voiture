'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// ----- Navigation principale (bottom bar) -----
const mainItems = [
  { name: 'Accueil', path: '/dashboard', icon: '/icons/dashboard.svg' },
  { name: 'Dépenses', path: '/expenses', icon: '/icons/euro.svg' },
  { name: 'Maintenance', path: '/maintenance', icon: '/icons/tool.svg' },
];

// ----- Sous menu général -----
const secondaryItems = [
  { name: 'Statistiques', path: '/statistics', icon: '/icons/chart.svg' },
  { name: 'Garage', path: '/garage', icon: '/icons/garage.svg' },
  { name: 'Famille', path: '/family', icon: '/icons/family.svg' },
  { name: 'Paramètres', path: '/settings', icon: '/icons/settings.svg' },
];

export default function NavBar() {
  const pathname = usePathname() || '/';

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlusOpen, setIsPlusOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const refs = useRef<HTMLAnchorElement[]>([]);

  // Détection active pour mainItems et secondaryItems
  useEffect(() => {
    const mainIndex = mainItems.findIndex((item) => pathname.startsWith(item.path));

    if (mainIndex !== -1) {
      setActiveIndex(mainIndex);
    } else {
      // Si on est sur une page du sous-menu, on peut désactiver l'indicateur principal
      setActiveIndex(-1);
    }
  }, [pathname]);

  // Gestion toggles + et menu pour n'avoir qu'un seul sous-menu ouvert
  const handlePlusToggle = () => {
    setIsPlusOpen((prev) => !prev);
    if (!isPlusOpen) setIsMenuOpen(false); // Fermer menu si + s'ouvre
  };

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
    if (!isMenuOpen) setIsPlusOpen(false); // Fermer + si menu s'ouvre
  };

  return (
    <>
      <nav
        role="navigation"
        aria-label="Navigation mobile"
        className="fixed bottom-6 left-2 right-2 z-50 bg-gray-100/50 backdrop-blur-sm dark:bg-gray-800/50 dark:border dark:border-gray-700/70 rounded-full inset-shadow-sm md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="relative flex justify-around items-center py-4">
          {/* Indicateur animé */}
          {refs.current[activeIndex] && activeIndex !== -1 && (
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute mt-14 h-1 bg-custom-2 z-0"
              style={{
                top: 0,
                left: refs.current[activeIndex]?.offsetLeft,
                width: refs.current[activeIndex]?.offsetWidth,
              }}
            />
          )}

          {/* Accueil et Dépenses */}
          {mainItems.slice(0, 2).map((item, index) => {
            const active = index === activeIndex;

            return (
              <Link
                key={item.path}
                href={item.path}
                ref={(el) => {
                  if (el) refs.current[index] = el;
                }}
                aria-current={active ? 'page' : undefined}
                className={`relative z-10 flex flex-col items-center justify-center px-4 py-2 rounded-md
                  ${active ? 'text-white' : 'text-gray-400'}`}
              >
                <Image
                  src={item.icon}
                  width={22}
                  height={22}
                  alt={item.name}
                  className="dark:invert"
                />
              </Link>
            );
          })}

          {/* Bouton central + */}
          <button
            onClick={handlePlusToggle}
            className="relative z-10 w-14 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-custom-2 to-custom-2-dark-hover shadow-lg"
          >
            <Image src="/icons/add.svg" width={22} height={22} alt="Ajouter" className="invert" />
          </button>

          {/* Maintenance */}
          <Link
            href={mainItems[2].path}
            ref={(el) => {
              if (el) refs.current[2] = el;
            }}
            className={`relative z-10 flex flex-col items-center justify-center px-4 py-2 rounded-md
              ${activeIndex === 2 ? 'text-white' : 'text-gray-400'}`}
          >
            <Image
              src={mainItems[2].icon}
              width={22}
              height={22}
              alt="Maintenance"
              className="dark:invert"
            />
          </Link>

          {/* Menu */}
          <button
            onClick={handleMenuToggle}
            className="relative z-10 flex flex-col items-center justify-center px-4 py-2 text-gray-400"
          >
            <Image
              src="/icons/menu.svg"
              width={22}
              height={22}
              alt="Menu"
              className="dark:invert"
            />
          </button>
        </div>
      </nav>

      {/* Sous menu + */}
      <AnimatePresence>
        {isPlusOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setIsPlusOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-full left-0 right-0 z-40 bg-gray-200/60 dark:bg-gray-900/70 backdrop-blur-sm dark:border-t border-gray-700 rounded-t-3xl py-4 pb-28 flex justify-around px-2"
            >
              <div className="w-full mt-4">
                <div className="flex gap-4">
                  <button className="flex flex-col items-center justify-center gap-2 text-gray-800 dark:text-white flex-1">
                    <Image
                      src="/icons/conso.svg"
                      width={20}
                      height={20}
                      alt="Plein"
                      className="dark:invert"
                    />
                    Plein
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 text-gray-800 dark:text-white flex-1">
                    <Image
                      src="/icons/ev-plug.svg"
                      width={20}
                      height={20}
                      alt="Recharge"
                      className="dark:invert"
                    />
                    Recharge
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 text-gray-800 dark:text-white flex-1">
                    <Image
                      src="/icons/tool.svg"
                      width={20}
                      height={20}
                      alt="Maintenance"
                      className="dark:invert"
                    />
                    Maintenance
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sous-menu intégré */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ opacity: 1, y: 200 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 1, y: 200 }}
              transition={{ type: 'spring', stiffness: 300, damping: 40 }}
              className="absolute bottom-full left-0 right-0 z-40 bg-gray-200/60 dark:bg-gray-900/70 backdrop-blur-sm dark:border-t border-gray-700 rounded-t-3xl py-4 pb-28 flex justify-around px-2"
            >
              {secondaryItems.map((item) => {
                const active = pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex flex-col items-center justify-center gap-1 px-2 py-1 hover:bg-gray-700 border-b-2 transition-colors text-white
                      ${active ? 'border-custom-2' : ' border-transparent'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Image
                      src={item.icon}
                      width={20}
                      height={20}
                      alt={item.name}
                      className="dark:invert"
                    />
                    <span className="text-[11px] text-gray-800 dark:text-white leading-none">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
