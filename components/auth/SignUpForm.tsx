"use client";

import { useState } from "react";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    const res = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setIsError(true);
      setMessage(data.error || "Erreur inconnue");
      return;
    }

    setIsError(false);
    setMessage(data.message);
  };

  return (
    <form
      onSubmit={handleSignUp}
      className="space-y-4 bg-transparent p-6 border-t border-gray-300 w-full max-w-md"
    >
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Inscription</h2>

      {message && (
        <p className={isError ? "text-red-400 font-semibold" : "text-green-500 font-semibold"}>
          {message}
        </p>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value.toLowerCase())}
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
        className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded transition-colors"
      >
        S&apos;inscrire
      </button>
    </form>
  );
}