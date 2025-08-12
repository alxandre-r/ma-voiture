/**
 * @file Sign Up Page
 * @fileoverview Page d'inscription (Sign Up) pour créer un compte utilisateur.
 * Utilise Supabase Auth pour enregistrer un nouvel utilisateur via email/password.
 * Après inscription, l'utilisateur est automatiquement redirigé vers le dashboard.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function SignUpPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const supabase = createSupabaseBrowserClient();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const { error } = await supabase.auth.signUp({
        email,
        password,
        });

        if (error) {
        setError(error.message);
        } else {
        // Optionnel : créer une entrée dans une table "profiles" si besoin
        // Redirection vers dashboard
        router.push("/dashboard");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold mb-4">Créer un compte</h1>
        <form onSubmit={handleSignUp} className="flex flex-col gap-3 w-64">
            <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            type="password"
            placeholder="Mot de passe"
            className="border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
            S&apos;inscrire
            </button>
        </form>
        </div>
    );
}
