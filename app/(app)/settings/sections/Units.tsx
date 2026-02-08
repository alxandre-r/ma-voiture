"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function UnitsSection() {
  const [units, setUnits] = useState({
    distance: "km",
    fuel: "L",
    consumption: "L/100km",
  });

  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
        <Icon name="conso" size={24} />
        Unités de mesure
      </h2>

      <div className="space-y-6">
        {/* Distance */}
        <div>
          <label className="font-medium block mb-2 text-gray-700 dark:text-gray-300">
            Distance
          </label>
          <select
            value={units.distance}
            onChange={(e) =>
              setUnits({ ...units, distance: e.target.value })
            }
            className="p-4 rounded-lg border w-full lg:w-[360px] bg-gray-50 border-gray-300
              dark:bg-gray-900 dark:border-gray-600 hover:cursor-pointer
              focus:ring-2 focus:ring-custom-1 focus:outline-none"
          >
            <option value="km">Kilomètres (km)</option>
            <option value="miles">Miles (mi)</option>
          </select>
        </div>

        {/* Fuel */}
        <div>
          <label className="font-medium block mb-2 text-gray-700 dark:text-gray-300">
            Carburant
          </label>
          <select
            value={units.fuel}
            onChange={(e) =>
              setUnits({ ...units, fuel: e.target.value })
            }
            className="p-4 rounded-lg border w-full lg:w-[360px] bg-gray-50 border-gray-300
              dark:bg-gray-900 dark:border-gray-600 hover:cursor-pointer
              focus:ring-2 focus:ring-custom-1 focus:outline-none"
          >
            <option value="L">Litres (L)</option>
            <option value="gal">Gallons (gal)</option>
          </select>
        </div>

        {/* Consumption */}
        <div>
          <label className="font-medium block mb-2 text-gray-700 dark:text-gray-300">
            Consommation
          </label>
          <select
            value={units.consumption}
            onChange={(e) =>
              setUnits({ ...units, consumption: e.target.value })
            }
            className="p-4 rounded-lg border w-full lg:w-[360px] bg-gray-50 border-gray-300
              dark:bg-gray-900 dark:border-gray-600 hover:cursor-pointer
              focus:ring-2 focus:ring-custom-1 focus:outline-none"
          >
            <option value="L/100km">Litres / 100 km (L/100km)</option>
            <option value="MPG">Miles par gallon (MPG)</option>
          </select>
        </div>

        <div className="bg-custom-1/10 dark:bg-custom-1-dark/10 p-4 rounded-lg border border-custom-1/20 dark:border-custom-1-dark/20">
          <p className="text-sm text-custom-1 dark:text-custom-1-dark">
            <strong>Note :</strong> Les unités sont appliquées à tous vos
            véhicules et historiques de consommation.
          </p>
        </div>
      </div>
    </section>
  );
}