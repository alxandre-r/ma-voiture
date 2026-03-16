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

import { createClient } from '@supabase/supabase-js';
import { useEffect } from 'react';

import Header from '@/components/Header';
import { HeaderProvider, useHeader, useUser } from '@/contexts/HeaderContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

import NavBar from './NavBar';
import Sidebar from './Sidebar';

import type { User } from '@/types/user';
import type { ReactNode } from 'react';

function PrivateLayoutContent({ children }: { children: ReactNode }) {
  const { header } = useHeader();
  const { user: contextUser, setUser } = useUser();

  // Fetch user on mount
  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        const { data: userData } = await supabase
          .from('users_info')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        if (userData) {
          setUser(userData as User);
        }
      }
    }

    fetchUser();
  }, [setUser]);

  return (
    <NotificationProvider>
      <div className="relative flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <Header title={header.title} rightContent={header.rightContent} user={contextUser} />

          {/* Page Content */}
          <main className="flex-1 px-2 py-3 pt-8 pb-32 transition-colors duration-300 sm:px-4 lg:px-6 md:pb-8">
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

interface PrivateLayoutProps {
  children: ReactNode;
}

/**
 * PrivateLayout Component
 *
 * @param {Object} props
 * @param {ReactNode} props.children
 */
export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <HeaderProvider>
      <PrivateLayoutContent>{children}</PrivateLayoutContent>
    </HeaderProvider>
  );
}
