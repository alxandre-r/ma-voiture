/**
 * @file src/app/settings/page.tsx
 * @description Settings page for account, theme, units and preferences.
 */

"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [units, setUnits] = useState({
    distance: "km", // km | miles
    fuel: "L",      // L | gal
    consumption: "L/100km", // L/100km | MPG
  });

  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const handleChangeEmail = async () => {
    console.log("Would change email to:", email);
    // TODO: connect to your Supabase API
    alert("Change email: (not implemented yet)");
  };

  const handleChangePassword = async () => {
    console.log("Would change password:", passwords);
    // TODO: connect to your Supabase API
    alert("Change password: (not implemented yet)");
  };

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>

      {/* THEME SECTION */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Apparence</h2>
        <div className="flex items-center gap-4">
          <label className="font-medium">Thème :</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="p-2 rounded border bg-gray-50 border-gray-300 hover:cursor-pointer
            dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-400"
          >
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
            <option value="system">Système</option>
          </select>
        </div>
      </section>

      {/* UNITS SECTION */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Unités</h2>

        {/* Distance */}
        <div className="mb-4">
          <label className="font-medium block mb-1">Distance</label>
          <select
            value={units.distance}
            onChange={(e) =>
              setUnits({ ...units, distance: e.target.value })
            }
            className="p-2 rounded border bg-gray-50 border-gray-300 hover:cursor-pointer
            dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-400"
          >
            <option value="km">Kilomètres (km)</option>
            <option value="miles">Miles (mi)</option>
          </select>
        </div>

        {/* Fuel */}
        <div className="mb-4">
          <label className="font-medium block mb-1">Carburant</label>
          <select
            value={units.fuel}
            onChange={(e) =>
              setUnits({ ...units, fuel: e.target.value })
            }
            className="p-2 rounded border bg-gray-50 border-gray-300 hover:cursor-pointer
            dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-400"
          >
            <option value="L">Litres (L)</option>
            <option value="gal">Gallons (gal)</option>
          </select>
        </div>

        {/* Consumption */}
        <div>
          <label className="font-medium block mb-1">Consommation</label>
          <select
            value={units.consumption}
            onChange={(e) =>
              setUnits({ ...units, consumption: e.target.value })
            }
            className="p-2 rounded border bg-gray-50 border-gray-300 hover:cursor-pointer
            dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-400"
          >
            <option value="L/100km">L/100km</option>
            <option value="MPG">Miles per gallon (MPG)</option>
          </select>
        </div>
      </section>

      {/* ACCOUNT */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold mb-3">Mon compte</h2>

        {/* Change email */}
        <div>
          <label className="font-medium block mb-1">Changer l'adresse email</label>
          <input
            type="email"
            className="p-2 rounded border w-full bg-gray-50 border-gray-300 hover:cursor-pointer
            dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-400"
            placeholder="Nouvelle adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleChangeEmail}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:cursor-pointer"
          >
            Mettre à jour l'email
          </button>
        </div>

        {/* Change password */}
        <div>
          <label className="font-medium block mb-1">Changer le mot de passe</label>
          <input
            type="password"
            placeholder="Ancien mot de passe"
            className="p-2 rounded border w-full mb-2 bg-gray-50 border-gray-300 hover:cursor-pointer
            dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-400"
            value={passwords.oldPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, oldPassword: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            className="p-2 rounded border w-full bg-gray-50 border-gray-300 hover:cursor-pointer
            dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-400"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
          />
          <button
            onClick={handleChangePassword}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:cursor-pointer"
          >
            Mettre à jour le mot de passe
          </button>
        </div>
      </section>

      {/* LOGOUT */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Sécurité</h2>
        <LogoutButton />
      </section>
    </main>
  );
}