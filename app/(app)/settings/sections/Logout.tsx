"use client";

import LogoutButton from "@/components/LogoutButton";
import Icon from "@/components/ui/Icon";

export default function LogoutSection() {
  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-800 dark:text-white">
        <Icon name="garage" size={24} />
        Déconnexion
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Vous pouvez vous déconnecter de votre compte à tout moment. Vous devrez vous reconnecter pour accéder à vos données.
      </p>
      <LogoutButton className="w-full" />
    </section>
  );
}