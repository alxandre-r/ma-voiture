/**
 * @file app/(app)/layout.tsx
 * @fileoverview Private layout component for authenticated users.
 * 
 * This layout handles responsive design by detecting mobile vs desktop
 * and rendering appropriate navigation components.
 * Uses media query to determine device type and adapts layout accordingly.
 */

'use client';

import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { NotificationProvider } from '@/contexts/NotificationContext';

/**
 * PrivateLayout Component
 * 
 * Responsive layout that adapts to mobile/desktop screens.
 * Shows Sidebar + Topbar on desktop, NavBar on mobile.
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render
 */
export default function PrivateLayout({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  /**
   * Detect mobile device using media query.
   * Sets up event listener for screen size changes.
   * Handles both modern and legacy browser APIs.
   */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");

    const handleEvent = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const handleLegacy = (e: MediaQueryList | MediaQueryListEvent) =>
      setIsMobile("matches" in e ? e.matches : mq.matches);

    setIsMobile(mq.matches);

    if ("addEventListener" in mq) {
      mq.addEventListener("change", handleEvent);
      return () => mq.removeEventListener("change", handleEvent);
    } else if ("addListener" in mq) {
      // fallback for older browsers
      (mq as MediaQueryList).addListener(handleLegacy);
      return () => (mq as MediaQueryList).removeListener(handleLegacy);
    }
  }, []);

  /**
   * Mobile layout: NavBar at bottom, content area
   */
  if (isMobile) {
    return (
      <NotificationProvider>
          <div className="min-h-screen flex flex-col transition-colors duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" style={{ position: 'relative' }}>
            <NavBar />
            <div className="flex-1 flex flex-col">
              <main className="px-2 py-3 pt-8 pb-24 sm:px-4 lg:px-6 transition-colors duration-300">{children}</main>
            </div>
          </div>
      </NotificationProvider>
    );
  }

  /**
   * Desktop layout: Sidebar on left, Header + content on right
   */
  return (
    <NotificationProvider>
        <div className="flex min-h-screen transition-colors duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" style={{ position: 'relative' }}>
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <main className="px-2 py-3 pt-8 sm:px-4 lg:px-6 transition-colors duration-300">{children}</main>
          </div>
        </div>
    </NotificationProvider>
  );
}