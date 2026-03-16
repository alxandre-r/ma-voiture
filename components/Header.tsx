/**
 * @file Header.tsx
 * @description Header component for each page, containing the title and optional custom content.
 * The title and other content is passed as props, allowing for dynamic content based on the current page.
 */

import ProfilePicture from './user/ProfilePicture';

import type { User } from '@/types/user';
import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  rightContent?: ReactNode;
  user?: User | null;
}

/**
 * Header component with customizable right side content.
 * @param title - The page title to display
 * @param rightContent - Optional ReactNode to display on the right side (e.g., buttons)
 * @param user - Optional user object for displaying profile picture
 */
export default function Header({ title, rightContent, user }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 border-b backdrop-blur-sm
    bg-gradient-to-b from-white to-white/80 border-gray-200 
    dark:border-gray-800 dark:from-gray-900 dark:to-gray-900/80"
    >
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {title}
      </h1>
      <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
        {rightContent}
        {user && <ProfilePicture avatarUrl={user.avatar_url} name={user.name} size="sm" />}
      </div>
    </header>
  );
}
