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
      // 1) Call server route which creates the confirmed user
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(body.error || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      // 2) Optionnel: tenter connexion automatique
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        // Si la connexion échoue, on informe mais l'utilisateur existe (confirmé)
        setIsError(true);
        setMessage("Compte créé mais échec de connexion automatique : " + signInError.message);
        setLoading(false);
        return;
      }

      // Connexion réussie → redirection
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Erreur signup client:", err);
      setIsError(true);
      setMessage("Erreur inattendue, réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4 w-full max-w-md">
      <h2 className="text-xl font-bold">S'inscrire</h2>

      {message && (
        <p className={isError ? "text-red-500" : "text-green-600"}>{message}</p>
      )}

      <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} className="w-full px-4 py-2 rounded border" />
      <input type="password" required placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 rounded border" />

      <button type="submit" disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded disabled:opacity-60">
        {loading ? "Inscription…" : "S'inscrire"}
      </button>
    </form>
  );
}