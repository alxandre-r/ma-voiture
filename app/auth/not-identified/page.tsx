import Link from "next/link";

/**
 * @file not-identified.tsx
 * @fileoverview Page displayed when the user is not identified.
 * 
 * Cette page informe l'utilisateur qu'il n'est pas connecté.
 * Cette page s'affiche lorsque le middleware détecte qu'il n'y a pas de session active.
 *
 * @see middleware.ts
 */

export default function NotIdentifiedPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <section className="max-w-md text-center">
                <h1 className="m-0 text-2xl font-semibold">Vous n’êtes pas identifié</h1>
                <p className="text-gray-600 leading-relaxed mt-3">
                    Une erreur a peut-être eu lieu. Vous devez être connecté pour continuer.
                </p>
                <Link
                    href="/"
                    className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md no-underline hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                >
                    Aller à la connexion
                </Link>
            </section>
        </main>
    );
}


