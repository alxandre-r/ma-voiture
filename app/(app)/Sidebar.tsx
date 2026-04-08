'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import BellIcon from '@/public/icons/bell.svg';
import ChartIcon from '@/public/icons/chart.svg';
import DashboardIcon from '@/public/icons/dashboard.svg';
import EuroIcon from '@/public/icons/euro.svg';
import FamilyIcon from '@/public/icons/family.svg';
import GarageIcon from '@/public/icons/garage.svg';
import SecureIcon from '@/public/icons/secure.svg';
import SettingsIcon from '@/public/icons/settings.svg';
import ToolIcon from '@/public/icons/tool.svg';

import type { FC, SVGProps } from 'react';

// ----- Types -----
type MenuItem = {
  name: string;
  path: string;
  icon: FC<SVGProps<SVGSVGElement>>;
};

// ----- Configuration -----
// Separators are inserted after these indices (0-based)
const SEPARATOR_AFTER = new Set([1, 5, 6]);

const MENU_ITEMS: MenuItem[] = [
  { name: 'Tableau de bord', path: '/dashboard', icon: DashboardIcon },
  { name: 'Statistiques', path: '/statistics', icon: ChartIcon },
  { name: 'Dépenses', path: '/expenses', icon: EuroIcon },
  { name: 'Maintenance', path: '/maintenance', icon: ToolIcon },
  { name: 'Rappels', path: '/reminders', icon: BellIcon },
  { name: 'Assurance', path: '/insurance', icon: SecureIcon },
  { name: 'Véhicules', path: '/garage', icon: GarageIcon },
  { name: 'Famille', path: '/family', icon: FamilyIcon },
];

const BOTTOM_ITEM: MenuItem = {
  name: 'Paramètres',
  path: '/settings',
  icon: SettingsIcon,
};

// ----- Separator component -----
function Separator() {
  return <div className="my-1 mt-3 border-t border-gray-700/50" />;
}

// ----- SidebarItem component -----
function SidebarItem({
  item,
  active = false,
  onClick,
}: {
  item: MenuItem;
  active?: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.path}
      prefetch={true}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-3 rounded-lg
        text-gray-400 focus:outline-none relative z-10
         ${active ? 'text-white' : 'hover:bg-gray-800 hover:text-white'}`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="w-[22px] h-[22px] shrink-0" />
      <span className="truncate">{item.name}</span>
    </Link>
  );
}

// ----- Sidebar component -----
export default function Sidebar() {
  const pathname = usePathname() ?? '/';
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorTop, setIndicatorTop] = useState<number | null>(null);
  const refs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const index = MENU_ITEMS.findIndex((item) => pathname.startsWith(item.path));
    if (pathname.startsWith(BOTTOM_ITEM.path)) {
      setActiveIndex(MENU_ITEMS.length);
    } else {
      setActiveIndex(index === -1 ? 0 : index);
    }
  }, [pathname]);

  useLayoutEffect(() => {
    const el = refs.current[activeIndex];
    if (el) setIndicatorTop(el.offsetTop);
  }, [activeIndex]);

  return (
    <aside className="sticky top-0 z-50 h-screen w-72 border-r border-gray-800 flex-shrink-0 bg-gray-900 text-gray-100 flex flex-col pb-6 pt-8 sm:px-4 lg:px-6 relative">
      {/* Logo / Title */}
      <div className="flex items-center text-2xl font-bold pb-8">Ma voiture sandy</div>

      {/* Navigation principale */}
      <nav className="flex flex-col mt-2 gap-2 relative flex-1">
        {/* Fond animé */}
        {indicatorTop !== null && (
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 40 }}
            className="absolute left-0 right-0 h-12 rounded-lg bg-gradient-to-br from-custom-2 to-custom-2-dark-hover"
            style={{ top: indicatorTop }}
          />
        )}

        {MENU_ITEMS.map((item, index) => (
          <div key={item.path}>
            <div
              ref={(el) => {
                if (el) refs.current[index] = el;
              }}
            >
              <SidebarItem item={item} active={activeIndex === index} />
            </div>
            {SEPARATOR_AFTER.has(index) && <Separator />}
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

// ----- Mobile Sidebar Drawer -----
export function MobileSidebarDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname() ?? '/';
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorTop, setIndicatorTop] = useState<number | null>(null);
  const refs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (pathname.startsWith(BOTTOM_ITEM.path)) {
      setActiveIndex(MENU_ITEMS.length);
    } else {
      const index = MENU_ITEMS.findIndex((item) => pathname.startsWith(item.path));
      setActiveIndex(index === -1 ? 0 : index);
    }
  }, [pathname]);

  // Close on navigation
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useLayoutEffect(() => {
    const el = refs.current[activeIndex];
    if (el) setIndicatorTop(el.offsetTop);
  }, [activeIndex, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 text-gray-100 flex flex-col pb-6 pt-8 px-4"
          >
            {/* Logo / close row */}
            <div className="flex items-center justify-between pb-8">
              <span className="text-2xl font-bold">Ma voiture sandy</span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                aria-label="Fermer le menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav */}
            <nav className="flex flex-col mt-2 gap-2 relative flex-1">
              {indicatorTop !== null && (
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 300, damping: 40 }}
                  className="absolute left-0 right-0 h-12 rounded-lg bg-gradient-to-br from-custom-2 to-custom-2-dark-hover"
                  style={{ top: indicatorTop }}
                />
              )}

              {MENU_ITEMS.map((item, index) => (
                <div key={item.path}>
                  <div
                    ref={(el) => {
                      if (el) refs.current[index] = el;
                    }}
                  >
                    <SidebarItem item={item} active={activeIndex === index} onClick={onClose} />
                  </div>
                  {SEPARATOR_AFTER.has(index) && <Separator />}
                </div>
              ))}

              <div
                className="mt-auto"
                ref={(el) => {
                  if (el) refs.current[MENU_ITEMS.length] = el;
                }}
              >
                <SidebarItem
                  item={BOTTOM_ITEM}
                  active={activeIndex === MENU_ITEMS.length}
                  onClick={onClose}
                />
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
