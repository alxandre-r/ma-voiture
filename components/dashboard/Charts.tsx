// app/components/dashboard/Charts/index.tsx
"use client";

import React from "react";
import FillChart from "./charts/FillChart";
import OdometerChart from "./charts/OdometerChart";

type VehicleForChart = {
  vehicleId: string;
  vehicleName: string;
  color: string;
  points: {
    date: string;
    odometer: number;
    amount: number;
  }[];
};

type ChartsProps = {
  vehiclesForChart: VehicleForChart[];
};

export default function Charts({ vehiclesForChart }: ChartsProps) {
  if (!vehiclesForChart.length) return null;

  return (
    <>
      <FillChart vehicles={vehiclesForChart} />
      <OdometerChart vehicles={vehiclesForChart} />
    </>
  );
}
