/**
 * @file components/auth/SignUpForm.tsx
 * @fileoverview Formulaire d'inscription.
 *  - Vérifie d'abord l'email via /api/auth/check-email (évite doublons déjà confirmés).
 *  - Si ok, appelle supabase.auth.signUp() côté client pour créer le compte et déclencher
 *    l'email de confirmation automatique géré par Supabase (SMTP must be configured).
 *
 * Respecte SOLID : la logique réseau est séquentielle et lisible, UI gérée proprement.
 */

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // ton client public (anon)

export default function SignUpForm() {
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
      // 1) Check email côté serveur (éviter doublons confirmés)
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const checkJson = await checkRes.json();

      if (!checkRes.ok) {
        setIsError(true);
        setMessage(checkJson?.error || "Erreur lors de la vérification de l'email");
        setLoading(false);
        return;
      }

      if (checkJson.exists) {
        if (checkJson.confirmed) {
          // Un compte confirmé existe déjà : bloquer inscription
          setIsError(true);
          setMessage("Un compte existe déjà avec cet email. Connectez-vous.");
          setLoading(false);
          return;
        } else {
          // Compte existant mais non confirmé : informer l'utilisateur
          setIsError(true);
          setMessage(
            "Un compte existe déjà mais n'a pas encore été confirmé. Vérifiez vos emails (spam)."
          );
          setLoading(false);
          return;
        }
      }

      // 2) Aucun compte trouvé → créer via client Supabase (envoie email automatique)
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        // Cas où Supabase renvoie une erreur (ex: règles de mot de passe)
        setIsError(true);
        setMessage(error.message || "Erreur lors de la création du compte");
        setLoading(false);
        return;
      }

      // Succès : supabase déclenche l'email de confirmation (si SMTP configuré)
      setIsError(false);
      setMessage("Inscription réussie — vérifiez votre boîte email pour confirmer.");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Erreur handleSignUp:", err);
      setIsError(true);
      setMessage("Erreur inattendue, réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4 w-full max-w-md">
      <h2 className="text-xl font-bold">S&apos;inscrire</h2>

      {message && (
        <p className={isError ? "text-red-500" : "text-green-600"}>{message}</p>
      )}

      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value.toLowerCase())}
        className="w-full px-4 py-2 rounded border"
      />
      <input
        type="password"
        required
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 rounded border"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
      >
        {loading ? "Inscription…" : "S'inscrire"}
      </button>
    </form>
  );
}