import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <h1 className="text-4xl font-bold mb-6">Bienvenue sur Ma Voiture</h1>
    <p className="text-lg mb-6">
      Gérez vos véhicules efficacement avec notre application.
    </p>
    <Image
      src="/car.png"
      alt="Image de voiture"
      width={300}
      height={200}
      className="rounded-lg shadow-lg"
    />
    <div className="mt-8 flex gap-4">
      <Link href="/auth/sign-in">
      <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Se connecter
      </button>
      </Link>
      <Link href="/auth/sign-up">
      <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        S&apos;inscrire
      </button>
      </Link>
    </div>
    </main>
  );
}
