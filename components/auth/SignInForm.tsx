"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    <form onSubmit={handleSignIn} className="space-y-4 bg-transparent p-6 border-t border-gray-300 w-full max-w-md">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Connexion</h2>
      {errorMsg && <p className="text-center text-red-400 font-semibold">{errorMsg}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring focus:ring-indigo-500"
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring focus:ring-indigo-500"
      />

      <button
        type="submit"
        className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors"
      >
        Se connecter
      </button>
    </form>
  );
}