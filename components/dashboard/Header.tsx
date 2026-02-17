'use client';

import React from "react";
import { motion } from "framer-motion";
import VehicleSelector from "./VehicleSelector";
import PeriodSelector from "./PeriodSelector";
import Icon from "@/components/ui/Icon";

type DashboardHeaderProps = {
  vehicles: any[];
  selectedVehicleIds: number[];
  onVehicleChange: (ids: number[]) => void;
  onAddFill: () => void;
  showEmptyHint: boolean;
};

export default function DashboardHeader({
  vehicles,
  selectedVehicleIds,
  onVehicleChange,
  onAddFill,
  showEmptyHint
}: DashboardHeaderProps) {
  return (
    <div className="w-full flex flex-col gap-3">

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="flex flex-col gap-3 sm:hidden w-full">

        {/* Bouton */}
        <motion.button
          onClick={onAddFill}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          className="
            w-full
            px-4 py-3
            rounded-xl
            flex items-center justify-center gap-2
            font-medium text-white
            bg-gradient-to-tr from-orange-400 to-custom-2
            transition-all duration-300 shadow-md
          "
        >
          Ajouter un plein
        </motion.button>

        {/* Vehicle Selector */}
        {vehicles.length > 1 ? (
          <VehicleSelector
            vehicles={vehicles}
            value={selectedVehicleIds}
            onChange={onVehicleChange}
          />
        ) : vehicles.length === 1 ? (
          <div className="w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-800 font-medium">
            {vehicles[0].name || `${vehicles[0].make} ${vehicles[0].model}`}
          </div>
        ) : null}

        {/* Period Selector */}
        <PeriodSelector />

      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden sm:flex sm:flex-row gap-4 w-full items-start">
        <motion.button
          onClick={onAddFill}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          className="
            relative overflow-hidden group
            px-5 py-3 sm:px-14
            rounded-xl
            flex items-center gap-2
            font-medium text-white
            bg-gradient-to-tr from-orange-400 to-custom-2
            transition-all duration-300 shadow-md
            hover:shadow-lg hover:shadow-gray-400/50 dark:hover:shadow-gray-950/50
            active:shadow-md
            cursor-pointer
          "
        >
          <span className="relative z-10">
            Ajouter un plein
          </span>
        </motion.button>

        <div className="sm:ml-auto flex items-center gap-4">
          {vehicles.length > 1 ? (
            <VehicleSelector
              vehicles={vehicles}
              value={selectedVehicleIds}
              onChange={onVehicleChange}
            />
          ) : vehicles.length === 1 ? (
            <div className="px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium">
              {vehicles[0].name || `${vehicles[0].make} ${vehicles[0].model}`}
            </div>
          ) : null}

          <PeriodSelector />
        </div>
      </div>

      {/* ===== EMPTY HINT ===== */}
      {showEmptyHint && (
        <div className="flex flex-col items-center">
          <Icon
            name="arrow-up"
            size={24}
            className="text-gray-400 dark:invert-0 animate-bounce"
          />
          <p className="text-gray-800 dark:text-gray-100 font-medium text-sm sm:text-lg text-center">
            Cliquez sur le bouton « Ajouter un plein » pour commencer.
          </p>
        </div>
      )}

    </div>
  );
}