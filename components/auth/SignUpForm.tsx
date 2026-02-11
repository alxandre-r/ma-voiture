/**
 * @file components/auth/SignUpForm.tsx
 * @fileoverview Sign up form: calls server route to create confirmed user,
 *              then attempts to sign in the user client-side for immediate access.
 */

"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function SignUpForm() {
  const supabase = createSupabaseBrowserClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setIsError(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(body.error || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setIsError(true);
        setMessage("Compte créé mais échec de connexion automatique : " + signInError.message);
        setLoading(false);
        return;
      }

      const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/dashboard";
      window.location.href = redirectUrl;
    } catch (err) {
      console.error("Erreur signup client:", err);
      setIsError(true);
      setMessage("Erreur inattendue, réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4 px-6 w-full max-w-md">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center">Créer un compte</h2>
      {message && (
        <p className={`text-center font-semibold ${isError ? "text-red-500 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
          {message}
        </p>
      )}

      <input
        type="text"
        required
        placeholder="Nom ou pseudo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white focus:outline-none"
      />

      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value.toLowerCase())}
        className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white focus:outline-none"
      />
      <input
        type="password"
        required
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
            Inscription en cours...
          </span>
        ) : (
          "Confirmer l'inscription"
        )}
      </button>
    </form>
  );
}