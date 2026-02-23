/**
 * @file app/(app)/layout.tsx
 * @fileoverview Private layout component for authenticated users.
 *
 * Fully responsive layout handled by Tailwind CSS.
 * - Desktop: Sidebar on the left
 * - Mobile: Bottom NavBar
 * - No JS media queries (prevents hydration flicker)
 */

'use client';

import type { ReactNode } from "react";
import { NotificationProvider } from '@/contexts/NotificationContext';
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";

/**
 * PrivateLayout Component
 *
 * @param {Object} props
 * @param {ReactNode} props.children
 */
export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <div className="relative flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          <main className="flex-1 px-2 py-3 pt-8 pb-24 transition-colors duration-300 sm:px-4 lg:px-6 md:pb-8">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <NavBar />
        </nav>

      </div>
    </NotificationProvider>
  );
}