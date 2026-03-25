/**
 * @file Header.tsx
 * @description Header component for each page, containing the title and optional custom content.
 * The title and other content is passed as props, allowing for dynamic content based on the current page.
 * User info is retrieved from the UserProvider via useUser() hook.
 */

'use client';

import Link from 'next/link';

import { useUser } from '@/contexts/UserContext';

import ProfilePicture from './user/ProfilePicture';

import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  content?: ReactNode;
  onMenuOpen?: () => void;
}

/**
 * Header component with customizable right side content.
 * User is automatically retrieved from UserProvider.
 * @param title - The page title to display
 * @param content - Optional content to display on the right side of the header on desktop, and below the title on mobile (e.g. selectors)
 */
export default function Header({ title, content, onMenuOpen }: HeaderProps) {
  // Get user from UserProvider (set up in layout)
  const user = useUser();

  return (
    <header className="sticky top-0 z-30 mb-4 flex flex-col gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Burger button — mobile only */}
          {onMenuOpen && (
            <button
              onClick={onMenuOpen}
              className="md:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h1>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          {content}
          {user && (
            <Link href="/profile" className="flex items-center gap-2">
              <ProfilePicture avatarUrl={user.avatar_url} name={user.name} size="sm" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{user.name}</span>
            </Link>
          )}
        </div>
      </div>
      {/* Mobile content */}
      {content && <div className="bottom-row sm:hidden w-full min-w-0">{content}</div>}
    </header>
  );
}
