/**
 * @file components/LogoutButton.tsx
 * @fileoverview Logout button component for user authentication.
 * 
 * This component handles user logout by calling Supabase auth.signOut()
 * and redirecting to the home page.
 */

"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

/**
 * LogoutButton Component
 * 
 * Button that initiates user logout process.
 * Clears session and redirects to home page.
 */
export default function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  /**
   * Handle logout process.
   * Signs out from Supabase and redirects to home.
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className={`bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded w-full sm:px-6 sm:py-3 ${className}`}
      aria-label="Se déconnecter"
    >
      Se déconnecter
    </button>
  );
}
