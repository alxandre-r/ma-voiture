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
import Header from "./Topbar";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

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
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1 flex flex-col">
          <main className="p-6">{children}</main>
        </div>
      </div>
    );
  }

  /**
   * Desktop layout: Sidebar on left, Header + content on right
   */
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}