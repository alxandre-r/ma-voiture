/**
 * @file components/LogoutButton.tsx
 * @fileoverview Logout button component for user authentication.
 *
 * This component handles user logout by calling Supabase auth.signOut()
 * and redirecting to the home page.
 */

'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * LogoutButton Component
 *
 * Button that initiates user logout process.
 * Clears session and redirects to home page.
 */
export default function LogoutButton({ className = '' }: { className?: string }) {
  const supabase = createSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Use window.location for full page reload to ensure session is cleared before middleware runs
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleLogout}
      className={`bg-red-500 hover:bg-red-600 text-white px-4 py-3 hover:cursor-pointer rounded-lg w-full sm:px-6 sm:py-3 ${className}`}
      aria-label="Se déconnecter"
    >
      Se déconnecter
    </button>
  );
}
