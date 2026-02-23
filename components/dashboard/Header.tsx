'use client';

import React from "react";
import { motion } from "framer-motion";
import VehicleSelector from "./VehicleSelector";
import PeriodSelector from "./PeriodSelector";
import { VehicleMinimal } from "@/types/vehicle";
import { PeriodType } from "@/app/(app)/dashboard/DashboardClient";

type DashboardHeaderProps = {
  vehicles: VehicleMinimal[];
  selectedVehicleIds: number[];
  onVehicleChange: (ids: number[]) => void;
  selectedPeriod: PeriodType;
  setSelectedPeriod: (period: PeriodType) => void;
  onAddFill: () => void;
};

export default function DashboardHeader({
  vehicles,
  selectedVehicleIds,
  onVehicleChange,
  selectedPeriod,
  setSelectedPeriod,
  onAddFill,
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
          className="w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-medium 
          text-white bg-gradient-to-tr from-orange-400 to-custom-2 transition-all duration-300 shadow-md"
        >
          Ajouter un plein
        </motion.button>

        {/* Vehicle Selector */}
        <VehicleSelector
          vehicles={vehicles}
          value={selectedVehicleIds}
          onChange={onVehicleChange}
        />

        {/* Period Selector */}
        <PeriodSelector selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden sm:flex sm:flex-row gap-4 w-full items-start">
        <motion.button
          onClick={onAddFill}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          className=" relative overflow-hidden group px-5 py-3 sm:px-14 rounded-xl flex items-center gap-2 font-medium text-white
            bg-gradient-to-tr from-orange-400 to-custom-2 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-gray-400/50 dark:hover:shadow-gray-950/50
            active:shadow-md cursor-pointer"
        >
          <span className="relative z-10">
            Ajouter un plein
          </span>
        </motion.button>

        <div className="sm:ml-auto flex items-center gap-4">
          <VehicleSelector
            vehicles={vehicles}
            value={selectedVehicleIds}
            onChange={onVehicleChange}
          />
          <PeriodSelector selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
        </div>
      </div>
    </div>
  );
}