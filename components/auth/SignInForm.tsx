/**
 * @file components/auth/SignInForm.tsx
 * @fileoverview Sign-in form component for user authentication.
 * 
 * This component handles user login by collecting email and password,
 * validating credentials with Supabase, and redirecting to dashboard on success.
 */

"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

/**
 * SignInForm Component
 * 
 * Handles user authentication via email/password.
 * On successful login, redirects to dashboard.
 * Displays error messages for failed login attempts.
 */
export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * Handles form submission for user login.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4 bg-white dark:bg-gray-800 p-6 border-t border-gray-300 dark:border-gray-700 w-full max-w-md shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Connexion</h2>
      {errorMsg && <p className="text-center text-red-500 dark:text-red-400 font-semibold">{errorMsg}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring focus:ring-indigo-500 border border-gray-300 dark:border-gray-700"
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring focus:ring-indigo-500 border border-gray-300 dark:border-gray-700"
      />

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
      >
        Se connecter
      </button>
    </form>
  );
}