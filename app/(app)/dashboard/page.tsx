import React from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { FillProvider } from "@/contexts/FillContext";
import DashboardClient from "./DashboardClient";
import { VehicleMinimal } from '@/types/vehicle';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="px-6">
        <p>Veuillez vous connecter pour accéder à votre tableau de bord.</p>
      </main>
    );
  }

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, name, make, model, odometer")
    .eq("owner", user.id)
    .order("name", { ascending: true });

  return (
    <main className="px-1 pb-24 space-y-3 sm:px-2 sm:space-y-4 lg:px-4 lg:space-y-6">
      <FillProvider>
        <section>
          <DashboardClient vehicles={(vehicles || []) as VehicleMinimal[]} />
        </section>

        <section>
          {vehicles && vehicles.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Vous n&apos;avez pas encore ajouté de véhicules.{" "}
              <a href="/garage" className="text-blue-600 hover:underline">
                Ajoutez un véhicule
              </a>{" "}
              pour commencer à suivre votre consommation.
            </p>
          ) : null}
        </section>
      </FillProvider>
    </main>
  );
}