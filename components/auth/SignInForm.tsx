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
  const [loading, setLoading] = useState(false);

  /**
   * Handles form submission for user login.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4 px-6 w-full max-w-md">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center">Connexion</h2>
      {errorMsg && <p className="text-center text-red-500 dark:text-red-400 font-semibold">{errorMsg}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white focus:outline-none"
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white focus:outline-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded transition-colors disabled:opacity-60 hover:cursor-pointer"
      >
        {loading ? (
          <span className="inline-block bg-gradient-to-r from-white via-gray-200 to-white bg-[length:200%_100%] bg-clip-text text-transparent animate-shiny">
            Connexion en cours...
          </span>
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  );
}